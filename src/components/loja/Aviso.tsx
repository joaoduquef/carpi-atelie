"use client";

import { useLoja } from "./LojaProvider";

/** Mensagem curta no rodapé da tela ("Adicionado à sacola"), lida também por leitores de tela. */
export function Aviso() {
  const { aviso } = useLoja();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
    >
      {aviso && (
        <span className="rounded-full bg-botao px-5 py-3 text-sm font-bold text-botao-texto shadow-lg">{aviso}</span>
      )}
    </div>
  );
}
