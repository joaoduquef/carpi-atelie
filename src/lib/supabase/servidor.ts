import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL, supabaseConfigurado } from "./config";

/** Cliente com a sessão de quem está navegando (respeita o RLS). */
export async function supabaseServidor() {
  if (!supabaseConfigurado) return null;
  const loja = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => loja.set(name, value, options));
        } catch {
          // chamado de um Server Component: o middleware cuida de renovar a sessão
        }
      },
    },
  });
}

/**
 * Cliente com a chave secreta: ignora o RLS. Use SÓ no servidor, para tarefas do sistema
 * (limite de tentativas, criar pedidos, webhooks). Nunca envie para o navegador.
 */
export function supabaseAdmin() {
  const chave = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!supabaseConfigurado || !chave) return null;
  return createClient(SUPABASE_URL, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type Usuario = { id: string; email: string; nome: string; papel: "cliente" | "admin" };

/** Quem está logado (ou null). Memorizado por requisição. */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const sb = await supabaseServidor();
  if (!sb) return null;
  // sem cookie de sessão, ninguém está logado: evita ir ao banco
  const temSessao = (await cookies()).getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!temSessao) return null;
  try {
    const { data } = await sb.auth.getClaims();
    const id = data?.claims?.sub;
    if (!id) return null;
    const { data: perfil } = await sb.from("perfis").select("nome, papel").eq("id", id).maybeSingle();
    return { id, email: String(data.claims.email ?? ""), nome: perfil?.nome ?? "", papel: perfil?.papel ?? "cliente" };
  } catch (e) {
    console.error("[conta] falha ao ler a sessão no Supabase", e);
    return null;
  }
});

/** Cliente anônimo, sem sessão: enxerga só o que o público enxerga (usado para o catálogo da loja). */
export function supabasePublico() {
  if (!supabaseConfigurado) return null;
  return createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, { auth: { persistSession: false, autoRefreshToken: false } });
}
