import "server-only";
import { validarCupomDemo } from "@/lib/cupons";
import { formatarReais } from "@/lib/dinheiro";
import { supabaseAdmin } from "@/lib/supabase/servidor";

export type ResultadoCupom = { codigo: string; descontoCentavos: number } | { erro: string };

/** Confere o cupom no banco (criado no painel, Fase 5) e calcula o desconto sobre o subtotal dos produtos. */
export async function validarCupom(codigoBruto: string, subtotalCentavos: number): Promise<ResultadoCupom> {
  const codigo = codigoBruto.trim().toUpperCase();
  if (!codigo) return { erro: "Digite o código do cupom." };

  const sb = supabaseAdmin();
  if (!sb) {
    // sem o Supabase: só o cupom de teste
    const r = validarCupomDemo(codigo, subtotalCentavos);
    return "erro" in r ? r : { codigo: r.cupom.codigo, descontoCentavos: r.desconto };
  }

  const { data: c, error } = await sb
    .from("cupons")
    .select("codigo, tipo, valor, valido_de, valido_ate, limite_usos, usos, valor_minimo_centavos, ativo")
    .eq("codigo", codigo)
    .maybeSingle();
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

  const desconto = c.tipo === "percentual" ? Math.round((subtotalCentavos * c.valor) / 100) : Math.min(subtotalCentavos, c.valor);
  return { codigo: c.codigo, descontoCentavos: desconto };
}
