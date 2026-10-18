import Image from "next/image";
import { CORES } from "@/data/mock";
import type { LinhaSacola } from "./itensSacola";

export function MiniaturaAbajur({ linha, tamanho = "w-[76px]" }: { linha: LinhaSacola; tamanho?: string }) {
  return (
    <span className={`relative grid aspect-square ${tamanho} shrink-0 place-items-center rounded-[14px] ${CORES[linha.variacao.cor].fundo}`}>
      <span className="relative h-[72%] w-[52%]">
        <Image src={linha.imagemApagado.url} alt="" fill sizes="76px" className="object-contain" />
      </span>
    </span>
  );
}
