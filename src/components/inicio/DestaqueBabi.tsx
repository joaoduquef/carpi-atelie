"use client";

import Link from "next/link";
import { useState } from "react";
import { classeFundo, urlProduto, type ProdutoCard } from "@/lib/catalogo";
import { ImagemAbajur } from "@/components/luzes/ImagemAbajur";
import { NomeProduto } from "@/components/produto/NomeProduto";

/** Painel direito do destaque: o primeiro modelo grande, com bolinhas para trocar a cor. */
export function DestaqueBabi({ produtos, corInicial }: { produtos: ProdutoCard[]; corInicial?: string }) {
  const [cor, setCor] = useState(corInicial ?? produtos[0]?.cor.slug);
  const atual = produtos.find((p) => p.cor.slug === cor) ?? produtos[0];
  if (!atual) return null;

  return (
    <div className={`grid rounded-bloco ${classeFundo(atual.cor)}`}>
      <div className="grid place-items-center gap-5 px-4 pt-10 pb-6">
        <Link href={urlProduto(atual.modelo.slug, atual.cor.slug)} className="w-[52%] max-w-[300px]">
          <ImagemAbajur
            apagado={atual.imagemApagado}
            aceso={atual.imagemAceso}
            corBrilho={atual.cor.hex}
            sizes="(max-width: 768px) 46vw, 230px"
            priority
            className="w-full"
          />
        </Link>
        <div className="flex items-center gap-2.5 text-sm" role="group" aria-label={`Cor da ${atual.modelo.nome}`}>
          {produtos.map((p) => (
            <button
              key={p.cor.slug}
              type="button"
              aria-pressed={p.cor.slug === atual.cor.slug}
              aria-label={p.cor.nome}
              onClick={() => setCor(p.cor.slug)}
              className={`h-7 w-7 rounded-full border-[3px] border-fundo outline-2 outline-offset-0 ${
                p.cor.slug === atual.cor.slug ? "outline-destaque" : "outline-transparent"
              }`}
              style={{ background: p.cor.hex }}
            />
          ))}
          <NomeProduto modelo={atual.modelo.nome} cor={atual.cor.nome} className="ml-1" />
        </div>
      </div>
    </div>
  );
}
