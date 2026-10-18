// Conta fictícia para mostrar "Minha conta" na Fase 1.

export type StatusPedido = "aguardando_pagamento" | "pago" | "em_producao" | "enviado" | "entregue" | "cancelado";

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_producao: "Em produção",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const CONTA_DEMO = {
  nome: "Ana Souza",
  email: "ana@exemplo.com",
  cpf: "***.456.789-**",
  telefone: "(11) 98765-4321",
  enderecos: [
    { apelido: "Casa", linha1: "Rua Augusta, 1200, ap. 52", linha2: "Consolação · São Paulo/SP · 01304-001", padrao: true },
    { apelido: "Trabalho", linha1: "Av. Paulista, 900, 10º andar", linha2: "Bela Vista · São Paulo/SP · 01310-100", padrao: false },
  ],
  pedidos: [
    {
      numero: "1042",
      data: new Date("2026-10-14T12:00:00Z"),
      status: "enviado" as StatusPedido,
      itens: [{ variacaoId: "babi-damasco", quantidade: 1 }],
      totalCentavos: 28405,
      pagamento: "Pix",
      rastreio: "JD123456789BR",
      urlRastreio: "https://www.jadlog.com.br/jadlog/tracking",
    },
    {
      numero: "1031",
      data: new Date("2026-09-02T12:00:00Z"),
      status: "entregue" as StatusPedido,
      itens: [{ variacaoId: "babi-mare", quantidade: 2 }],
      totalCentavos: 59800,
      pagamento: "Cartão 2x",
      rastreio: "JD987654321BR",
      urlRastreio: "https://www.jadlog.com.br/jadlog/tracking",
    },
  ],
};
