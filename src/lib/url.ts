/**
 * Arruma um endereço vindo de variável de ambiente: tira espaços e aspas, põe "https://"
 * se faltar e tira a barra do fim. Se mesmo assim não for um endereço válido, usa o reserva.
 */
export function normalizarUrl(valor: string | undefined, reserva = ""): string {
  let v = (valor ?? "").trim().replace(/^["']|["']$/g, "").trim();
  if (!v) return reserva;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    return `${u.protocol}//${u.host}${u.pathname.replace(/\/+$/, "")}`;
  } catch {
    return reserva;
  }
}
