"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL, supabaseConfigurado } from "./config";

let cliente: ReturnType<typeof createBrowserClient> | null = null;

/** Cliente para usar dentro de componentes "use client". Retorna null se o Supabase não estiver configurado. */
export function supabaseNavegador() {
  if (!supabaseConfigurado) return null;
  cliente ??= createBrowserClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA);
  return cliente;
}
