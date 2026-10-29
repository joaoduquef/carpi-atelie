// Validações de formulário usadas no servidor (e, quando útil, no navegador).

export function soDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Confere os dígitos verificadores do CPF. */
export function cpfValido(valor: string): boolean {
  const cpf = soDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (base: string, pesoInicial: number) => {
    const soma = [...base].reduce((s, d, i) => s + Number(d) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(cpf.slice(0, 9), 10) === Number(cpf[9]) && digito(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

export function formatarCpf(valor: string): string {
  const d = soDigitos(valor).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Mostra só parte do CPF: ***.456.789-** */
export function mascararCpf(valor: string | null): string {
  const d = soDigitos(valor ?? "");
  if (d.length !== 11) return "—";
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}

export function formatarTelefone(valor: string): string {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function emailValido(valor: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor.trim());
}

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

/** Só aceita caminhos internos (evita redirecionar para outro site depois do login). */
export function caminhoSeguro(valor: unknown, padrao = "/minha-conta"): string {
  if (typeof valor !== "string" || !valor.startsWith("/") || /[\\\u0000-\u001f\u007f]/.test(valor)) return padrao;
  try {
    // resolve num endereço de mentira: se o resultado sair desse endereço, era um link para outro site
    const u = new URL(valor, "https://carpi.invalid");
    return u.origin === "https://carpi.invalid" ? `${u.pathname}${u.search}${u.hash}` : padrao;
  } catch {
    return padrao;
  }
}
