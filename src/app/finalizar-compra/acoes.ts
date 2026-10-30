"use server";

import { LOJA } from "@/config/loja";
import { calcularPedido } from "@/lib/checkout/calcular";
import { garantirCupomNoBanco } from "@/lib/checkout/cupom";
import type { EntradaPedido, EntradaResumo, RespostaPedido, Resumo } from "@/lib/checkout/tipos";
import { cepValido, limparCep } from "@/lib/frete";
import { dentroDoLimite, ipDaRequisicao } from "@/lib/limite";
import { supabaseAdmin, supabaseServidor, usuarioAtual, type Usuario } from "@/lib/supabase/servidor";
import { cpfValido, soDigitos, UFS } from "@/lib/validacao";

/** Quem pode finalizar: qualquer cliente com conta, com as vendas abertas; antes disso, só os administradores (para testar). */
async function podeComprar(): Promise<{ erro: string } | { usuario: Usuario }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Entre na sua conta para finalizar a compra." };
  if (!LOJA.vendasAbertas && usuario.papel !== "admin") return { erro: "As vendas abrem em breve." };
  return { usuario };
}

/** Resumo do pedido (itens, frete, cupom, descontos e total), sempre calculado aqui no servidor. */
export async function calcularResumo(entrada: EntradaResumo): Promise<Resumo | { erro: string }> {
  const acesso = await podeComprar();
  if ("erro" in acesso) return { erro: acesso.erro };
  if (!(await dentroDoLimite(`resumo:${acesso.usuario.id}`, 120, 10 * 60))) return { erro: "Muitas tentativas seguidas. Espere alguns minutos." };
  try {
    return (await calcularPedido(entrada)).resumo;
  } catch (e) {
    console.error("[checkout] falha ao calcular o resumo", e);
    return { erro: "Não conseguimos calcular o pedido agora. Tente de novo em instantes." };
  }
}

function texto(v: unknown, max = 120): string {
  return String(v ?? "").trim().slice(0, max);
}

/** Cria o pedido (aguardando pagamento). O pagamento de verdade entra na Fase 4. */
export async function criarPedido(entrada: EntradaPedido): Promise<RespostaPedido> {
  const acesso = await podeComprar();
  if ("erro" in acesso) return { erro: acesso.erro };
  const { usuario } = acesso;

  const ip = await ipDaRequisicao();
  if (!(await dentroDoLimite(`pedido:ip:${ip}`, 20, 60 * 60)) || !(await dentroDoLimite(`pedido:${usuario.id}`, 10, 60 * 60)))
    return { erro: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." };

  // dados da cliente e endereço
  const cliente = { nome: texto(entrada.cliente?.nome), cpf: soDigitos(texto(entrada.cliente?.cpf)), telefone: soDigitos(texto(entrada.cliente?.telefone)) };
  if (cliente.nome.length < 3) return { erro: "Digite o seu nome completo." };
  if (!cpfValido(cliente.cpf)) return { erro: "CPF inválido. Confira os números." };
  if (cliente.telefone.length < 10 || cliente.telefone.length > 11) return { erro: "Digite um celular com DDD, como (11) 98765-4321." };

  const e = entrada.endereco ?? ({} as EntradaPedido["endereco"]);
  const endereco = {
    destinatario: texto(e.destinatario) || cliente.nome,
    cep: limparCep(texto(e.cep)),
    rua: texto(e.rua),
    numero: texto(e.numero, 20),
    complemento: texto(e.complemento, 60),
    bairro: texto(e.bairro),
    cidade: texto(e.cidade),
    uf: texto(e.uf, 2).toUpperCase(),
  };
  if (!cepValido(endereco.cep)) return { erro: "Digite um CEP válido." };
  if (!endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade) return { erro: "Preencha rua, número, bairro e cidade." };
  if (!(UFS as readonly string[]).includes(endereco.uf)) return { erro: "Escolha o estado (UF)." };
  if (limparCep(entrada.cep) !== endereco.cep) return { erro: "O CEP do frete é diferente do CEP do endereço. Confira e tente de novo." };

  // tudo recalculado aqui, com os preços do banco
  let calculo;
  try {
    calculo = await calcularPedido({ ...entrada, cep: endereco.cep });
  } catch (err) {
    console.error("[checkout] falha ao calcular o pedido", err);
    return { erro: "Não conseguimos calcular o pedido agora. Tente de novo em instantes." };
  }
  const { resumo, freteEscolhido } = calculo;
  if (resumo.problemas.length) return { erro: resumo.problemas[0] };
  if (resumo.erroCupom) return { erro: resumo.erroCupom };
  if (!freteEscolhido) return { erro: resumo.erroFrete ?? "Escolha uma opção de entrega." };
  // no site publicado, nunca cobra frete de exemplo (acontece só se o token do Melhor Envio sumir)
  if (resumo.frete?.simulado && process.env.VERCEL_ENV === "production") {
    console.error("[checkout] frete simulado no site publicado: confira MELHOR_ENVIO_TOKEN na Vercel");
    return { erro: "Não conseguimos calcular o frete agora. Tente de novo em instantes ou fale com a gente pelo e-mail." };
  }
  if (entrada.freteId && freteEscolhido.id !== entrada.freteId) return { erro: "As opções de entrega mudaram. Escolha de novo." };

  const sb = supabaseAdmin();
  if (!sb) return { erro: "Demonstração: os pedidos passam a ser registrados quando o Supabase estiver configurado." };

  if (resumo.cupom) await garantirCupomNoBanco(resumo.cupom.codigo);
  const parcelas = entrada.pagamento === "cartao" ? Math.min(12, Math.max(1, Math.floor(entrada.parcelas) || 1)) : 1;
  const { data, error } = await sb.rpc("criar_pedido", {
    p: {
      perfil_id: usuario.id,
      itens: resumo.linhas.map((l) => ({ variacao_id: l.variacaoId, nome: l.nome, preco_unitario: l.precoUnitarioCentavos, quantidade: l.quantidade })),
      subtotal: resumo.subtotalCentavos,
      desconto_cupom: resumo.cupom && !resumo.cupom.noFrete ? resumo.cupom.descontoCentavos : 0,
      desconto_pix: resumo.descontoPixCentavos,
      // cupom de frete: grava o frete já com o desconto (assim Pix, cartão e troca de forma de pagamento continuam certos)
      frete_cobrado: freteEscolhido.cobradoCentavos - (resumo.cupom?.noFrete ? resumo.cupom.descontoCentavos : 0),
      frete_custo: freteEscolhido.custoCentavos,
      juros: resumo.jurosCentavos,
      total: resumo.totalCentavos,
      forma_pagamento: entrada.pagamento === "cartao" ? "cartao" : "pix",
      parcelas,
      cupom_codigo: resumo.cupom?.codigo ?? "",
      cliente: { ...cliente, email: usuario.email },
      endereco,
      transportadora: freteEscolhido.transportadora,
      servico_frete: `${freteEscolhido.servico} (${freteEscolhido.id})`,
      prazo_min: freteEscolhido.prazoMin,
      prazo_max: freteEscolhido.prazoMax,
    },
  });
  if (error) {
    if (error.message.includes("estoque_insuficiente")) return { erro: "Uma das peças acabou de esgotar. Confira a sacola e tente de novo." };
    if (error.message.includes("cupom_esgotado")) return { erro: "Este cupom atingiu o limite de usos. Tire o cupom para continuar." };
    console.error("[checkout] falha ao criar o pedido", error.message);
    return { erro: "Não conseguimos registrar o pedido agora. Tente de novo em instantes." };
  }

  // salva o endereço e completa o perfil (com a sessão da cliente: as regras do banco valem)
  const sbCliente = await supabaseServidor();
  if (sbCliente) {
    if (entrada.salvarEndereco) {
      const { count } = await sbCliente.from("enderecos").select("id", { count: "exact", head: true }).eq("perfil_id", usuario.id);
      await sbCliente.from("enderecos").insert({ perfil_id: usuario.id, apelido: "Entrega", ...endereco, complemento: endereco.complemento || null, padrao: !count });
    }
    await sbCliente.from("perfis").update({ cpf: cliente.cpf, telefone: cliente.telefone }).eq("id", usuario.id);
  }

  const criado = data as { id: string; numero: number };
  return { id: criado.id, numero: criado.numero };
}
