// Datas no formato brasileiro e contagem de dias úteis.

const formatoData = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" });

export function formatarData(data: Date): string {
  return formatoData.format(data);
}

/** Feriados nacionais fixos (mês-dia). Os móveis (Carnaval, Sexta-feira Santa, Corpus Christi) são calculados. */
const FERIADOS_FIXOS = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"];

function pascoa(ano: number): Date {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function chave(d: Date): string {
  return d.toISOString().slice(5, 10);
}

function feriadosMoveis(ano: number): string[] {
  const p = pascoa(ano).getTime(), dia = 86400000;
  return [-48, -47, -2, 60].map((delta) => chave(new Date(p + delta * dia)));
}

export function ehDiaUtil(d: Date): boolean {
  const semana = d.getUTCDay();
  if (semana === 0 || semana === 6) return false;
  const k = chave(d);
  return !FERIADOS_FIXOS.includes(k) && !feriadosMoveis(d.getUTCFullYear()).includes(k);
}

export function somarDiasUteis(inicio: Date, dias: number): Date {
  const d = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate()));
  let restantes = dias;
  while (restantes > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (ehDiaUtil(d)) restantes--;
  }
  return d;
}
