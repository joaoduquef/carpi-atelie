import "server-only";
import { LOJA } from "@/config/loja";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { consultarPedido, type DadosCompra } from "./pagbank";

export type PedidoPagamento = {
  id: string;
  numero: number;
  perfilId: string | null;
  status: string;
  forma: "pix" | "cartao";
  parcelas: number;
  subtotal: number;
  descontoCupom: number;
  descontoPix: number;
  frete: number;
  juros: number;
  total: number;
  criadoEm: string;
  cupomCodigo: string | null;
  cliente: { nome: string; email: string; cpf: string; telefone: string };
  endereco: { destinatario: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string; cep: string };
  itens: { variacaoId: string; nome: string; quantidade: number; precoUnitario: number }[];
};

/** Lê o pedido com a chave secreta (o servidor confere o dono antes de usar). */
export async function lerPedido(id: string): Promise<PedidoPagamento | null> {
  const sb = supabaseAdmin();
  if (!sb || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data: p } = await sb
    .from("pedidos")
    .select("*, pedido_itens(variacao_id, nome, quantidade, preco_unitario_centavos)")
    .eq("id", id)
    .maybeSingle();
  if (!p) return null;
  return {
    id: p.id,
    numero: p.numero,
    perfilId: p.perfil_id,
    status: p.status,
    forma: p.forma_pagamento === "cartao" ? "cartao" : "pix",
    parcelas: p.parcelas,
    subtotal: p.subtotal_centavos,
    descontoCupom: p.desconto_cupom_centavos,
    descontoPix: p.desconto_pix_centavos,
    frete: p.frete_cobrado_centavos,
    juros: p.juros_centavos,
    total: p.total_centavos,
    criadoEm: p.criado_em,
    cupomCodigo: p.cupom_codigo,
    cliente: p.cliente,
    endereco: p.endereco,
    itens: (p.pedido_itens ?? []).map((i: { variacao_id: string; nome: string; quantidade: number; preco_unitario_centavos: number }) => ({
      variacaoId: i.variacao_id,
      nome: i.nome,
      quantidade: i.quantidade,
      precoUnitario: i.preco_unitario_centavos,
    })),
  };
}

export function dadosCompra(p: PedidoPagamento, valorCentavos: number): DadosCompra {
  return {
    referencia: p.id,
    numero: p.numero,
    cliente: p.cliente,
    itens: p.itens.map((i) => ({ id: i.variacaoId, nome: i.nome, quantidade: i.quantidade, precoUnitarioCentavos: i.precoUnitario })),
    endereco: p.endereco,
    valorCentavos,
    urlAviso: `${LOJA.url}/api/pagbank/aviso`,
  };
}

/** Valor dos produtos e do frete, sem o desconto do Pix e sem os juros: a base do cartão. */
export function baseCartao(p: PedidoPagamento): number {
  return p.subtotal - p.descontoCupom + p.frete;
}

/** Prazo para pagar: o pedido (e a reserva de estoque) vale 60 minutos depois de criado. */
export const MINUTOS_PARA_PAGAR = 60;

export function minutosRestantes(p: PedidoPagamento): number {
  return Math.floor((new Date(p.criadoEm).getTime() + MINUTOS_PARA_PAGAR * 60_000 - Date.now()) / 60_000);
}

/**
 * Marca como pago (só se o valor pago cobrir o total). Seguro chamar mais de uma vez.
 * Também trata os casos raros: pagamento que chegou depois do pedido cancelado e pagamento em dobro.
 */
export async function confirmarSePago(pedidoId: string, idExterno: string): Promise<boolean> {
  const sb = supabaseAdmin();
  if (!sb) return false;
  const pedido = await lerPedido(pedidoId);
  if (!pedido) return false;
  const jaPago = pedido.status !== "aguardando_pagamento" && pedido.status !== "cancelado";

  const situacao = await consultarPedido(idExterno);
  const { data: antes } = await sb.from("pagamentos").select("status").eq("provedor", "pagbank").eq("id_externo", idExterno).maybeSingle();
  await sb.from("pagamentos").update({ status: situacao.status }).eq("provedor", "pagbank").eq("id_externo", idExterno);
  if (situacao.status !== "PAID") return jaPago;
  if (jaPago) {
    // outro pagamento deste pedido já tinha sido aprovado: este é em dobro e precisa ser estornado
    if (antes?.status !== "PAID") console.error(`[ALERTA] pagamento em dobro no pedido ${pedido.numero} (${idExterno}): estorne no PagBank`);
    return true;
  }
  if (situacao.referencia && situacao.referencia !== pedidoId) {
    console.error("[pagamento] aviso de outro pedido", { pedidoId, idExterno, referencia: situacao.referencia });
    return false;
  }
  if (situacao.pagoCentavos < pedido.total) {
    console.error("[pagamento] valor pago menor que o total", { numero: pedido.numero, pago: situacao.pagoCentavos, total: pedido.total });
    return false;
  }
  const { error } = await sb.rpc("confirmar_pagamento", { p_pedido: pedidoId, p_observacao: `Pago no PagBank (${idExterno})` });
  if (error?.message.includes("pago_sem_estoque"))
    console.error(`[ALERTA] pedido ${pedido.numero} foi pago depois do prazo e a peça já acabou (${idExterno}): estorne no PagBank ou fale com a cliente`);
  else if (error) console.error("[pagamento] falha ao confirmar", error.message);
  return !error;
}

/** Cancela, de vez em quando, os pedidos que ficaram sem pagamento (devolve o estoque reservado). */
export async function limparVencidos() {
  const sb = supabaseAdmin();
  if (!sb) return;
  const { error } = await sb.rpc("cancelar_pedidos_vencidos", { p_minutos: 60 });
  if (error) console.error("[pagamento] falha ao cancelar vencidos", error.message);
}
