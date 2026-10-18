import type { Metadata } from "next";
import Link from "next/link";
import { ehCorValida, listarCores, listarEmBreve, listarProdutos } from "@/lib/catalogo";
import { carregarCatalogo } from "@/lib/catalogo-servidor";
import { CardEmBreve } from "@/components/produto/CardEmBreve";
import { CardProduto } from "@/components/produto/CardProduto";
import { BotaoLuzes } from "@/components/luzes/BotaoLuzes";
import { TituloSecao } from "@/components/ui/TituloSecao";

export const metadata: Metadata = {
  title: "Coleção",
  description: "Abajures CARPI nas cores Maré, Damasco e Romã, feitos sob encomenda.",
};

export default async function Colecao({ searchParams }: { searchParams: Promise<{ cor?: string }> }) {
  const { cor } = await searchParams;
  const cat = await carregarCatalogo();
  const filtro = ehCorValida(cat, cor) ? cor : undefined;
  const produtos = listarProdutos(cat, filtro);
  const emBreve = filtro ? [] : listarEmBreve(cat);

  const filtros = [
    { valor: undefined, rotulo: "Todas", hex: "" },
    ...listarCores(cat).map((c) => ({ valor: c.slug, rotulo: c.nome, hex: c.hex })),
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TituloSecao como="h1">A coleção</TituloSecao>
        <BotaoLuzes className="max-sm:px-4 max-sm:py-2 max-sm:text-xs" />
      </div>

      <nav aria-label="Filtrar por cor" className="flex flex-wrap gap-2">
        {filtros.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Link
              key={f.rotulo}
              href={f.valor ? `/colecao?cor=${f.valor}` : "/colecao"}
              aria-current={ativo ? "true" : undefined}
              scroll={false}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm ${
                ativo ? "border-botao bg-botao font-bold text-botao-texto" : "border-linha bg-superficie text-texto"
              }`}
            >
              {f.valor && <span aria-hidden className="h-3.5 w-3.5 rounded-full" style={{ background: f.hex }} />}
              {f.rotulo}
            </Link>
          );
        })}
      </nav>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {produtos.map((p, i) => (
          <CardProduto key={p.variacao.id} produto={p} priority={i < 4} />
        ))}
        {emBreve.map((m) => (
          <CardEmBreve key={m.slug} modelo={m} />
        ))}
      </div>
    </div>
  );
}
