"use server";

import { calcularParcelas, PIX_DESCONTO } from "@/lib/dinheiro";
import { dentroDoLimite } from "@/lib/limite";
import { chavePublica, cobrarCartao, criarPix, ErroPagBank, pagbankConfigurado, parcelasPagBank, type PlanoParcela } from "@/lib/pagamento/pagbank";
import { baseCartao, confirmarSePago, dadosCompra, lerPedido, type PedidoPagamento } from "@/lib/pagamento/servico";
import { supabaseAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import { cpfValido, soDigitos } from "@/lib/validacao";

type Erro = { erro: string };

/** Só a dona do pedido mexe nele, e só enquanto ele aguarda pagamento. */
async function pedidoDaCliente(pedidoId: string): Promise<Erro | { pedido: PedidoPagamento; usuarioId: string; ehAdmin: boolean }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Entre na sua conta para pagar." };
  const pedido = await lerPedido(pedidoId);
  if (!pedido || pedido.perfilId !== usuario.id) return { erro: "Pedido não encontrado." };
  return { pedido, usuarioId: usuario.id, ehAdmin: usuario.papel === "admin" };
}

function mensagemPagBank(e: unknown): string {
  console.error("[pagamento] erro no PagBank", e instanceof ErroPagBank ? e.message : e);
  if (e instanceof ErroPagBank) return `Não conseguimos falar com o PagBank agora. Tente de novo em instantes. (código: ${e.status}, ${e.detalhe.slice(0, 160)})`;
  return "Não conseguimos falar com o PagBank agora. Tente de novo em instantes. (código: sem conexão)";
}

// ------------------------------------------------------------------ trocar Pix ↔ cartão

/** Recalcula o total para a nova forma de pagamento (o desconto do Pix só vale no Pix). */
export async function trocarForma(pedidoId: string, forma: "pix" | "cartao"): Promise<Erro | { ok: true }> {
  const acesso = await pedidoDaCliente(pedidoId);
  if ("erro" in acesso) return acesso;
  const { pedido } = acesso;
  if (pedido.status !== "aguardando_pagamento") return { erro: "Este pedido não está mais aguardando pagamento." };
  const produtos = pedido.subtotal - pedido.descontoCupom;
  const descontoPix = forma === "pix" ? Math.round(produtos * PIX_DESCONTO) : 0;
  const { error } = await supabaseAdmin()!
    .from("pedidos")
    .update({ forma_pagamento: forma, desconto_pix_centavos: descontoPix, juros_centavos: 0, parcelas: 1, total_centavos: produtos - descontoPix + pedido.frete })
    .eq("id", pedido.id)
    .eq("status", "aguardando_pagamento");
  return error ? { erro: "Não conseguimos trocar a forma de pagamento agora." } : { ok: true };
}

// ------------------------------------------------------------------ Pix

export async function gerarPix(pedidoId: string): Promise<Erro | { copiaECola: string; imagemQr: string | null; expiraEm: string }> {
  const acesso = await pedidoDaCliente(pedidoId);
  if ("erro" in acesso) return acesso;
  const { pedido, usuarioId } = acesso;
  if (pedido.status !== "aguardando_pagamento") return { erro: "Este pedido não está mais aguardando pagamento." };
  if (pedido.forma !== "pix") return { erro: "Escolha o Pix para gerar o código." };
  if (!pagbankConfigurado()) return { erro: "O pagamento ainda não está ligado (falta o token do PagBank)." };

  const sb = supabaseAdmin()!;
  // reaproveita o Pix ainda válido deste pedido, com o mesmo valor
  const { data: existente } = await sb
    .from("pagamentos")
    .select("pix_copia_e_cola, pix_qr_code, expira_em, valor_centavos")
    .eq("pedido_id", pedido.id)
    .eq("metodo", "pix")
    .gt("expira_em", new Date(Date.now() + 60_000).toISOString())
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existente?.pix_copia_e_cola && existente.valor_centavos === pedido.total)
    return { copiaECola: existente.pix_copia_e_cola, imagemQr: existente.pix_qr_code, expiraEm: existente.expira_em };

  if (!(await dentroDoLimite(`pix:${usuarioId}`, 10, 60 * 60))) return { erro: "Muitas tentativas seguidas. Espere alguns minutos." };
  try {
    const pix = await criarPix(dadosCompra(pedido, pedido.total));
    const { error: erroGravar } = await sb.from("pagamentos").insert({
      pedido_id: pedido.id,
      provedor: "pagbank",
      id_externo: pix.idExterno,
      metodo: "pix",
      status: "WAITING",
      valor_centavos: pedido.total,
      pix_qr_code: pix.imagemQr,
      pix_copia_e_cola: pix.copiaECola,
      expira_em: pix.expiraEm,
    });
    if (erroGravar) {
      console.error("[pagamento] falha ao gravar o Pix", erroGravar.message);
      return { erro: "Não conseguimos registrar o Pix agora. Tente de novo em instantes." };
    }
    return { copiaECola: pix.copiaECola, imagemQr: pix.imagemQr, expiraEm: pix.expiraEm };
  } catch (e) {
    return { erro: mensagemPagBank(e) };
  }
}

// ------------------------------------------------------------------ cartão

export async function chaveCartao(): Promise<Erro | { chave: string }> {
  if (!pagbankConfigurado()) return { erro: "O pagamento ainda não está ligado (falta o token do PagBank)." };
  try {
    return { chave: await chavePublica() };
  } catch (e) {
    return { erro: mensagemPagBank(e) };
  }
}

async function planos(pedido: PedidoPagamento, bin: string): Promise<PlanoParcela[]> {
  const base = baseCartao(pedido);
  if (pagbankConfigurado() && /^\d{6}$/.test(bin)) {
    try {
      const p = await parcelasPagBank(base, bin);
      if (p.length) return p;
    } catch (e) {
      console.error("[pagamento] falha ao calcular parcelas no PagBank", e instanceof ErroPagBank ? e.message : e);
    }
  }
  return calcularParcelas(base).map((p) => ({ vezes: p.vezes, valorParcelaCentavos: p.valorParcela, totalCentavos: p.total, semJuros: p.semJuros }));
}

/** Parcelas para o cartão digitado (pelos 6 primeiros números, que não são dado sensível). */
export async function parcelasCartao(pedidoId: string, bin: string): Promise<Erro | { parcelas: PlanoParcela[] }> {
  const acesso = await pedidoDaCliente(pedidoId);
  if ("erro" in acesso) return acesso;
  return { parcelas: await planos(acesso.pedido, soDigitos(bin).slice(0, 6)) };
}

export async function pagarCartao(
  pedidoId: string,
  dados: { criptografado: string; bin: string; titularNome: string; titularCpf: string; parcelas: number },
): Promise<Erro | { pago: boolean; mensagem: string }> {
  const acesso = await pedidoDaCliente(pedidoId);
  if ("erro" in acesso) return acesso;
  const { pedido, usuarioId } = acesso;
  if (pedido.status !== "aguardando_pagamento") return { erro: "Este pedido não está mais aguardando pagamento." };
  if (pedido.forma !== "cartao") return { erro: "Escolha o cartão para pagar com cartão." };
  if (!pagbankConfigurado()) return { erro: "O pagamento ainda não está ligado (falta o token do PagBank)." };
  if (!(await dentroDoLimite(`cartao:${usuarioId}`, 6, 60 * 60))) return { erro: "Muitas tentativas seguidas. Espere um pouco ou use o Pix." };

  const titularNome = String(dados.titularNome ?? "").trim().slice(0, 60);
  const titularCpf = soDigitos(String(dados.titularCpf ?? ""));
  if (titularNome.length < 3) return { erro: "Digite o nome impresso no cartão." };
  if (!cpfValido(titularCpf)) return { erro: "CPF do titular do cartão inválido." };
  if (typeof dados.criptografado !== "string" || dados.criptografado.length < 50) return { erro: "Confira os dados do cartão." };

  // o valor das parcelas é calculado aqui de novo, não vem do navegador
  const plano = (await planos(pedido, soDigitos(dados.bin).slice(0, 6))).find((p) => p.vezes === Math.floor(dados.parcelas));
  if (!plano) return { erro: "Escolha o número de parcelas." };
  const total = plano.totalCentavos;
  const sb = supabaseAdmin()!;
  await sb
    .from("pedidos")
    .update({ parcelas: plano.vezes, juros_centavos: total - baseCartao(pedido), total_centavos: total })
    .eq("id", pedido.id)
    .eq("status", "aguardando_pagamento");

  try {
    const r = await cobrarCartao(dadosCompra({ ...pedido, total }, total), { criptografado: dados.criptografado, titularNome, titularCpf, parcelas: plano.vezes });
    const { error: erroGravar } = await sb
      .from("pagamentos")
      .insert({ pedido_id: pedido.id, provedor: "pagbank", id_externo: r.idExterno, metodo: "cartao", status: r.status, valor_centavos: total });
    // a cobrança já aconteceu no PagBank: mesmo sem o registro, seguimos e deixamos o erro nos logs
    if (erroGravar) console.error("[pagamento] falha ao gravar o pagamento do cartão", r.idExterno, erroGravar.message);
    if (r.status === "PAID") {
      await confirmarSePago(pedido.id, r.idExterno);
      return { pago: true, mensagem: "Pagamento aprovado!" };
    }
    if (r.status === "IN_ANALYSIS" || r.status === "AUTHORIZED") return { pago: false, mensagem: "Pagamento em análise pelo banco. Avisamos por e-mail assim que for aprovado." };
    return { erro: `Pagamento recusado${r.motivo ? `: ${r.motivo}` : ""}. Confira os dados, tente outro cartão ou pague com Pix.` };
  } catch (e) {
    return { erro: mensagemPagBank(e) };
  }
}

// ------------------------------------------------------------------ situação

/** A tela pergunta de tempos em tempos se o pagamento já caiu. */
export async function situacaoPagamento(pedidoId: string): Promise<Erro | { status: string }> {
  const acesso = await pedidoDaCliente(pedidoId);
  if ("erro" in acesso) return acesso;
  const { pedido } = acesso;
  if (pedido.status !== "aguardando_pagamento" || !pagbankConfigurado()) return { status: pedido.status };

  const { data: ultimo } = await supabaseAdmin()!
    .from("pagamentos")
    .select("id_externo")
    .eq("pedido_id", pedido.id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (ultimo?.id_externo) {
    try {
      if (await confirmarSePago(pedido.id, ultimo.id_externo)) return { status: "pago" };
    } catch (e) {
      console.error("[pagamento] falha ao consultar", e instanceof ErroPagBank ? e.message : e);
    }
  }
  return { status: pedido.status };
}

/** Só sem o PagBank ligado e só para administradores: marca como pago, para testar o resto da loja. */
export async function simularPagamento(pedidoId: string): Promise<Erro | { ok: true }> {
  const acesso = await pedidoDaCliente(pedidoId);
  if ("erro" in acesso) return acesso;
  if (pagbankConfigurado() || !acesso.ehAdmin) return { erro: "Não disponível." };
  const { error } = await supabaseAdmin()!.rpc("confirmar_pagamento", { p_pedido: pedidoId, p_observacao: "Pagamento simulado (teste)" });
  return error ? { erro: "Não conseguimos simular agora." } : { ok: true };
}
