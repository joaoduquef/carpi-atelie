// Dados públicos da loja. Edite aqui para mudar o que aparece no rodapé e nas páginas de contato.

import { normalizarUrl } from "@/lib/url";

export const LOJA = {
  nome: "CARPI Ateliê",
  dominio: "carpiatelie.com.br",
  url: normalizarUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://www.carpiatelie.com.br"),
  /**
   * false enquanto o pagamento de verdade não estiver pronto (Fase 4): a sacola mostra
   * "Vendas abrem em breve" no lugar de "Finalizar compra". Troque para true para abrir as vendas.
   */
  vendasAbertas: true,
  /** Prazo de produção de todas as peças, em dias úteis (vale no site todo, acima do que estiver no banco). */
  prazoProducaoDias: 5,
  /** Entrega (Fase 3). O frete é sempre calculado no servidor. */
  envio: {
    /** CEP de onde as peças saem (Belo Horizonte, MG). Sem o token do Melhor Envio, o frete é simulado. */
    cepOrigem: "31330680",
    /** "todas": a cliente escolhe entre as opções (até 4); "mais_barata": mostra só a mais barata. */
    opcoes: "todas" as "todas" | "mais_barata",
    /** esconde as opções em que a cliente busca o pacote num ponto de retirada (ex.: "Loggi Ponto") */
    soEntregaNoEndereco: true,
    /** Sudeste (SP, RJ, MG, ES): a opção mais barata sai grátis; nas outras, a cliente paga só a diferença. Desligado: agora o desconto é o cupom FRETEQUINZE. */
    freteGratisSudeste: { ativo: false, minimoCentavos: 0 },
  },
  email: "carpiatelie@gmail.com",
  instagram: "carpiatelie",
  razaoSocial: "69.666.538 JOAO DUQUE DA SILVA FILHO",
  cnpj: "69.666.538/0001-36",
  /** faixa do topo: as mensagens se alternam a cada 5 segundos (href = link ao clicar) */
  anuncios: [
    { texto: "Cupom FRETEQUINZE para desconto no frete em todas as regiões" },
    { texto: "Inscreva-se na nossa newsletter!", href: "#newsletter" },
  ],
  /** aparece na página de todos os produtos, embaixo dos cards de "Como funciona" */
  avisoImpressao:
    "Como cada abajur é produzido sob encomenda, camada por camada, ele pode ter pequenas marcas e variações da impressão. Elas não são defeitos: são o registro de uma peça feita uma a uma, só para você.",
  titulo: "CARPI Ateliê | Abajures feitos com carinho",
  descricao:
    "Abajures de design autoral, feitos sob encomenda no CARPI Ateliê. Cupom FRETEQUINZE: R$ 15 de desconto no frete para todas as regiões.",
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
