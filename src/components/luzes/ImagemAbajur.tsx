import Image from "next/image";
import type { Imagem } from "@/lib/tipos";

/**
 * Foto do abajur que troca de apagado para aceso quando as luzes se apagam.
 * A troca é feita só com CSS (classes em globals.css), sem JavaScript.
 */
export function ImagemAbajur({
  apagado,
  aceso,
  corBrilho,
  sizes,
  priority = false,
  className = "",
}: {
  apagado: Imagem;
  aceso: Imagem;
  corBrilho: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`abajur-brilho relative aspect-[8/11] ${className}`}
      style={{ "--brilho": `${corBrilho}cc` } as React.CSSProperties}
    >
      <Image src={apagado.url} alt={apagado.alt} fill sizes={sizes} priority={priority} className="abajur-apagado object-contain" />
      <Image src={aceso.url} alt="" aria-hidden fill sizes={sizes} priority={priority} className="abajur-aceso object-contain" />
    </div>
  );
}
