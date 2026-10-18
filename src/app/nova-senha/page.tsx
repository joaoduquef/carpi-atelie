import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CaixaConta } from "@/components/conta/CaixaConta";
import { FormNovaSenha } from "@/components/conta/Formularios";
import { usuarioAtual } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Nova senha", robots: { index: false } };

/** Aberta pelo link do e-mail de recuperação (que já deixa a pessoa logada). */
export default async function NovaSenha() {
  if (!(await usuarioAtual())) redirect("/recuperar-senha");
  return (
    <CaixaConta titulo="Nova senha">
      <p className="text-sm">Escolha uma nova senha para a sua conta.</p>
      <FormNovaSenha />
    </CaixaConta>
  );
}
