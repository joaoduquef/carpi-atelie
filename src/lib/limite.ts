import "server-only";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/servidor";

/** IP de quem fez a requisição (a Vercel informa no cabeçalho x-forwarded-for). */
export async function ipDaRequisicao(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecido";
}

/**
 * Limite de tentativas guardado no banco (tabela "tentativas").
 * Retorna true se ainda pode tentar. Sem a chave secreta configurada, não bloqueia
 * (o Supabase Auth tem os próprios limites).
 */
export async function dentroDoLimite(chave: string, limite: number, janelaSegundos: number): Promise<boolean> {
  const sb = supabaseAdmin();
  if (!sb) return true;
  const { data, error } = await sb.rpc("registrar_tentativa", { p_chave: chave, p_limite: limite, p_janela_segundos: janelaSegundos });
  if (error) {
    console.error("Limite de tentativas indisponível:", error.message);
    return true;
  }
  return data === true;
}
