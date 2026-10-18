"use client";

import Image from "next/image";
import { useState } from "react";
import { CORES } from "@/data/mock";
import type { CorSlug, Imagem } from "@/lib/tipos";
import { ImagemAbajur } from "@/components/luzes/ImagemAbajur";

type Vista = { chave: string; rotulo: string; render: "abajur" | "aceso" | "foto"; imagem: Imagem };

export function GaleriaProduto({
  cor,
  apagado,
  aceso,
  extras,
}: {
  cor: CorSlug;
  apagado: Imagem;
  aceso: Imagem;
  extras: Imagem[];
}) {
  const c = CORES[cor];
  const vistas: Vista[] = [
    { chave: "apagado", rotulo: "Apagado", render: "abajur", imagem: apagado },
    { chave: "aceso", rotulo: "Aceso", render: "aceso", imagem: aceso },
    ...extras.map((img, i) => ({
      chave: `extra-${i}`,
      rotulo: img.tipo === "desenho_tecnico" ? "Medidas" : "Ambiente",
      render: "foto" as const,
      imagem: img,
    })),
  ];
  const [ativa, setAtiva] = useState(vistas[0].chave);
  const vista = vistas.find((v) => v.chave === ativa) ?? vistas[0];

  return (
    <div className="grid gap-2.5 sm:grid-cols-[64px_1fr]">
      <div className={`relative grid aspect-[1/1.05] place-items-center overflow-hidden rounded-bloco sm:order-2 ${c.fundo}`}>
        {vista.render === "abajur" && (
          <ImagemAbajur apagado={apagado} aceso={aceso} corBrilho={c.hex} sizes="(max-width: 768px) 80vw, 420px" priority className="h-[80%]" />
        )}
        {vista.render === "aceso" && (
          <div className="relative aspect-[8/11] h-[80%]" style={{ filter: `drop-shadow(0 0 18px ${c.hex}cc) drop-shadow(0 0 48px ${c.hex}cc)` }}>
            <Image src={aceso.url} alt={aceso.alt} fill sizes="(max-width: 768px) 80vw, 420px" className="object-contain" />
          </div>
        )}
        {vista.render === "foto" && (
          <Image
            src={vista.imagem.url}
            alt={vista.imagem.alt}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className={vista.imagem.tipo === "desenho_tecnico" ? "bg-white object-contain p-4" : "object-cover"}
          />
        )}
      </div>
      <div role="group" aria-label="Fotos do produto" className="flex gap-2 sm:order-1 sm:grid sm:content-start">
        {vistas.map((v) => (
          <button
            key={v.chave}
            type="button"
            aria-pressed={v.chave === ativa}
            aria-label={v.rotulo}
            onClick={() => setAtiva(v.chave)}
            className={`relative grid aspect-square w-16 place-items-center overflow-hidden rounded-xl border border-linha bg-superficie ${
              v.chave === ativa ? "outline-2 outline-offset-1 outline-destaque" : ""
            }`}
          >
            <Image
              src={v.imagem.url}
              alt=""
              fill
              sizes="64px"
              className={v.render === "foto" ? (v.imagem.tipo === "desenho_tecnico" ? "bg-white object-contain" : "object-cover") : "object-contain p-2"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
