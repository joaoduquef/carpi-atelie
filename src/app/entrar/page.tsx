import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { redirect } from "next/navigation";
import { AvisoDemo, CaixaConta } from "@/components/conta/CaixaConta";
import { FormEntrar } from "@/components/conta/Formularios";
import { usuarioAtual } from "@/lib/supabase/servidor";
import { caminhoSeguro } from "@/lib/validacao";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ proximo?: string; link?: string }> }) {
  const { proximo, link } = await searchParams;
  if (await usuarioAtual()) redirect(caminhoSeguro(proximo));
  const destino = proximo ? caminhoSeguro(proximo) : undefined;

  return (
    <CaixaConta titulo="Entrar">
      <AvisoDemo />
      {destino === "/finalizar-compra" && (
        <p className="rounded-xl bg-bloco-mare px-3 py-2 text-sm text-texto-em-mare">
          Para finalizar a compra, entre na sua conta ou crie uma. Os itens da sacola continuam guardados.
        </p>
      )}
      {link === "invalido" && (
        <p role="alert" className="rounded-xl bg-bloco-rosa px-3 py-2 text-sm font-bold text-texto-em-bloco">
          Este link expirou ou já foi usado. Entre com a sua senha ou peça um novo link.
        </p>
      )}
      <FormEntrar proximo={destino} />
      <p className="text-center text-sm">
        Ainda não tem conta?{" "}
        <Link href={destino ? `/cadastro?proximo=${encodeURIComponent(destino)}` : "/cadastro"} className="font-bold text-link underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </CaixaConta>
  );
}
