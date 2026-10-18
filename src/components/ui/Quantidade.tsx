"use client";

import { IconeMais, IconeMenos } from "./Icones";

export function Quantidade({
  valor,
  aoMudar,
  max = 9,
  rotulo = "Quantidade",
}: {
  valor: number;
  aoMudar: (n: number) => void;
  max?: number;
  rotulo?: string;
}) {
  return (
    <div role="group" aria-label={rotulo} className="inline-flex items-center rounded-full border border-linha">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={valor <= 1}
        onClick={() => aoMudar(valor - 1)}
        className="grid h-10 w-9 place-items-center text-destaque disabled:opacity-40"
      >
        <IconeMenos width={16} height={16} />
      </button>
      <span aria-live="polite" className="min-w-5 text-center tabular-nums">
        {valor}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={valor >= max}
        onClick={() => aoMudar(valor + 1)}
        className="grid h-10 w-9 place-items-center text-destaque disabled:opacity-40"
      >
        <IconeMais width={16} height={16} />
      </button>
    </div>
  );
}
