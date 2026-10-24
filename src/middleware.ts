import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOJA } from "@/config/loja";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL, supabaseConfigurado } from "@/lib/supabase/config";

// Páginas que exigem conta (com as vendas fechadas, /finalizar-compra só mostra o aviso)
const PROTEGIDAS = ["/minha-conta", ...(LOJA.vendasAbertas ? ["/finalizar-compra"] : [])];

export async function middleware(request: NextRequest) {
  if (!supabaseConfigurado) return NextResponse.next();

  // Visitante sem conta (sem o cookie de sessão do Supabase): nada a renovar, segue direto.
  const temSessao = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!temSessao) {
    const caminho = request.nextUrl.pathname;
    if (PROTEGIDAS.some((p) => caminho.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.search = `?proximo=${encodeURIComponent(caminho)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  try {
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

    // Confere e renova a sessão (não remova esta linha). getClaims confere a assinatura
    // localmente, sem ir ao servidor de contas a cada página.
    const { data } = await sb.auth.getClaims();
    const user = data?.claims?.sub ? data.claims : null;

    const caminho = request.nextUrl.pathname;
    if (!user && PROTEGIDAS.some((p) => caminho.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.search = `?proximo=${encodeURIComponent(caminho)}`;
      return NextResponse.redirect(url);
    }
    return resposta;
  } catch (e) {
    // banco fora do ar ou chave errada: o site continua funcionando (sem login)
    console.error("[middleware] falha ao falar com o Supabase", e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|fonts|brand|products|sitemap.xml|robots.txt).*)"],
};
