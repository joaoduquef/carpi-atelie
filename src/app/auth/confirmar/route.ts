import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { caminhoSeguro } from "@/lib/validacao";

/**
 * Destino dos links enviados por e-mail (confirmar cadastro, nova senha).
 * Aceita os dois formatos do Supabase: token_hash (recomendado, funciona em qualquer navegador) e code.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;
  const codigo = url.searchParams.get("code");
  const proximo = caminhoSeguro(url.searchParams.get("proximo") ?? (tipo === "recovery" ? "/nova-senha" : "/minha-conta"));

  const sb = await supabaseServidor();
  if (sb) {
    const { error } = tokenHash && tipo
      ? await sb.auth.verifyOtp({ type: tipo, token_hash: tokenHash })
      : codigo
        ? await sb.auth.exchangeCodeForSession(codigo)
        : { error: new Error("link incompleto") };
    if (!error) {
      const destino = new URL(proximo, url.origin);
      if (tipo === "signup" || tipo === "email" || url.searchParams.get("tipo") === "cadastro") destino.searchParams.set("bem-vindo", "1");
      return NextResponse.redirect(destino);
    }
  }
  return NextResponse.redirect(new URL("/entrar?link=invalido", url.origin));
}
