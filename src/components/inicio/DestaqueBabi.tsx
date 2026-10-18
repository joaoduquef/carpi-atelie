"use client";

import Link from "next/link";
import { useState } from "react";
import { CORES, ORDEM_CORES } from "@/data/mock";
import type { ProdutoCard } from "@/lib/catalogo";
import { urlProduto } from "@/lib/catalogo";
import type { CorSlug } from "@/lib/tipos";
import { ImagemAbajur } from "@/components/luzes/ImagemAbajur";
import { NomeProduto } from "@/components/produto/NomeProduto";

/** Painel direito do destaque: a Babi grande, com bolinhas para trocar a cor. */
export function DestaqueBabi({ produtos }: { produtos: ProdutoCard[] }) {
  const [cor, setCor] = useState<CorSlug>("damasco");
  const atual = produtos.find((p) => p.variacao.cor === cor) ?? produtos[0];
  if (!atual) return null;
  const c = CORES[atual.variacao.cor];

  return (
    <div className={`grid rounded-bloco p-4 sm:p-5 ${c.fundo}`}>
      <div className="grid place-items-center gap-4 rounded-[20px] bg-superficie px-4 pt-8 pb-5">
        <Link href={urlProduto(atual.modelo.slug, atual.variacao.cor)} className="w-[46%] max-w-[230px]">
          <ImagemAbajur
            apagado={atual.imagemApagado}
            aceso={atual.imagemAceso}
            corBrilho={c.hex}
            sizes="(max-width: 768px) 46vw, 230px"
            priority
            className="w-full"
          />
        </Link>
        <div className="flex items-center gap-2.5 text-sm" role="group" aria-label="Cor da Babi">
          {ORDEM_CORES.filter((s) => produtos.some((p) => p.variacao.cor === s)).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === cor}
              aria-label={CORES[s].nome}
              onClick={() => setCor(s)}
              className={`h-7 w-7 rounded-full border-[3px] border-superficie outline-2 outline-offset-0 ${s === cor ? "outline-destaque" : "outline-transparent"}`}
              style={{ background: CORES[s].hex }}
            />
          ))}
          <NomeProduto modelo={atual.modelo.nome} cor={atual.variacao.cor} className="ml-1" />
        </div>
      </div>
    </div>
  );
}
