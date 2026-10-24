import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

// Integração com a API de pedidos do PagBank.
// O token fica só na variável de ambiente PAGBANK_TOKEN (nunca no código).
// PAGBANK_AMBIENTE=producao usa a conta real; qualquer outro valor usa o sandbox (testes).
// Os dados do cartão chegam aqui já criptografados no navegador (campo "encrypted"):
// número, validade e CVV nunca passam pelo servidor da CARPI.

export function pagbankConfigurado(): boolean {
  return Boolean(process.env.PAGBANK_TOKEN?.trim());
}

function token(): string {
  return process.env.PAGBANK_TOKEN?.trim() ?? "";
}

function urlBase(): string {
  // PAGBANK_URL_TESTE: só para testes automáticos com um servidor falso; nunca configure na Vercel
  if (process.env.PAGBANK_URL_TESTE) return process.env.PAGBANK_URL_TESTE;
  return process.env.PAGBANK_AMBIENTE?.trim() === "producao" ? "https://api.pagseguro.com" : "https://sandbox.api.pagseguro.com";
}

/** Erro da API, com o código HTTP e a mensagem do PagBank (sem o token). */
export class ErroPagBank extends Error {
  constructor(
    readonly status: number,
    readonly detalhe: string,
  ) {
    super(`PagBank respondeu ${status}: ${detalhe}`);
  }
}

async function chamar<T>(caminho: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const resposta = await fetch(`${urlBase()}${caminho}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  const texto = await resposta.text();
  if (!resposta.ok) {
    let detalhe = texto.slice(0, 300);
    try {
      const j = JSON.parse(texto) as { error_messages?: { code?: string; description?: string; parameter_name?: string }[]; message?: string };
      detalhe =
        j.error_messages?.map((m) => [m.parameter_name, m.description ?? m.code].filter(Boolean).join(": ")).join(" | ") || j.message || detalhe;
    } catch {
      // resposta sem JSON
    }
    throw new ErroPagBank(resposta.status, detalhe);
  }
  return (texto ? JSON.parse(texto) : {}) as T;
}

// ------------------------------------------------------------------ tipos da API

type Cobranca = {
  id: string;
  status: string; // AUTHORIZED, PAID, IN_ANALYSIS, DECLINED, CANCELED, WAITING
  amount?: { value: number; summary?: { paid?: number } };
  payment_response?: { code?: string; message?: string };
};

type PedidoPagBank = {
  id: string;
  reference_id?: string;
  charges?: Cobranca[];
  qr_codes?: { id: string; text: string; expiration_date?: string; links?: { rel: string; href: string }[] }[];
};

export type DadosCompra = {
  /** id do pedido no nosso banco (volta no aviso do PagBank) */
  referencia: string;
  numero: number;
  cliente: { nome: string; email: string; cpf: string; telefone: string };
  itens: { id: string; nome: string; quantidade: number; precoUnitarioCentavos: number }[];
  endereco: { rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string; cep: string };
  valorCentavos: number;
  urlAviso: string;
};

function corpoBase(d: DadosCompra) {
  const tel = d.cliente.telefone.replace(/\D/g, "");
  return {
    reference_id: d.referencia,
    customer: {
      name: d.cliente.nome,
      email: d.cliente.email,
      tax_id: d.cliente.cpf,
      phones: tel.length >= 10 ? [{ country: "55", area: tel.slice(0, 2), number: tel.slice(2), type: "MOBILE" }] : undefined,
    },
    items: d.itens.map((i) => ({ reference_id: i.id, name: i.nome, quantity: i.quantidade, unit_amount: i.precoUnitarioCentavos })),
    shipping: {
      address: {
        street: d.endereco.rua,
        number: d.endereco.numero,
        complement: d.endereco.complemento || undefined,
        locality: d.endereco.bairro,
        city: d.endereco.cidade,
        region_code: d.endereco.uf,
        country: "BRA",
        postal_code: d.endereco.cep,
      },
    },
    notification_urls: [d.urlAviso],
  };
}

// ------------------------------------------------------------------ Pix

export type PixGerado = { idExterno: string; copiaECola: string; imagemQr: string | null; expiraEm: string };

export async function criarPix(d: DadosCompra, validadeMinutos = 30): Promise<PixGerado> {
  const expira = new Date(Date.now() + validadeMinutos * 60_000);
  const pedido = await chamar<PedidoPagBank>("/orders", {
    method: "POST",
    body: { ...corpoBase(d), qr_codes: [{ amount: { value: d.valorCentavos }, expiration_date: expira.toISOString() }] },
  });
  const qr = pedido.qr_codes?.[0];
  if (!qr?.text) throw new ErroPagBank(200, "o PagBank não devolveu o código Pix");
  return {
    idExterno: pedido.id,
    copiaECola: qr.text,
    imagemQr: qr.links?.find((l) => l.rel?.toUpperCase().includes("PNG"))?.href ?? null,
    expiraEm: qr.expiration_date ?? expira.toISOString(),
  };
}

// ------------------------------------------------------------------ cartão

let chaveEmCache: { chave: string; quando: number } | null = null;

/** Chave pública que o navegador usa para criptografar o cartão. */
export async function chavePublica(): Promise<string> {
  if (chaveEmCache && Date.now() - chaveEmCache.quando < 6 * 60 * 60 * 1000) return chaveEmCache.chave;
  const r = await chamar<{ public_key: string }>("/public-keys", { method: "POST", body: { type: "card" } });
  chaveEmCache = { chave: r.public_key, quando: Date.now() };
  return r.public_key;
}

export type PlanoParcela = { vezes: number; valorParcelaCentavos: number; totalCentavos: number; semJuros: boolean };

/** Parcelas reais do PagBank para este cartão (pelos 6 primeiros números), com os juros pagos pela cliente a partir de 2x. */
export async function parcelasPagBank(valorCentavos: number, bin: string, maxParcelas = 12): Promise<PlanoParcela[]> {
  const q = new URLSearchParams({
    payment_methods: "CREDIT_CARD",
    value: String(valorCentavos),
    max_installments: String(maxParcelas),
    max_installments_no_interest: "1",
    credit_card_bin: bin,
  });
  const r = await chamar<{
    payment_methods?: { credit_card?: Record<string, { installment_plans?: { installments: number; installment_value: number; interest_free: boolean; amount: { value: number } }[] }> };
  }>(`/charges/fees/calculate?${q}`);
  const bandeira = Object.values(r.payment_methods?.credit_card ?? {})[0];
  return (bandeira?.installment_plans ?? []).map((p) => ({
    vezes: p.installments,
    valorParcelaCentavos: p.installment_value,
    totalCentavos: p.amount.value,
    semJuros: p.interest_free,
  }));
}

export type ResultadoCartao = { idExterno: string; status: string; motivo: string | null };

export async function cobrarCartao(
  d: DadosCompra,
  cartao: { criptografado: string; titularNome: string; titularCpf: string; parcelas: number },
): Promise<ResultadoCartao> {
  const pedido = await chamar<PedidoPagBank>("/orders", {
    method: "POST",
    body: {
      ...corpoBase(d),
      charges: [
        {
          reference_id: d.referencia,
          description: `CARPI Atelie pedido ${d.numero}`,
          amount: { value: d.valorCentavos, currency: "BRL" },
          payment_method: {
            type: "CREDIT_CARD",
            installments: cartao.parcelas,
            capture: true,
            soft_descriptor: "CARPI ATELIE",
            card: { encrypted: cartao.criptografado, store: false },
            holder: { name: cartao.titularNome, tax_id: cartao.titularCpf },
          },
        },
      ],
    },
  });
  const cobranca = pedido.charges?.[0];
  return { idExterno: pedido.id, status: cobranca?.status ?? "DESCONHECIDO", motivo: cobranca?.payment_response?.message ?? null };
}

// ------------------------------------------------------------------ consulta e aviso

/** Situação do pedido no PagBank. É a fonte de verdade: o aviso (webhook) só diz "olhe de novo". */
export async function consultarPedido(idExterno: string): Promise<{ referencia: string | null; pagoCentavos: number; status: string }> {
  const pedido = await chamar<PedidoPagBank>(`/orders/${encodeURIComponent(idExterno)}`);
  const cobrancas = pedido.charges ?? [];
  const pagas = cobrancas.filter((c) => c.status === "PAID");
  return {
    referencia: pedido.reference_id ?? null,
    pagoCentavos: pagas.reduce((s, c) => s + (c.amount?.summary?.paid ?? c.amount?.value ?? 0), 0),
    status: pagas.length ? "PAID" : (cobrancas.at(-1)?.status ?? "WAITING"),
  };
}

/**
 * Confere a assinatura do aviso: o PagBank manda no cabeçalho x-authenticity-token
 * o SHA-256 de "<token>-<corpo da mensagem>".
 */
export function assinaturaValida(corpo: string, cabecalho: string | null): boolean {
  if (!cabecalho || !token()) return false;
  const esperado = createHash("sha256").update(`${token()}-${corpo}`).digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(cabecalho.trim().toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}
