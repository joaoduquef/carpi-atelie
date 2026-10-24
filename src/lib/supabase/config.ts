// Chaves do Supabase vêm sempre de variáveis de ambiente (.env.local ou painel da Vercel).
// Aceita os nomes novos (publishable/secret) e os antigos (anon/service_role).

import { normalizarUrl } from "@/lib/url";

/**
 * Endereço do projeto, no formato https://<id>.supabase.co. Aceita também o que costuma ser
 * colado por engano: só o id do projeto, o link do painel (supabase.com/dashboard/project/<id>)
 * ou o endereço da API com "/rest/v1" no fim.
 */
export function enderecoSupabase(valor: string | undefined): string {
  const v = (valor ?? "").trim().replace(/^["']|["']$/g, "").trim();
  const id = v.match(/^([a-z0-9]{20})$/)?.[1] ?? v.match(/supabase\.com\/dashboard\/project\/([a-z0-9]{20})/)?.[1];
  if (id) return `https://${id}.supabase.co`;
  return normalizarUrl(v).replace(/\/(rest|auth)\/v1.*$/, "");
}

export const SUPABASE_URL = enderecoSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_CHAVE_PUBLICA = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ""
).trim();

/** Enquanto o Supabase não estiver configurado, o site funciona com os dados fictícios da Fase 1. */
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_CHAVE_PUBLICA);
