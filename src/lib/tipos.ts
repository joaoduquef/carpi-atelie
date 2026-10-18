// Tipos do catálogo. Espelham as tabelas planejadas para o Supabase (Fase 2).

export type CorSlug = "mare" | "damasco" | "roma";

export type Cor = {
  slug: CorSlug;
  nome: string; // "Maré"
  /** cor do próprio abajur (bolinhas do seletor, brilho no modo noite) */
  hex: string;
  /** classe de fundo do card/galeria para esta cor */
  fundo: "bg-bloco-mare" | "bg-bloco-damasco" | "bg-bloco-rosa";
};

export type StatusModelo = "ativo" | "em_breve" | "inativo";

export type TipoImagem = "apagado" | "aceso" | "ambiente" | "desenho_tecnico";

export type Imagem = {
  tipo: TipoImagem;
  url: string;
  alt: string;
  /** null = vale para todas as cores do modelo */
  cor: CorSlug | null;
};

export type Variacao = {
  id: string; // ex.: "babi-mare"
  modeloSlug: string;
  cor: CorSlug;
  sku: string;
  estoque: number;
  ativo: boolean;
};

export type Especificacao = { rotulo: string; valor: string };

export type Modelo = {
  slug: string;
  nome: string; // "Babi"
  descricao: string;
  /** preço em centavos; null enquanto o modelo está "em breve" */
  precoCentavos: number | null;
  status: StatusModelo;
  especificacoes: Especificacao[];
  prazoProducaoDias: number;
  embalagem: { pesoKg: number; larguraCm: number; alturaCm: number; comprimentoCm: number };
  ordem: number;
};

export type ItemSacola = { variacaoId: string; quantidade: number };
