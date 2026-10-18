// Tipos do catálogo. Espelham as tabelas do Supabase (supabase/migrations).

export type CorSlug = string; // "mare", "damasco", "roma"...

export type Cor = {
  slug: CorSlug;
  nome: string; // "Maré"
  /** cor do próprio abajur (bolinhas do seletor, brilho no modo noite) */
  hex: string;
  /** classe CSS do fundo do card para esta cor (ver classeFundo em catalogo.ts) */
  fundo: string;
  ordem: number;
};

export type StatusModelo = "ativo" | "em_breve" | "inativo";

export type TipoImagem = "apagado" | "aceso" | "ambiente" | "desenho_tecnico";

export type Imagem = {
  modeloSlug: string;
  tipo: TipoImagem;
  url: string;
  alt: string;
  /** null = vale para todas as cores do modelo */
  cor: CorSlug | null;
  ordem: number;
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

export type Catalogo = {
  cores: Cor[];
  modelos: Modelo[];
  variacoes: Variacao[];
  imagens: Imagem[];
  /** unidades disponíveis por variação (estoque − reservas) */
  disponivel: Record<string, number>;
};

export type ItemSacola = { variacaoId: string; quantidade: number };
