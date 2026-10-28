// Catálogo fictício, usado só enquanto o Supabase não estiver configurado
// (por exemplo, no link de teste da Vercel antes de colar as chaves).
import { foto } from "@/lib/fotos";
import type { Catalogo, Cor, Imagem, Modelo, Variacao } from "@/lib/tipos";

const cores: Cor[] = [
  { slug: "mare", nome: "Maré", hex: "#7FB4D2", fundo: "bloco-mare", ordem: 1 },
  { slug: "damasco", nome: "Damasco", hex: "#F29A4E", fundo: "bloco-damasco", ordem: 2 },
  { slug: "roma", nome: "Romã", hex: "#E8708B", fundo: "bloco-rosa", ordem: 3 },
];

// caixa da Babi embalada: 25 × 25 cm de base, 35 cm de altura, 650 g no total
const embalagem = { pesoKg: 0.65, larguraCm: 25, alturaCm: 35, comprimentoCm: 25 };

const modelos: Modelo[] = [
  {
    slug: "babi",
    nome: "Babi",
    descricao:
      "Um abajur de saia ondulada, feito para ser visto mesmo quando apagado. A cúpula translúcida ganha outra vida quando acesa, espalhando uma luz quente e suave pelo ambiente.\n\nAcompanha parte elétrica e lâmpada, pronto para iluminar seu espaço.",
    precoCentavos: 29900,
    status: "ativo",
    especificacoes: [
      { rotulo: "Altura", valor: "30,6 cm" },
      { rotulo: "Largura", valor: "21,7 cm (saia ondulada); base com Ø 12 cm" },
      { rotulo: "Material", valor: "PETG translúcido" },
      { rotulo: "Lâmpada", valor: "LED 6 W, 3000 K (luz quente), bivolt, inclusa" },
      { rotulo: "Peso", valor: "Aproximadamente 550 a 700 g" },
      { rotulo: "Produção", valor: "Feito sob encomenda em 5 dias úteis" },
    ],
    prazoProducaoDias: 5,
    embalagem,
    ordem: 1,
  },
  ...(["Isa", "Manu"] as const).map(
    (nome, i): Modelo => ({
      slug: nome.toLowerCase(),
      nome,
      descricao: "Novo modelo da CARPI, nas cores Maré, Damasco e Romã.",
      precoCentavos: null,
      status: "em_breve",
      especificacoes: [],
      prazoProducaoDias: 5,
      embalagem,
      ordem: i + 2,
    }),
  ),
];

const variacoes: Variacao[] = modelos.flatMap((m) =>
  cores.map((c) => ({
    id: `${m.slug}-${c.slug}`,
    modeloSlug: m.slug,
    cor: c.slug,
    sku: `${m.slug}-${c.slug}`.toUpperCase(),
    estoque: m.status === "ativo" ? 10 : 0,
    ativo: m.status === "ativo",
  })),
);

const imagens: Imagem[] = [
  ...cores.flatMap((c): Imagem[] =>
    (["apagado", "aceso"] as const).map((tipo) => ({
      modeloSlug: "babi",
      cor: c.slug,
      tipo,
      url: foto(`/products/babi/${c.slug}-${tipo}.png`),
      alt: `Abajur Babi ${c.nome} ${tipo}`,
      ordem: c.ordem,
    })),
  ),
  { modeloSlug: "babi", cor: null, tipo: "ambiente", url: foto("/products/babi/ambiente-1.jpg"), alt: "Abajur Babi rosa sobre uma escrivaninha de madeira", ordem: 10 },
  {
    modeloSlug: "babi",
    cor: null,
    tipo: "desenho_tecnico",
    url: foto("/products/babi/desenho-tecnico.png"),
    alt: "Desenho técnico do abajur Babi com medidas",
    ordem: 20,
  },
];

export const CATALOGO_FICTICIO: Catalogo = {
  cores,
  modelos,
  variacoes,
  imagens,
  disponivel: Object.fromEntries(variacoes.filter((v) => v.ativo).map((v) => [v.id, v.estoque])),
};
