import type { Modelo } from "@/lib/tipos";
import { NomeProduto } from "./NomeProduto";

export function CardEmBreve({ modelo }: { modelo: Modelo }) {
  return (
    <article className="group @container relative grid min-w-0 content-start gap-2.5 self-start transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.04] focus-within:z-10 focus-within:scale-[1.04] motion-reduce:transition-none" aria-label={`${modelo.nome}, em breve`}>
      <div className="fundo-abajur grid aspect-[1/1.08] w-full place-items-center overflow-hidden rounded-card bg-bloco-amarelo transition-colors duration-500 group-hover:bg-[color-mix(in_srgb,var(--rosa)_13%,var(--fundo))]">
        <span className="absolute top-3 left-3 rounded-full bg-selo px-2.5 py-0.5 text-xs font-bold text-selo-texto">
          Em breve
        </span>
        <span className="mr-[-0.2em] text-[min(3rem,17cqi)] font-bold tracking-[0.2em] text-destaque">
          {modelo.nome.toLocaleUpperCase("pt-BR")}
        </span>
      </div>
      <div className="px-1 text-[0.95rem]">
        <NomeProduto modelo={modelo.nome} />
      </div>
    </article>
  );
}
