// Chaves do Supabase vêm sempre de variáveis de ambiente (.env.local ou painel da Vercel).
// Aceita os nomes novos (publishable/secret) e os antigos (anon/service_role).

import { normalizarUrl } from "@/lib/url";

// só o endereço do projeto (sem "/rest/v1" e afins, caso tenham copiado o endereço da API)
export const SUPABASE_URL = normalizarUrl(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/(rest|auth)\/v1.*$/, "");
export const SUPABASE_CHAVE_PUBLICA = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ""
).trim();

/** Enquanto o Supabase não estiver configurado, o site funciona com os dados fictícios da Fase 1. */
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_CHAVE_PUBLICA);
