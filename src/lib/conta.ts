// Dados da página "Minha conta".

export type StatusPedido = "aguardando_pagamento" | "pago" | "em_producao" | "enviado" | "entregue" | "cancelado";

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_producao: "Em produção",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export type PerfilConta = {
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  exclusaoSolicitadaEm: string | null;
};

export type EnderecoConta = {
  id: string;
  apelido: string;
  destinatario: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  padrao: boolean;
};

export type PedidoConta = {
  id: string;
  numero: number;
  criadoEm: string;
  status: StatusPedido;
  totalCentavos: number;
  pagamento: string;
  codigoRastreio: string | null;
  urlRastreio: string | null;
  transportadora: string | null;
  itens: { nome: string; quantidade: number }[];
};

export type DadosConta = { perfil: PerfilConta; enderecos: EnderecoConta[]; pedidos: PedidoConta[] };

/** Conta fictícia, mostrada enquanto o Supabase não estiver configurado. */
export const CONTA_DEMO: DadosConta = {
  perfil: { nome: "Ana Souza", email: "ana@exemplo.com", cpf: "12345678909", telefone: "11987654321", exclusaoSolicitadaEm: null },
  enderecos: [
    {
      id: "demo-1",
      apelido: "Casa",
      destinatario: "Ana Souza",
      cep: "01304001",
      rua: "Rua Augusta",
      numero: "1200",
      complemento: "ap. 52",
      bairro: "Consolação",
      cidade: "São Paulo",
      uf: "SP",
      padrao: true,
    },
  ],
  pedidos: [
    {
      id: "demo-1042",
      numero: 1042,
      criadoEm: "2026-10-14T12:00:00Z",
      status: "enviado",
      totalCentavos: 28405,
      pagamento: "Pix",
      codigoRastreio: "JD123456789BR",
      urlRastreio: "https://www.jadlog.com.br/jadlog/tracking",
      transportadora: "Jadlog",
      itens: [{ nome: "Babi Damasco", quantidade: 1 }],
    },
  ],
};
