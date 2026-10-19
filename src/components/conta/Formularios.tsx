"use client";

import Link from "@/components/ui/Link";
import { useActionState, useState } from "react";
import { cadastrar, definirNovaSenha, entrar, recuperarSenha, type Resultado } from "@/app/conta/acoes";
import { Botao } from "@/components/ui/Botao";
import { Campo } from "@/components/ui/Campo";
import { formatarCpf, formatarTelefone } from "@/lib/validacao";

export function Mensagem({ estado }: { estado: Resultado }) {
  if (!estado?.erro && !estado?.ok) return <p role="status" className="sr-only" />;
  return (
    <p
      role={estado.erro ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-sm font-bold ${estado.erro ? "bg-bloco-rosa text-texto-em-bloco" : "bg-bloco-mare text-texto-em-mare"}`}
    >
      {estado.erro ?? estado.ok}
    </p>
  );
}

export function FormEntrar({ proximo }: { proximo?: string }) {
  const [estado, acao, enviando] = useActionState(entrar, null);
  return (
    <form action={acao} className="grid gap-3">
      <input type="hidden" name="proximo" value={proximo ?? ""} />
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required defaultValue={estado?.campos?.email} />
      <Campo rotulo="Senha" name="senha" type="password" autoComplete="current-password" required />
      <Link href="/recuperar-senha" className="justify-self-end text-sm text-link underline underline-offset-4">
        Esqueci minha senha
      </Link>
      <Mensagem estado={estado} />
      <Botao type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Botao>
    </form>
  );
}

export function FormCadastro({ proximo }: { proximo?: string }) {
  const [estado, acao, enviando] = useActionState(cadastrar, null);
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  if (estado?.ok) return <Mensagem estado={estado} />;
  const c = estado?.campos;
  return (
    <form action={acao} className="grid gap-3">
      <input type="hidden" name="proximo" value={proximo ?? ""} />
      <Campo rotulo="Nome completo" name="nome" autoComplete="name" required defaultValue={c?.nome} />
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required defaultValue={c?.email} />
      <Campo
        rotulo="CPF"
        name="cpf"
        inputMode="numeric"
        required
        dica="Necessário para a nota fiscal e o pagamento."
        value={cpf || (c?.cpf ? formatarCpf(c.cpf) : "")}
        onChange={(e) => setCpf(formatarCpf(e.target.value))}
      />
      <Campo
        rotulo="Celular (opcional)"
        name="telefone"
        type="tel"
        autoComplete="tel"
        value={telefone || (c?.telefone ? formatarTelefone(c.telefone) : "")}
        onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
      />
      <Campo rotulo="Senha" name="senha" type="password" autoComplete="new-password" minLength={8} required dica="Pelo menos 8 caracteres." />
      <label className="flex items-start gap-2.5 text-sm text-texto-suave">
        <input type="checkbox" name="newsletter" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--botao)]" />
        Aceito receber e-mails com novidades da CARPI Ateliê
      </label>
      <p className="text-xs text-texto-suave">
        Ao criar a conta, você concorda com a{" "}
        <Link href="/privacidade" className="text-link underline underline-offset-4">
          Política de privacidade
        </Link>
        . Vamos enviar um e-mail para confirmar o seu endereço.
      </p>
      <Mensagem estado={estado} />
      <Botao type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Criando…" : "Criar conta"}
      </Botao>
    </form>
  );
}

export function FormRecuperar() {
  const [estado, acao, enviando] = useActionState(recuperarSenha, null);
  if (estado?.ok) return <Mensagem estado={estado} />;
  return (
    <form action={acao} className="grid gap-3">
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required defaultValue={estado?.campos?.email} />
      <Mensagem estado={estado} />
      <Botao type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar link"}
      </Botao>
    </form>
  );
}

export function FormNovaSenha() {
  const [estado, acao, enviando] = useActionState(definirNovaSenha, null);
  return (
    <form action={acao} className="grid gap-3">
      <Campo rotulo="Nova senha" name="senha" type="password" autoComplete="new-password" minLength={8} required dica="Pelo menos 8 caracteres." />
      <Campo rotulo="Repita a nova senha" name="confirmacao" type="password" autoComplete="new-password" minLength={8} required />
      <Mensagem estado={estado} />
      <Botao type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Salvando…" : "Salvar nova senha"}
      </Botao>
    </form>
  );
}
