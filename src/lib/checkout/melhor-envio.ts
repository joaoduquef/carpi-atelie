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

/** Serviços disponíveis para o CEP, já sem os que deram erro (ex.: transportadora não atende a região). */
export async function cotarMelhorEnvio(cepOrigem: string, cepDestino: string, pacotes: PacoteFrete[]): Promise<ServicoCotado[]> {
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
  if (!resposta.ok) throw new Error(`Melhor Envio respondeu ${resposta.status}`);

  const servicos = (await resposta.json()) as RespostaServico[];
  return servicos
    .filter((s) => !s.error && (s.custom_price ?? s.price))
    .map((s) => {
      const prazo = s.custom_delivery_range ?? s.delivery_range ?? { min: 0, max: 0 };
      return {
        id: String(s.id),
        transportadora: s.company?.name ?? "",
        servico: s.name,
        precoCentavos: Math.round(Number(s.custom_price ?? s.price) * 100),
        prazoMin: prazo.min,
        prazoMax: prazo.max,
      };
    })
    .filter((s) => Number.isFinite(s.precoCentavos) && s.precoCentavos > 0);
}
