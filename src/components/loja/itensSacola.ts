import { buscarVariacao, produtoCard, type ProdutoCard } from "@/lib/catalogo";
import type { Catalogo, ItemSacola } from "@/lib/tipos";

export type LinhaSacola = ProdutoCard & { quantidade: number; precoUnitario: number; subtotal: number };

/**
 * Junta os itens da sacola com o catálogo.
 * Atenção: isto serve só para EXIBIR. O preço cobrado é sempre recalculado no servidor (Fase 3).
 */
export function montarLinhas(cat: Catalogo, sacola: ItemSacola[]): LinhaSacola[] {
  return sacola.flatMap((item) => {
    const variacao = buscarVariacao(cat, item.variacaoId);
    const card = variacao && produtoCard(cat, variacao);
    if (!card || card.modelo.precoCentavos === null) return [];
    const preco = card.modelo.precoCentavos;
    return [{ ...card, quantidade: item.quantidade, precoUnitario: preco, subtotal: preco * item.quantidade }];
  });
}
