import type { Metadata } from "next";
import Link from "next/link";
import { AvisoDemo, CaixaConta } from "@/components/conta/CaixaConta";
import { Botao } from "@/components/ui/Botao";
import { Campo } from "@/components/ui/Campo";
import { FormDemo } from "@/components/conta/FormDemo";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default function Entrar() {
  return (
    <CaixaConta titulo="Entrar">
      <AvisoDemo />
      <FormDemo>
        <Campo rotulo="E-mail" type="email" autoComplete="email" required />
        <Campo rotulo="Senha" type="password" autoComplete="current-password" required />
        <Link href="/recuperar-senha" className="justify-self-end text-sm text-link underline underline-offset-4">
          Esqueci minha senha
        </Link>
        <Botao type="submit" className="w-full">
          Entrar
        </Botao>
      </FormDemo>
      <p className="text-center text-sm">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-bold text-link underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </CaixaConta>
  );
}
