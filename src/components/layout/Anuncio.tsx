"use client";

import { useEffect, useState } from "react";

type Mensagem = { texto: string; href?: string };

/** Faixa do topo: as mensagens vão se alternando (para enquanto o mouse está em cima). */
export function Anuncio({ mensagens, segundos = 5 }: { mensagens: readonly Mensagem[]; segundos?: number }) {
  const [indice, setIndice] = useState(0);
  const [visivel, setVisivel] = useState(true);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado || mensagens.length < 2) return;
    let troca: ReturnType<typeof setTimeout>;
    const ciclo = setInterval(() => {
      setVisivel(false);
      troca = setTimeout(() => {
        setIndice((i) => (i + 1) % mensagens.length);
        setVisivel(true);
      }, 300);
    }, segundos * 1000);
    return () => {
      clearInterval(ciclo);
      clearTimeout(troca);
    };
  }, [pausado, mensagens.length, segundos]);

  // todas as mensagens ficam empilhadas no mesmo lugar: a faixa tem sempre a altura da maior (não pula ao trocar)
  return (
    <div className="grid" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)}>
      {mensagens.map((m, i) => {
        const atual = i === indice;
        return (
          <p
            key={m.texto}
            aria-hidden={!atual}
            className={`[grid-area:1/1] self-center transition-opacity duration-300 motion-reduce:transition-none ${atual && visivel ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {m.href ? (
              <a href={m.href} tabIndex={atual ? undefined : -1} className="underline-offset-4 hover:underline">
                {m.texto}
              </a>
            ) : (
              m.texto
            )}
          </p>
        );
      })}
    </div>
  );
}
