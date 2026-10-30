// Cupons da Fase 1: SIMULADOS, só para mostrar a tela. Na Fase 3 os cupons vêm
// do banco (criados no painel) e são validados no servidor.

export type Cupom = { codigo: string; tipo: "percentual" | "fixo"; valor: number; minimoCentavos: number; aplicaEm?: "produtos" | "frete" };

const CUPONS_DEMO: Cupom[] = [
  { codigo: "CARPI10", tipo: "percentual", valor: 10, minimoCentavos: 10000 },
];

export function validarCupomDemo(codigo: string, subtotal: number): { cupom: Cupom; desconto: number } | { erro: string } {
  const cupom = CUPONS_DEMO.find((c) => c.codigo === codigo.trim().toUpperCase());
  if (!cupom) return { erro: "Cupom não encontrado. Confira se digitou certinho." };
  if (subtotal < cupom.minimoCentavos) return { erro: `Este cupom vale para compras a partir de R$ ${cupom.minimoCentavos / 100}.` };
  const desconto = cupom.tipo === "percentual" ? Math.round((subtotal * cupom.valor) / 100) : Math.min(subtotal, cupom.valor);
  return { cupom, desconto };
}
