// Dados públicos da loja. Edite aqui para mudar o que aparece no rodapé e nas páginas de contato.

export const LOJA = {
  nome: "CARPI Ateliê",
  dominio: "carpiatelie.com.br",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://carpiatelie.com.br",
  email: "carpiatelie@gmail.com",
  instagram: "carpiatelie",
  razaoSocial: "69.666.538 JOAO DUQUE DA SILVA FILHO",
  cnpj: "69.666.538/0001-36",
  anuncio: "Frete grátis para todo o Sudeste",
  titulo: "CARPI Ateliê | Abajures feitos com carinho",
  descricao:
    "Abajures de design autoral, feitos sob encomenda no CARPI Ateliê. Frete grátis para todo o Sudeste.",
  meiosPagamento: ["Pix", "Visa", "Mastercard", "Elo", "Amex", "Hipercard"],
} as const;

export const urlInstagram = `https://instagram.com/${LOJA.instagram}`;
