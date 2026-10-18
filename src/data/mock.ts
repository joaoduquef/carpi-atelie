// Dados fictícios da Fase 1. Na Fase 2 tudo isto passa a vir do Supabase.
import type { Cor, CorSlug, Imagem, Modelo, Variacao } from "@/lib/tipos";

export const CORES: Record<CorSlug, Cor> = {
  mare: { slug: "mare", nome: "Maré", hex: "#7FB4D2", fundo: "bg-bloco-mare" },
  damasco: { slug: "damasco", nome: "Damasco", hex: "#F29A4E", fundo: "bg-bloco-damasco" },
  roma: { slug: "roma", nome: "Romã", hex: "#E8708B", fundo: "bg-bloco-rosa" },
};

export const ORDEM_CORES: CorSlug[] = ["mare", "damasco", "roma"];

export const MODELOS: Modelo[] = [
  {
    slug: "babi",
    nome: "Babi",
    descricao:
      "Um abajur de saia ondulada em PETG translúcido. Apagado, é uma peça de cor; aceso, espalha uma luz quente e macia pelo ambiente.",
    precoCentavos: 29900,
    status: "ativo",
    especificacoes: [
      { rotulo: "Altura", valor: "30,6 cm" },
      { rotulo: "Largura", valor: "20,7 cm (saia ondulada); base com Ø 12 cm" },
      { rotulo: "Material", valor: "PETG translúcido" },
      { rotulo: "Lâmpada", valor: "LED 6 W, 3000 K (luz quente), bivolt, inclusa" },
      { rotulo: "Peso", valor: "Aproximadamente 550 a 700 g" },
      { rotulo: "Produção", valor: "Feito sob encomenda em 2 dias úteis" },
    ],
    prazoProducaoDias: 2,
    embalagem: { pesoKg: 0.7, larguraCm: 25, alturaCm: 35, comprimentoCm: 25 },
    ordem: 1,
  },
  {
    slug: "isa",
    nome: "Isa",
    descricao: "Novo modelo da CARPI, nas cores Maré, Damasco e Romã.",
    precoCentavos: null,
    status: "em_breve",
    especificacoes: [],
    prazoProducaoDias: 2,
    embalagem: { pesoKg: 0.7, larguraCm: 25, alturaCm: 35, comprimentoCm: 25 },
    ordem: 2,
  },
  {
    slug: "manu",
    nome: "Manu",
    descricao: "Novo modelo da CARPI, nas cores Maré, Damasco e Romã.",
    precoCentavos: null,
    status: "em_breve",
    especificacoes: [],
    prazoProducaoDias: 2,
    embalagem: { pesoKg: 0.7, larguraCm: 25, alturaCm: 35, comprimentoCm: 25 },
    ordem: 3,
  },
];

export const VARIACOES: Variacao[] = MODELOS.flatMap((m) =>
  ORDEM_CORES.map((cor) => ({
    id: `${m.slug}-${cor}`,
    modeloSlug: m.slug,
    cor,
    sku: `${m.slug.toUpperCase()}-${cor.toUpperCase()}`,
    estoque: m.status === "ativo" ? 10 : 0,
    ativo: m.status === "ativo",
  })),
);

export const IMAGENS: Record<string, Imagem[]> = {
  babi: [
    ...ORDEM_CORES.flatMap((cor): Imagem[] => [
      { tipo: "apagado", cor, url: `/products/babi/${cor}-apagado.png`, alt: `Abajur Babi ${CORES[cor].nome} apagado` },
      { tipo: "aceso", cor, url: `/products/babi/${cor}-aceso.png`, alt: `Abajur Babi ${CORES[cor].nome} aceso` },
    ]),
    { tipo: "ambiente", cor: null, url: "/products/babi/ambiente-1.jpg", alt: "Abajur Babi sobre um aparador" },
    { tipo: "desenho_tecnico", cor: null, url: "/products/babi/desenho-tecnico.png", alt: "Desenho técnico do abajur Babi com medidas" },
  ],
};
