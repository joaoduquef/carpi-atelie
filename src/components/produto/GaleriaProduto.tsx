"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { classeFundo } from "@/lib/catalogo";
import type { Cor, Imagem } from "@/lib/tipos";
import { ImagemAbajur } from "@/components/luzes/ImagemAbajur";
import { useLuzes } from "@/components/luzes/LuzesProvider";
import { IconeAvancar, IconeVoltar } from "@/components/ui/Icones";

/** Distância mínima (px) do arraste para trocar de foto. */
const ARRASTE_MINIMO = 40;

type Vista = {
  chave: string;
  rotulo: string;
  render: "abajur" | "aceso" | "foto";
  imagem: Imagem;
};

export function GaleriaProduto({
  cor,
  apagado,
  aceso,
  extras,
}: {
  cor: Cor;
  apagado: Imagem;
  aceso: Imagem;
  extras: Imagem[];
}) {
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
  const [indice, setIndice] = useState(0);
  const vista = vistas[indice] ?? vistas[0];
  const ativa = vista.chave;
  const inicioArraste = useRef<number | null>(null);

  // Ao apagar ou acender as luzes, volta para a foto do abajur, que mostra a peça acendendo ou apagando.
  const { apagadas } = useLuzes();
  const luzesAntes = useRef(apagadas);
  useEffect(() => {
    if (luzesAntes.current !== apagadas) setIndice(0);
    luzesAntes.current = apagadas;
  }, [apagadas]);

  function irPara(i: number) {
    setIndice((i + vistas.length) % vistas.length);
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-[64px_1fr] md:h-full">
      <div
        style={{ "--brilho": `${cor.hex}cc`, touchAction: "pan-y" } as React.CSSProperties}
        className={`${vista.render === "abajur" ? "fundo-abajur" : ""} relative grid aspect-[1/1.05] cursor-grab place-items-center overflow-hidden rounded-bloco select-none active:cursor-grabbing sm:order-2 md:aspect-auto md:h-full md:min-h-[460px] [&_img]:pointer-events-none ${classeFundo(cor)}`}
        onPointerDown={(e) => {
          inicioArraste.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (inicioArraste.current === null) return;
          const dx = e.clientX - inicioArraste.current;
          inicioArraste.current = null;
          if (Math.abs(dx) >= ARRASTE_MINIMO) irPara(indice + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          inicioArraste.current = null;
        }}
      >
        {vista.render === "abajur" && (
          <ImagemAbajur
            apagado={apagado}
            aceso={aceso}
            corBrilho={cor.hex}
            sizes="(max-width: 768px) 80vw, 420px"
            priority
            className="h-[80%]"
          />
        )}
        {vista.render === "aceso" && (
          <div
            className="relative aspect-[8/11] h-[80%]"
            style={{
              filter: `drop-shadow(0 0 18px ${cor.hex}cc) drop-shadow(0 0 48px ${cor.hex}cc)`,
            }}
          >
            <Image
              src={aceso.url}
              alt={aceso.alt}
              fill
              sizes="(max-width: 768px) 80vw, 420px"
              className="object-contain"
            />
          </div>
        )}
        {vista.render === "foto" && (
          <Image
            src={vista.imagem.url}
            alt={vista.imagem.alt}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className={
              vista.imagem.tipo === "desenho_tecnico"
                ? "bg-white object-contain p-4"
                : "object-cover"
            }
          />
        )}
        {vistas.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => irPara(indice - 1)}
              className="absolute top-1/2 left-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-destaque transition-colors hover:bg-white"
            >
              <IconeVoltar width={20} height={20} />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => irPara(indice + 1)}
              className="absolute top-1/2 right-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-destaque transition-colors hover:bg-white"
            >
              <IconeAvancar width={20} height={20} />
            </button>
          </>
        )}
      </div>
      <div
        role="group"
        aria-label="Fotos do produto"
        className="flex gap-2 sm:order-1 sm:grid sm:content-start"
      >
        {vistas.map((v, i) => (
          <button
            key={v.chave}
            type="button"
            aria-pressed={v.chave === ativa}
            aria-label={v.rotulo}
            onClick={() => setIndice(i)}
            className={`relative grid aspect-square w-16 place-items-center overflow-hidden rounded-xl bg-superficie ${
              v.chave === ativa
                ? "outline-2 outline-offset-1 outline-destaque"
                : ""
            }`}
          >
            <Image
              src={v.imagem.url}
              alt=""
              fill
              sizes="64px"
              className={
                v.render === "foto"
                  ? v.imagem.tipo === "desenho_tecnico"
                    ? "bg-white object-contain"
                    : "object-cover"
                  : "object-contain p-2"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}
