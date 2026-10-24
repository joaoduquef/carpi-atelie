import "server-only";
import { LOJA } from "@/config/loja";
import { cepValido, ehSudeste, limparCep } from "@/lib/frete";
import { cotarMelhorEnvio, melhorEnvioConfigurado, type PacoteFrete, type ServicoCotado } from "./melhor-envio";

export type OpcaoFrete = {
  id: string;
  transportadora: string;
  servico: string;
  /** o que a cliente paga (0 = grátis) */
  cobradoCentavos: number;
  /** o que a loja paga à transportadora */
  custoCentavos: number;
  /** prazo só da transportadora, em dias úteis */
  prazoMin: number;
  prazoMax: number;
};

export type ResultadoFrete = { opcoes: OpcaoFrete[]; simulado: boolean } | { erro: string };

/** Enquanto não houver token do Melhor Envio ou CEP de origem: valores de exemplo, iguais para qualquer peça. */
function cotacaoSimulada(cep: string): ServicoCotado[] {
  const sudeste = ehSudeste(cep);
  return [
    { id: "simulado-economica", transportadora: "Entrega econômica", servico: "simulada", precoCentavos: sudeste ? 2490 : 3990, prazoMin: sudeste ? 3 : 5, prazoMax: sudeste ? 5 : 9 },
    { id: "simulado-expressa", transportadora: "Entrega expressa", servico: "simulada", precoCentavos: sudeste ? 4490 : 5990, prazoMin: sudeste ? 1 : 3, prazoMax: sudeste ? 2 : 5 },
  ];
}

/**
 * Opções de entrega para o CEP, já com a regra do frete grátis no Sudeste:
 * a opção mais barata sai grátis e nas outras a cliente paga só a diferença.
 */
export async function cotarFrete(cepBruto: string, pacotes: PacoteFrete[], subtotalCentavos: number): Promise<ResultadoFrete> {
  const cep = limparCep(cepBruto);
  if (!cepValido(cep)) return { erro: "Digite um CEP válido, com 8 números." };

  const origem = limparCep(LOJA.envio.cepOrigem);
  const real = melhorEnvioConfigurado() && cepValido(origem);
  let servicos: ServicoCotado[];
  try {
    servicos = real ? await cotarMelhorEnvio(origem, cep, pacotes) : cotacaoSimulada(cep);
  } catch (e) {
    console.error("[frete] falha ao cotar no Melhor Envio", e);
    return { erro: "Não conseguimos calcular o frete agora. Tente de novo em instantes." };
  }
  if (servicos.length === 0) return { erro: "Não encontramos opções de entrega para este CEP. Confira se ele está certo." };

  servicos.sort((a, b) => a.precoCentavos - b.precoCentavos || a.prazoMax - b.prazoMax);
  if (LOJA.envio.opcoes === "mais_barata") servicos = servicos.slice(0, 1);
  else servicos = servicos.slice(0, 4);

  const regra = LOJA.envio.freteGratisSudeste;
  const gratis = regra.ativo && ehSudeste(cep) && subtotalCentavos >= regra.minimoCentavos;
  const maisBarato = servicos[0].precoCentavos;

  return {
    simulado: !real,
    opcoes: servicos.map((s) => ({
      id: s.id,
      transportadora: s.transportadora,
      servico: s.servico,
      cobradoCentavos: gratis ? s.precoCentavos - maisBarato : s.precoCentavos,
      custoCentavos: s.precoCentavos,
      prazoMin: s.prazoMin,
      prazoMax: s.prazoMax,
    })),
  };
}
