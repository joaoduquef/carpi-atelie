"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Botao } from "@/components/ui/Botao";

const ESCONDER_EM = ["/finalizar-compra", "/entrar", "/cadastro", "/recuperar-senha"];

export function Newsletter() {
  const caminho = usePathname();
  const [email, setEmail] = useState("");
  const [aceite, setAceite] = useState(false);
  const [estado, setEstado] = useState<"livre" | "erro" | "ok">("livre");
  const [mensagem, setMensagem] = useState("");

  if (ESCONDER_EM.some((c) => caminho.startsWith(c))) return null;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEstado("erro");
      setMensagem("Digite um e-mail válido, como nome@exemplo.com.");
      return;
    }
    if (!aceite) {
      setEstado("erro");
      setMensagem("Marque a caixa para autorizar o envio de e-mails.");
      return;
    }
    // Fase 2: salvar na tabela "newsletter" do Supabase
    setEstado("ok");
    setMensagem("Pronto! Você vai receber as novidades do ateliê.");
    setEmail("");
    setAceite(false);
  }

  return (
    <section aria-labelledby="titulo-news" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <form
        onSubmit={enviar}
        noValidate
        className="grid gap-3 rounded-bloco border border-linha bg-superficie px-6 py-7 sm:px-8"
      >
        <h2 id="titulo-news" className="text-xl font-bold tracking-[0.02em] text-titulo">
          Receba as novidades do ateliê
        </h2>
        <p className="text-[0.95rem] text-texto-suave">Avisamos quando Isa e Manu chegarem.</p>
        <div className="flex flex-wrap gap-2">
          <label htmlFor="email-news" className="sr-only">
            E-mail
          </label>
          <input
            id="email-news"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="min-w-0 flex-[1_1_220px] rounded-full border border-linha bg-fundo px-4 py-2.5 text-texto placeholder:text-texto-suave/70"
          />
          <Botao type="submit">Quero receber</Botao>
        </div>
        <label className="flex items-center gap-2.5 text-sm text-texto-suave">
          <input
            type="checkbox"
            checked={aceite}
            onChange={(e) => setAceite(e.target.checked)}
            className="h-[18px] w-[18px] shrink-0 accent-[var(--botao)]"
          />
          Aceito receber e-mails da CARPI Ateliê
        </label>
        <p role="status" className={`min-h-5 text-sm font-bold ${estado === "erro" ? "text-erro" : "text-sucesso"}`}>
          {mensagem}
        </p>
      </form>
    </section>
  );
}
