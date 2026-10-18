// Todos os valores em dinheiro circulam em centavos (inteiros).

const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 29900 → "R$ 299,00" (com espaço comum, para não quebrar layout) */
export function formatarReais(centavos: number): string {
  return formatador.format(centavos / 100).replace(/ /g, " ");
}

export const PIX_DESCONTO = 0.05;

export function precoPix(centavos: number): number {
  return Math.round(centavos * (1 - PIX_DESCONTO));
}

/**
 * Juros de EXEMPLO para a Fase 1 (2,99% a.m., tabela Price).
 * Na Fase 4 as parcelas passam a vir do intermediador de pagamento.
 */
export const JUROS_MENSAL_EXEMPLO = 0.0299;
export const MAX_PARCELAS = 12;

export type Parcela = { vezes: number; valorParcela: number; total: number; semJuros: boolean };

export function calcularParcelas(centavos: number, taxa = JUROS_MENSAL_EXEMPLO): Parcela[] {
  return Array.from({ length: MAX_PARCELAS }, (_, i) => {
    const n = i + 1;
    if (n === 1) return { vezes: 1, valorParcela: centavos, total: centavos, semJuros: true };
    const valorParcela = Math.round((centavos * taxa) / (1 - Math.pow(1 + taxa, -n)));
    return { vezes: n, valorParcela, total: valorParcela * n, semJuros: false };
  });
}
