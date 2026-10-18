import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AvisoDemo, CaixaConta } from "@/components/conta/CaixaConta";
import { FormCadastro } from "@/components/conta/Formularios";
import { usuarioAtual } from "@/lib/supabase/servidor";
import { caminhoSeguro } from "@/lib/validacao";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default async function Cadastro({ searchParams }: { searchParams: Promise<{ proximo?: string }> }) {
  const { proximo } = await searchParams;
  if (await usuarioAtual()) redirect(caminhoSeguro(proximo));
  const destino = proximo ? caminhoSeguro(proximo) : undefined;

  return (
    <CaixaConta titulo="Criar conta">
      <AvisoDemo />
      <FormCadastro proximo={destino} />
      <p className="text-center text-sm">
        Já tem conta?{" "}
        <Link href={destino ? `/entrar?proximo=${encodeURIComponent(destino)}` : "/entrar"} className="font-bold text-link underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </CaixaConta>
  );
}
