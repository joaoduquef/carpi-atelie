import "server-only";
import { CUPONS } from "@/config/cupons";
import { validarCupomDemo } from "@/lib/cupons";
import { formatarReais } from "@/lib/dinheiro";
import { supabaseAdmin } from "@/lib/supabase/servidor";

export type CupomValido = {
  codigo: string;
  /** "produtos": desconto no subtotal; "frete": desconto no frete (calculado depois que o frete é escolhido) */
  aplicaEm: "produtos" | "frete";
  tipo: "percentual" | "fixo";
  valor: number;
};
export type ResultadoCupom = CupomValido | { erro: string };

/** Desconto do cupom sobre uma base (subtotal dos produtos ou valor do frete), nunca maior que a base. */
export function descontoDoCupom(c: CupomValido, baseCentavos: number): number {
  return Math.min(baseCentavos, c.tipo === "percentual" ? Math.round((baseCentavos * c.valor) / 100) : c.valor);
}

/** Confere o cupom no banco (criado no painel, Fase 5). O desconto é calculado com descontoDoCupom. */
export async function validarCupom(codigoBruto: string, subtotalCentavos: number): Promise<ResultadoCupom> {
  const codigo = codigoBruto.trim().toUpperCase();
  if (!codigo) return { erro: "Digite o código do cupom." };

  // cupons do código (src/config/cupons.ts)
  const doCodigo = CUPONS.find((c) => c.codigo === codigo);
  if (doCodigo) {
    if (!doCodigo.ativo) return { erro: "Este cupom não está mais valendo." };
    return { codigo: doCodigo.codigo, aplicaEm: doCodigo.aplicaEm, tipo: doCodigo.tipo, valor: doCodigo.valor };
  }

  const sb = supabaseAdmin();
  if (!sb) {
    // sem o Supabase: só o cupom de teste
    const r = validarCupomDemo(codigo, subtotalCentavos);
    return "erro" in r ? r : { codigo: r.cupom.codigo, aplicaEm: r.cupom.aplicaEm ?? "produtos", tipo: r.cupom.tipo, valor: r.cupom.valor };
  }

  const campos = "codigo, tipo, valor, valido_de, valido_ate, limite_usos, usos, valor_minimo_centavos, ativo";
  let { data: c, error } = await sb.from("cupons").select(`${campos}, aplica_em`).eq("codigo", codigo).maybeSingle();
  if (error?.message.includes("aplica_em")) {
    // banco ainda sem o arquivo 20261030000003_cupom_frete.sql: todos os cupons valem nos produtos
    ({ data: c, error } = await sb.from("cupons").select(campos).eq("codigo", codigo).maybeSingle());
  }
  if (error) {
    console.error("[cupom] falha ao ler o cupom", error.message);
    return { erro: "Não conseguimos conferir o cupom agora. Tente de novo em instantes." };
  }

  const agora = Date.now();
  if (!c || !c.ativo) return { erro: "Cupom não encontrado. Confira se digitou certinho." };
  if (c.valido_de && new Date(c.valido_de).getTime() > agora) return { erro: "Este cupom ainda não está valendo." };
  if (c.valido_ate && new Date(c.valido_ate).getTime() < agora) return { erro: "Este cupom já expirou." };
  if (c.limite_usos !== null && c.usos >= c.limite_usos) return { erro: "Este cupom já atingiu o limite de usos." };
  if (subtotalCentavos < c.valor_minimo_centavos)
    return { erro: `Este cupom vale para compras a partir de ${formatarReais(c.valor_minimo_centavos)}.` };

  return { codigo: c.codigo, aplicaEm: c && "aplica_em" in c && c.aplica_em === "frete" ? "frete" : "produtos", tipo: c.tipo, valor: c.valor };
}

/**
 * O pedido guarda o código do cupom ligado à tabela de cupons do banco. Para os cupons do código,
 * cria a linha no banco na primeira vez em que são usados (o desconto continua vindo do código).
 */
export async function garantirCupomNoBanco(codigo: string): Promise<void> {
  const c = CUPONS.find((x) => x.codigo === codigo);
  const sb = supabaseAdmin();
  if (!c || !sb) return;
  const linha = { codigo: c.codigo, tipo: c.tipo, valor: c.valor };
  let { error } = await sb.from("cupons").upsert({ ...linha, aplica_em: c.aplicaEm }, { onConflict: "codigo", ignoreDuplicates: true });
  if (error?.message.includes("aplica_em")) ({ error } = await sb.from("cupons").upsert(linha, { onConflict: "codigo", ignoreDuplicates: true }));
  if (error) console.error("[cupom] falha ao registrar o cupom no banco", error.message);
}
