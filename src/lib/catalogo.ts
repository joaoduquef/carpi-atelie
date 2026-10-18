// Consultas ao catálogo. São funções puras sobre um objeto Catalogo, então funcionam
// tanto no servidor (carregarCatalogo) quanto no navegador (useCatalogo).
import type { Catalogo, Cor, CorSlug, Imagem, Modelo, Variacao } from "@/lib/tipos";

export type ProdutoCard = {
  variacao: Variacao;
  modelo: Modelo;
  cor: Cor;
  imagemApagado: Imagem;
  imagemAceso: Imagem;
  disponivel: number;
};

// Classes escritas por extenso para o Tailwind encontrá-las.
const FUNDOS: Record<string, string> = {
  "bloco-mare": "bg-bloco-mare",
  "bloco-damasco": "bg-bloco-damasco",
  "bloco-rosa": "bg-bloco-rosa",
  "bloco-amarelo": "bg-bloco-amarelo",
};

export function classeFundo(cor: Cor | undefined): string {
  return (cor && FUNDOS[cor.fundo]) || "bg-superficie";
}

export function listarCores(cat: Catalogo): Cor[] {
  return [...cat.cores].sort((a, b) => a.ordem - b.ordem);
}

export function buscarCor(cat: Catalogo, slug: CorSlug): Cor | undefined {
  return cat.cores.find((c) => c.slug === slug);
}

export function nomeCor(cat: Catalogo, slug: CorSlug): string {
  return buscarCor(cat, slug)?.nome ?? slug;
}

export function listarModelos(cat: Catalogo): Modelo[] {
  return cat.modelos.filter((m) => m.status !== "inativo").sort((a, b) => a.ordem - b.ordem);
}

export function buscarModelo(cat: Catalogo, slug: string): Modelo | undefined {
  return cat.modelos.find((m) => m.slug === slug && m.status !== "inativo");
}

export function buscarVariacao(cat: Catalogo, id: string): Variacao | undefined {
  return cat.variacoes.find((v) => v.id === id);
}

export function imagensDoModelo(cat: Catalogo, slug: string): Imagem[] {
  return cat.imagens.filter((i) => i.modeloSlug === slug).sort((a, b) => a.ordem - b.ordem);
}

export function imagemDa(cat: Catalogo, slug: string, cor: CorSlug, tipo: "apagado" | "aceso"): Imagem | undefined {
  return cat.imagens.find((i) => i.modeloSlug === slug && i.tipo === tipo && i.cor === cor);
}

/** Cores à venda de um modelo, na ordem do catálogo. */
export function coresDoModelo(cat: Catalogo, slug: string): Cor[] {
  return listarCores(cat).filter((c) => cat.variacoes.some((v) => v.modeloSlug === slug && v.cor === c.slug && v.ativo));
}

export function produtoCard(cat: Catalogo, variacao: Variacao): ProdutoCard | undefined {
  const modelo = buscarModelo(cat, variacao.modeloSlug);
  const cor = buscarCor(cat, variacao.cor);
  const apagado = imagemDa(cat, variacao.modeloSlug, variacao.cor, "apagado");
  const aceso = imagemDa(cat, variacao.modeloSlug, variacao.cor, "aceso");
  if (!modelo || !cor || !apagado || !aceso) return undefined;
  return { variacao, modelo, cor, imagemApagado: apagado, imagemAceso: aceso, disponivel: cat.disponivel[variacao.id] ?? 0 };
}

/** Variações à venda (modelos ativos), na ordem do catálogo. */
export function listarProdutos(cat: Catalogo, cor?: CorSlug): ProdutoCard[] {
  const ordemCor = (slug: string) => buscarCor(cat, slug)?.ordem ?? 99;
  return listarModelos(cat)
    .filter((m) => m.status === "ativo")
    .flatMap((m) =>
      cat.variacoes
        .filter((v) => v.modeloSlug === m.slug && v.ativo && (!cor || v.cor === cor))
        .sort((a, b) => ordemCor(a.cor) - ordemCor(b.cor)),
    )
    .map((v) => produtoCard(cat, v))
    .filter((p): p is ProdutoCard => Boolean(p));
}

export function listarEmBreve(cat: Catalogo): Modelo[] {
  return listarModelos(cat).filter((m) => m.status === "em_breve");
}

export function ehCorValida(cat: Catalogo, valor: string | undefined): valor is CorSlug {
  return Boolean(valor && cat.cores.some((c) => c.slug === valor));
}

export function urlProduto(modeloSlug: string, cor: CorSlug): string {
  return `/produto/${modeloSlug}?cor=${cor}`;
}
