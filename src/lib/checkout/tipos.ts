// Tipos da finalização da compra, usados pela tela e pelo servidor.
// A tela só EXIBE estes valores: quem calcula é sempre o servidor (calcular.ts).

import type { ItemSacola } from "@/lib/tipos";

export type FormaPagamento = "pix" | "cartao";

export type EntradaResumo = {
  itens: ItemSacola[];
  cep: string;
  freteId?: string;
  cupom?: string;
  pagamento: FormaPagamento;
  parcelas: number;
};

export type LinhaResumo = { variacaoId: string; nome: string; quantidade: number; precoUnitarioCentavos: number; subtotalCentavos: number };

export type OpcaoFreteResumo = {
  id: string;
  transportadora: string;
  servico: string;
  cobradoCentavos: number;
  /** prazo total = produção + transportadora */
  prazoMin: number;
  prazoMax: number;
};

export type ParcelaResumo = { vezes: number; valorParcelaCentavos: number; totalCentavos: number; semJuros: boolean };

export type Resumo = {
  linhas: LinhaResumo[];
  subtotalCentavos: number;
  cupom: { codigo: string; descontoCentavos: number } | null;
  erroCupom: string | null;
  frete: { opcoes: OpcaoFreteResumo[]; escolhidaId: string | null; simulado: boolean } | null;
  erroFrete: string | null;
  descontoPixCentavos: number;
  jurosCentavos: number;
  parcelas: ParcelaResumo[];
  totalCentavos: number;
  /** problemas com os itens (peça esgotada, sem preço...) que impedem o pedido */
  problemas: string[];
};

export type DadosCliente = { nome: string; cpf: string; telefone: string };

export type EnderecoEntrega = {
  destinatario: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type EntradaPedido = EntradaResumo & {
  cliente: DadosCliente;
  endereco: EnderecoEntrega;
  /** salvar o endereço novo em Minha conta */
  salvarEndereco: boolean;
};

export type RespostaPedido = { erro: string } | { id: string; numero: number };
