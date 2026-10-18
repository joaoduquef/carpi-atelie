import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { LOJA } from "@/config/loja";
import { Cabecalho } from "@/components/layout/Cabecalho";
import { Newsletter } from "@/components/layout/Newsletter";
import { Rodape } from "@/components/layout/Rodape";
import { Aviso } from "@/components/loja/Aviso";
import { CatalogoProvider } from "@/components/loja/CatalogoProvider";
import { carregarCatalogo } from "@/lib/catalogo-servidor";
import { usuarioAtual } from "@/lib/supabase/servidor";
import { LojaProvider } from "@/components/loja/LojaProvider";
import { LuzesProvider, scriptLuzes } from "@/components/luzes/LuzesProvider";
import "./globals.css";

const liberation = localFont({
  src: [
    {
      path: "../../public/fonts/LiberationSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/LiberationSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--fonte-liberation",
  display: "swap",
  fallback: ["Arimo", "Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(LOJA.url),
  title: { default: LOJA.titulo, template: "%s | CARPI Ateliê" },
  description: LOJA.descricao,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: LOJA.nome,
    title: LOJA.titulo,
    description: LOJA.descricao,
    images: [
      {
        url: "/products/babi/ambiente-1.jpg?v=4",
        width: 1436,
        height: 1436,
        alt: "Abajur Babi",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7eddc",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [catalogo, usuario] = await Promise.all([
    carregarCatalogo(),
    usuarioAtual(),
  ]);
  return (
    <html lang="pt-BR" className={liberation.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptLuzes }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <LuzesProvider>
          <CatalogoProvider catalogo={catalogo}>
            <LojaProvider usuarioId={usuario?.id ?? null}>
              <>
                <a
                  href="#conteudo"
                  className="sr-only z-50 rounded-full bg-botao px-4 py-2 text-botao-texto focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
                >
                  Pular para o conteúdo
                </a>
                <div
                  className="bg-botao px-4 pb-2 text-center text-[0.8rem] font-bold tracking-[0.04em] text-botao-texto"
                  style={{
                    paddingTop: "calc(8px + env(safe-area-inset-top, 0px))",
                  }}
                >
                  {LOJA.anuncio}
                </div>
                <Cabecalho
                  nomeUsuario={
                    usuario ? usuario.nome.split(" ")[0] || "Minha conta" : null
                  }
                />
                <main
                  id="conteudo"
                  className="mx-auto w-full max-w-6xl px-4 pt-6 pb-14 sm:px-6"
                >
                  {children}
                </main>
                <div className="grid gap-10">
                  <Newsletter />
                  <Rodape />
                </div>
              </>
              <Aviso />
            </LojaProvider>
          </CatalogoProvider>
        </LuzesProvider>
      </body>
    </html>
  );
}
