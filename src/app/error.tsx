"use client";

import { useEffect } from "react";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";

/** Tela de erro: no lugar da página em branco do Next.js, explica e mostra o detalhe para enviarmos ao suporte. */
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid justify-items-start gap-5">
      <TituloSecao como="h1">Algo deu errado</TituloSecao>
      <p className="max-w-[56ch] text-lg leading-relaxed">Não conseguimos abrir esta página agora. Tente de novo em instantes.</p>
      <div className="flex flex-wrap gap-2.5">
        <Botao type="button" onClick={reset}>
          Tentar de novo
        </Botao>
        <BotaoLink href="/" variante="secundario">
          Voltar ao início
        </BotaoLink>
      </div>
      <p className="max-w-full text-xs break-all text-texto-suave">
        Detalhe técnico: {error.message || "sem mensagem"}
        {error.digest ? ` · ${error.digest}` : ""}
      </p>
    </div>
  );
}
