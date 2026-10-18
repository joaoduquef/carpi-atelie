import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOJA } from "@/config/loja";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL, supabaseConfigurado } from "@/lib/supabase/config";

// Páginas que exigem conta (com as vendas fechadas, /finalizar-compra só mostra o aviso)
const PROTEGIDAS = ["/minha-conta", ...(LOJA.vendasAbertas ? ["/finalizar-compra"] : [])];

export async function middleware(request: NextRequest) {
  if (!supabaseConfigurado) return NextResponse.next();

  let resposta = NextResponse.next({ request });
  const sb = createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });

  // Renova a sessão (não remova esta linha)
  const {
    data: { user },
  } = await sb.auth.getUser();

  const caminho = request.nextUrl.pathname;
  if (!user && PROTEGIDAS.some((p) => caminho.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?proximo=${encodeURIComponent(caminho)}`;
    return NextResponse.redirect(url);
  }
  return resposta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|fonts|brand|products|sitemap.xml|robots.txt).*)"],
};
