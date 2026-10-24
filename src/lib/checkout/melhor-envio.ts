import "server-only";

// Cotação de frete na API do Melhor Envio (https://docs.menv.io).
// O token fica só na variável de ambiente MELHOR_ENVIO_TOKEN (nunca no código).
// MELHOR_ENVIO_AMBIENTE=producao usa a conta real; qualquer outro valor usa o sandbox (testes).

export type PacoteFrete = {
  id: string;
  larguraCm: number;
  alturaCm: number;
  comprimentoCm: number;
  pesoKg: number;
  /** valor declarado para o seguro, em centavos */
  valorCentavos: number;
  quantidade: number;
};

export type ServicoCotado = {
  id: string;
  transportadora: string;
  servico: string;
  /** a cliente busca o pacote num ponto de retirada, em vez de receber em casa */
  retirada?: boolean;
  precoCentavos: number;
  prazoMin: number;
  prazoMax: number;
};

type RespostaServico = {
  id: number;
  name: string;
  price?: string;
  custom_price?: string;
  delivery_range?: { min: number; max: number };
  custom_delivery_range?: { min: number; max: number };
  company?: { name: string };
  error?: string;
};

export function melhorEnvioConfigurado(): boolean {
  return Boolean(process.env.MELHOR_ENVIO_TOKEN?.trim());
}

function urlBase(): string {
  return process.env.MELHOR_ENVIO_AMBIENTE?.trim() === "producao" ? "https://melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br";
}

/** Erro da API, com o código HTTP e a mensagem do Melhor Envio (sem o token). */
export class ErroMelhorEnvio extends Error {
  constructor(
    readonly status: number,
    readonly detalhe: string,
  ) {
    super(`Melhor Envio respondeu ${status}: ${detalhe}`);
  }
}

/**
 * Serviços disponíveis para o CEP, já sem os que deram erro (ex.: transportadora não atende a região).
 * `recusas` traz o motivo de cada serviço recusado, para mostrar quando nenhum serve.
 */
export async function cotarMelhorEnvio(
  cepOrigem: string,
  cepDestino: string,
  pacotes: PacoteFrete[],
): Promise<{ servicos: ServicoCotado[]; recusas: string[] }> {
  const resposta = await fetch(`${urlBase()}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN?.trim()}`,
      "User-Agent": "CARPI Atelie (carpiatelie@gmail.com)",
    },
    body: JSON.stringify({
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino },
      products: pacotes.map((p) => ({
        id: p.id,
        width: p.larguraCm,
        height: p.alturaCm,
        length: p.comprimentoCm,
        weight: p.pesoKg,
        insurance_value: p.valorCentavos / 100,
        quantity: p.quantidade,
      })),
      options: { receipt: false, own_hand: false },
    }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    let detalhe = corpo.slice(0, 300);
    try {
      const j = JSON.parse(corpo) as { message?: string; error?: string; errors?: Record<string, string[]> };
      detalhe = [j.message ?? j.error, ...Object.values(j.errors ?? {}).flat()].filter(Boolean).join(" ") || detalhe;
    } catch {
      // resposta sem JSON: fica o começo do texto
    }
    throw new ErroMelhorEnvio(resposta.status, detalhe);
  }

  const lista = (await resposta.json()) as RespostaServico[];
  const recusas = lista.filter((s) => s.error).map((s) => `${s.company?.name ?? ""} ${s.name}: ${s.error}`.trim());
  const servicos = lista
    .filter((s) => !s.error && (s.custom_price ?? s.price))
    .map((s) => {
      const prazo = s.custom_delivery_range ?? s.delivery_range ?? { min: 0, max: 0 };
      const transportadora = s.company?.name ?? "";
      // "Loggi Ponto" com transportadora "Loggi" vira só "Ponto", para não repetir o nome
      const servico = transportadora && s.name.toLowerCase().startsWith(`${transportadora.toLowerCase()} `) ? s.name.slice(transportadora.length + 1) : s.name;
      return {
        id: String(s.id),
        transportadora,
        servico,
        retirada: /ponto|centralizad|retira|agência|agencia/i.test(s.name),
        precoCentavos: Math.round(Number(s.custom_price ?? s.price) * 100),
        prazoMin: prazo.min,
        prazoMax: prazo.max,
      };
    })
    .filter((s) => Number.isFinite(s.precoCentavos) && s.precoCentavos > 0);
  return { servicos, recusas };
}
