// Chaves do Supabase vêm sempre de variáveis de ambiente (.env.local ou painel da Vercel).
// Aceita os nomes novos (publishable/secret) e os antigos (anon/service_role).

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_CHAVE_PUBLICA =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Enquanto o Supabase não estiver configurado, o site funciona com os dados fictícios da Fase 1. */
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_CHAVE_PUBLICA);
