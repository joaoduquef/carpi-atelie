// Frete da Fase 1: cotação SIMULADA. Na Fase 3 a cotação vem da API do Melhor Envio,
// sempre calculada no servidor.

export type CotacaoFrete = {
  transportadora: string;
  /** valor cobrado do cliente, em centavos (0 = grátis) */
  valorCentavos: number;
  /** prazo só da transportadora, em dias úteis */
  prazoMin: number;
  prazoMax: number;
};

export function limparCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

export function formatarCep(cep: string): string {
  const d = limparCep(cep).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function cepValido(cep: string): boolean {
  return limparCep(cep).length === 8;
}

/** SP, RJ, MG e ES: CEPs de 01000-000 a 39999-999. */
export function ehSudeste(cep: string): boolean {
  const n = Number(limparCep(cep));
  return n >= 1000000 && n <= 39999999;
}

export function cotarFreteSimulado(cep: string): CotacaoFrete {
  if (ehSudeste(cep)) return { transportadora: "Jadlog", valorCentavos: 0, prazoMin: 2, prazoMax: 4 };
  return { transportadora: "Jadlog", valorCentavos: 3990, prazoMin: 5, prazoMax: 9 };
}

/** Prazo exibido = produção + transportadora. */
export function prazoTotal(cotacao: CotacaoFrete, producaoDias: number) {
  return { min: cotacao.prazoMin + producaoDias, max: cotacao.prazoMax + producaoDias };
}
