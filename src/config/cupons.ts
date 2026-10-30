/**
 * Cupons que valem no site todo, definidos aqui no código (têm prioridade sobre os do banco).
 * valor: centavos (tipo "fixo") ou porcentagem de 1 a 100 (tipo "percentual").
 * aplicaEm: "produtos" (desconto no subtotal) ou "frete" (desconto no frete).
 */
export const CUPONS: { codigo: string; tipo: "percentual" | "fixo"; valor: number; aplicaEm: "produtos" | "frete"; ativo: boolean }[] = [
  { codigo: "FRETEQUINZE", tipo: "fixo", valor: 1500, aplicaEm: "frete", ativo: true },
];
