import Image from "next/image";
import { classeFundo } from "@/lib/catalogo";
import type { LinhaSacola } from "./itensSacola";

export function MiniaturaAbajur({ linha, tamanho = "w-[76px]" }: { linha: LinhaSacola; tamanho?: string }) {
  return (
    <span className={`relative grid aspect-square ${tamanho} shrink-0 place-items-center rounded-[14px] ${classeFundo(linha.cor)}`}>
      <span className="relative h-[72%] w-[52%]">
        <Image src={linha.imagemApagado.url} alt="" fill sizes="76px" className="object-contain" />
      </span>
    </span>
  );
}
