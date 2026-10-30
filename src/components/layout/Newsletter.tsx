"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { inscreverNewsletter } from "@/app/conta/newsletter";
import { Botao } from "@/components/ui/Botao";
import { LOJA } from "@/config/loja";

const ESCONDER_EM = [...(LOJA.vendasAbertas ? ["/finalizar-compra"] : []), "/entrar", "/cadastro", "/recuperar-senha", "/nova-senha"];

export function Newsletter() {
  const caminho = usePathname();
  const [email, setEmail] = useState("");
  const [aceite, setAceite] = useState(false);
  const [estado, setEstado] = useState<"livre" | "erro" | "ok">("livre");
  const [mensagem, setMensagem] = useState("");
  const [enviando, iniciar] = useTransition();

  if (ESCONDER_EM.some((c) => caminho.startsWith(c))) return null;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      const r = await inscreverNewsletter(email, aceite);
      setEstado(r.erro ? "erro" : "ok");
      setMensagem(r.erro ?? r.ok ?? "");
      if (r.ok) {
        setEmail("");
        setAceite(false);
      }
    });
  }

  return (
    <section id="newsletter" aria-labelledby="titulo-news" className="scroll-mt-6 mx-auto w-full max-w-6xl px-4 sm:px-6">
      <form
        onSubmit={enviar}
        noValidate
        className="grid gap-3 rounded-bloco bg-superficie px-6 py-7 sm:px-8"
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
          <Botao type="submit" disabled={enviando}>
            {enviando ? "Enviando…" : "Quero receber"}
          </Botao>
        </div>
        <label className="mt-3 flex items-center gap-2.5 text-sm text-texto-suave">
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
