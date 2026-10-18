// Dados públicos da loja. Edite aqui para mudar o que aparece no rodapé e nas páginas de contato.

export const LOJA = {
  nome: "CARPI Ateliê",
  dominio: "carpiatelie.com.br",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.carpiatelie.com.br",
  /**
   * false enquanto o pagamento de verdade não estiver pronto (Fase 4): a sacola mostra
   * "Vendas abrem em breve" no lugar de "Finalizar compra". Troque para true para abrir as vendas.
   */
  vendasAbertas: false,
  email: "carpiatelie@gmail.com",
  instagram: "carpiatelie",
  razaoSocial: "69.666.538 JOAO DUQUE DA SILVA FILHO",
  cnpj: "69.666.538/0001-36",
  anuncio: "Frete grátis para todo o Sudeste",
  titulo: "CARPI Ateliê | Abajures feitos com carinho",
  descricao:
    "Abajures de design autoral, feitos sob encomenda no CARPI Ateliê. Frete grátis para todo o Sudeste.",
  /** logos em /public/payments/<arquivo>.svg */
  meiosPagamento: [
    { nome: "Pix", arquivo: "pix" },
    { nome: "Visa", arquivo: "visa" },
    { nome: "Mastercard", arquivo: "mastercard" },
    { nome: "Elo", arquivo: "elo" },
    { nome: "American Express", arquivo: "amex" },
    { nome: "Hipercard", arquivo: "hipercard" },
  ],
} as const;

export const urlInstagram = `https://instagram.com/${LOJA.instagram}`;
