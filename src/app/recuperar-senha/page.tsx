import type { Metadata } from "next";
import Link from "next/link";
import { AvisoDemo, CaixaConta } from "@/components/conta/CaixaConta";
import { Botao } from "@/components/ui/Botao";
import { Campo } from "@/components/ui/Campo";
import { FormDemo } from "@/components/conta/FormDemo";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false } };

export default function RecuperarSenha() {
  return (
    <CaixaConta titulo="Recuperar senha">
      <AvisoDemo />
      <p className="text-sm">Digite o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.</p>
      <FormDemo>
        <Campo rotulo="E-mail" type="email" autoComplete="email" required />
        <Botao type="submit" className="w-full">
          Enviar link
        </Botao>
      </FormDemo>
      <Link href="/entrar" className="justify-self-center text-sm text-link underline underline-offset-4">
        Voltar para entrar
      </Link>
    </CaixaConta>
  );
}
