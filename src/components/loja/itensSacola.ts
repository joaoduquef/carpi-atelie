import { CORES } from "@/data/mock";
import { buscarVariacao, produtoCard, type ProdutoCard } from "@/lib/catalogo";
import type { ItemSacola } from "@/lib/tipos";

export type LinhaSacola = ProdutoCard & { quantidade: number; precoUnitario: number; subtotal: number; corHex: string };

/**
 * Junta os itens guardados no navegador com o catálogo.
 * Atenção: isto serve só para EXIBIR. O preço cobrado é sempre recalculado no servidor (Fase 3).
 */
export function montarLinhas(sacola: ItemSacola[]): LinhaSacola[] {
  return sacola.flatMap((item) => {
    const variacao = buscarVariacao(item.variacaoId);
    const card = variacao && produtoCard(variacao);
    if (!card || card.modelo.precoCentavos === null) return [];
    const preco = card.modelo.precoCentavos;
    return [{ ...card, quantidade: item.quantidade, precoUnitario: preco, subtotal: preco * item.quantidade, corHex: CORES[card.variacao.cor].hex }];
  });
}
