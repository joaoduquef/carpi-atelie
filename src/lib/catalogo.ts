// Funções de leitura do catálogo. Na Fase 2 passam a consultar o Supabase,
// mantendo as mesmas assinaturas para as páginas não precisarem mudar.
import { CORES, IMAGENS, MODELOS, ORDEM_CORES, VARIACOES } from "@/data/mock";
import type { CorSlug, Imagem, Modelo, Variacao } from "@/lib/tipos";

export type ProdutoCard = {
  variacao: Variacao;
  modelo: Modelo;
  imagemApagado: Imagem;
  imagemAceso: Imagem;
};

export function listarModelos(): Modelo[] {
  return MODELOS.filter((m) => m.status !== "inativo").sort((a, b) => a.ordem - b.ordem);
}

export function buscarModelo(slug: string): Modelo | undefined {
  return MODELOS.find((m) => m.slug === slug && m.status !== "inativo");
}

export function buscarVariacao(id: string): Variacao | undefined {
  return VARIACOES.find((v) => v.id === id);
}

export function imagensDoModelo(slug: string): Imagem[] {
  return IMAGENS[slug] ?? [];
}

export function imagemDa(slug: string, cor: CorSlug, tipo: "apagado" | "aceso"): Imagem | undefined {
  return imagensDoModelo(slug).find((i) => i.tipo === tipo && i.cor === cor);
}

export function produtoCard(variacao: Variacao): ProdutoCard | undefined {
  const modelo = buscarModelo(variacao.modeloSlug);
  const apagado = imagemDa(variacao.modeloSlug, variacao.cor, "apagado");
  const aceso = imagemDa(variacao.modeloSlug, variacao.cor, "aceso");
  if (!modelo || !apagado || !aceso) return undefined;
  return { variacao, modelo, imagemApagado: apagado, imagemAceso: aceso };
}

/** Variações à venda (modelos ativos), na ordem do catálogo. */
export function listarProdutos(cor?: CorSlug): ProdutoCard[] {
  return listarModelos()
    .filter((m) => m.status === "ativo")
    .flatMap((m) =>
      ORDEM_CORES.filter((c) => !cor || c === cor)
        .map((c) => VARIACOES.find((v) => v.modeloSlug === m.slug && v.cor === c && v.ativo))
        .filter((v): v is Variacao => Boolean(v)),
    )
    .map(produtoCard)
    .filter((p): p is ProdutoCard => Boolean(p));
}

export function listarEmBreve(): Modelo[] {
  return listarModelos().filter((m) => m.status === "em_breve");
}

export function nomeCor(cor: CorSlug): string {
  return CORES[cor].nome;
}

export function ehCorValida(valor: string | undefined): valor is CorSlug {
  return Boolean(valor && (ORDEM_CORES as string[]).includes(valor));
}

export function urlProduto(modeloSlug: string, cor: CorSlug): string {
  return `/produto/${modeloSlug}?cor=${cor}`;
}
