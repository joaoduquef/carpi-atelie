"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { classeFundo, urlProduto, type ProdutoCard } from "@/lib/catalogo";
import { ImagemAbajur } from "@/components/luzes/ImagemAbajur";
import { NomeProduto } from "@/components/produto/NomeProduto";

const INTERVALO_MS = 3500;

/**
 * Painel direito do destaque: o primeiro modelo grande, passando sozinho pelas cores.
 * A troca automática para quando a pessoa passa o mouse, foca com o teclado ou escolhe
 * uma cor, e não acontece para quem prefere menos movimento.
 */
export function DestaqueBabi({ produtos, corInicial }: { produtos: ProdutoCard[]; corInicial?: string }) {
  const inicial = Math.max(0, produtos.findIndex((p) => p.cor.slug === corInicial));
  const [indice, setIndice] = useState(inicial);
  const [pausado, setPausado] = useState(false);
  const [escolheu, setEscolheu] = useState(false);

  useEffect(() => {
    if (pausado || escolheu || produtos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndice((i) => (i + 1) % produtos.length), INTERVALO_MS);
    return () => window.clearInterval(t);
  }, [pausado, escolheu, produtos.length]);

  const atual = produtos[indice] ?? produtos[0];
  if (!atual) return null;

  return (
    <div
      className={`grid rounded-bloco transition-colors duration-700 ${classeFundo(atual.cor)}`}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="grid place-items-center gap-5 px-4 pt-10 pb-6">
        <Link href={urlProduto(atual.modelo.slug, atual.cor.slug)} className="grid w-[52%] max-w-[300px]" aria-label={`Ver ${atual.modelo.nome} ${atual.cor.nome}`}>
          {produtos.map((p, i) => (
            <div
              key={p.variacao.id}
              aria-hidden={i !== indice}
              className={`[grid-area:1/1] transition-opacity duration-700 ease-out motion-reduce:transition-none ${i === indice ? "opacity-100" : "opacity-0"}`}
            >
              <ImagemAbajur
                apagado={p.imagemApagado}
                aceso={p.imagemAceso}
                corBrilho={p.cor.hex}
                sizes="(max-width: 768px) 52vw, 300px"
                priority={i === inicial}
                className="w-full"
              />
            </div>
          ))}
        </Link>
        <div className="flex items-center gap-2.5 text-sm" role="group" aria-label={`Cor da ${atual.modelo.nome}`}>
          {produtos.map((p, i) => (
            <button
              key={p.cor.slug}
              type="button"
              aria-pressed={i === indice}
              aria-label={p.cor.nome}
              onClick={() => {
                setIndice(i);
                setEscolheu(true);
              }}
              className={`h-7 w-7 rounded-full border-[3px] border-fundo outline-2 outline-offset-0 transition-[outline-color] duration-300 ${
                i === indice ? "outline-destaque" : "outline-transparent"
              }`}
              style={{ background: p.cor.hex }}
            />
          ))}
          <NomeProduto modelo={atual.modelo.nome} cor={atual.cor.nome} className="ml-1 min-w-[9.5em]" />
        </div>
      </div>
    </div>
  );
}
