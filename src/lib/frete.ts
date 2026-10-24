// Ajudantes de CEP, usados na tela e no servidor. A cotação do frete fica em src/lib/checkout/frete.ts.

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
