"use client";

import { useEffect, useRef, useState } from "react";

/** Faixa horizontal com rolagem por toque e barra de progresso, como nas referências. */
export function Carrossel({ children, rotulo }: { children: React.ReactNode; rotulo: string }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [barra, setBarra] = useState({ largura: 100, inicio: 0 });

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const medir = () => {
      const visivel = el.clientWidth / el.scrollWidth;
      const max = el.scrollWidth - el.clientWidth;
      const pos = max > 0 ? el.scrollLeft / max : 0;
      const largura = Math.max(visivel, 0.15);
      setBarra({ largura: largura * 100, inicio: pos * (1 - largura) * 100 });
    };
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      obs.disconnect();
    };
  }, []);

  return (
    <div className="grid gap-4">
      <div
        ref={trilho}
        role="region"
        aria-label={rotulo}
        tabIndex={0}
        className="sem-barra grid snap-x snap-mandatory auto-cols-[232px] grid-flow-col gap-3 overflow-x-auto pb-1"
      >
        {children}
      </div>
      {barra.largura < 100 && (
        <div aria-hidden className="h-1 overflow-hidden rounded-full bg-bloco-rosa">
          <div className="h-full rounded-full bg-botao" style={{ width: `${barra.largura}%`, marginLeft: `${barra.inicio}%` }} />
        </div>
      )}
    </div>
  );
}

export function ItemCarrossel({ children }: { children: React.ReactNode }) {
  return <div className="snap-start">{children}</div>;
}
