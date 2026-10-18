"use client";

import { useCatalogo } from "@/components/loja/CatalogoProvider";
import { useLoja } from "@/components/loja/LojaProvider";
import { CardProduto } from "@/components/produto/CardProduto";
import { BotaoLink } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { buscarVariacao, produtoCard, type ProdutoCard } from "@/lib/catalogo";

export function ConteudoFavoritos() {
  const cat = useCatalogo();
  const { favoritos, carregado } = useLoja();
  const produtos = favoritos
    .map((id) => {
      const v = buscarVariacao(cat, id);
      return v && produtoCard(cat, v);
    })
    .filter((p): p is ProdutoCard => Boolean(p));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <TituloSecao como="h1">Favoritos</TituloSecao>
        {produtos.length > 0 && (
          <span className="text-sm text-texto-suave">
            {produtos.length} {produtos.length === 1 ? "peça" : "peças"}
          </span>
        )}
      </div>

      {carregado && produtos.length === 0 ? (
        <div className="grid justify-items-center gap-4 rounded-bloco bg-superficie px-6 py-12 text-center">
          <p className="max-w-[44ch] text-lg">Você ainda não tem favoritos. Toque no coração de uma peça para guardá-la aqui.</p>
          <BotaoLink href="/colecao">Ver a coleção</BotaoLink>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {produtos.map((p) => (
            <CardProduto key={p.variacao.id} produto={p} />
          ))}
        </div>
      )}
      <p className="text-sm text-texto-suave">Seus favoritos ficam salvos neste aparelho. Ao entrar na sua conta, eles passam a valer em qualquer lugar.</p>
    </div>
  );
}
