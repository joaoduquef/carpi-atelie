import type { Metadata } from "next";
import Link from "next/link";
import { AvisoDemo, CaixaConta } from "@/components/conta/CaixaConta";
import { Botao } from "@/components/ui/Botao";
import { Campo } from "@/components/ui/Campo";
import { FormDemo } from "@/components/conta/FormDemo";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function Cadastro() {
  return (
    <CaixaConta titulo="Criar conta">
      <AvisoDemo />
      <FormDemo>
        <Campo rotulo="Nome completo" autoComplete="name" required />
        <Campo rotulo="E-mail" type="email" autoComplete="email" required />
        <Campo rotulo="CPF" inputMode="numeric" dica="Necessário para a nota fiscal e o pagamento." required />
        <Campo rotulo="Celular" type="tel" autoComplete="tel" />
        <Campo rotulo="Senha" type="password" autoComplete="new-password" dica="Pelo menos 8 caracteres." required />
        <label className="flex items-start gap-2.5 text-sm text-texto-suave">
          <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--botao)]" />
          Aceito receber e-mails com novidades da CARPI Ateliê
        </label>
        <p className="text-xs text-texto-suave">
          Ao criar a conta, você concorda com a{" "}
          <Link href="/privacidade" className="text-link underline underline-offset-4">
            Política de privacidade
          </Link>
          . Vamos enviar um e-mail para confirmar o seu endereço.
        </p>
        <Botao type="submit" className="w-full">
          Criar conta
        </Botao>
      </FormDemo>
      <p className="text-center text-sm">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-bold text-link underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </CaixaConta>
  );
}
