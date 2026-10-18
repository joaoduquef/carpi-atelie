import type { Modelo } from "@/lib/tipos";
import { NomeProduto } from "./NomeProduto";

export function CardEmBreve({ modelo }: { modelo: Modelo }) {
  return (
    <article className="@container grid min-w-0 content-start gap-2.5 self-start" aria-label={`${modelo.nome}, em breve`}>
      <div className="relative grid aspect-[1/1.08] w-full place-items-center rounded-card bg-bloco-amarelo">
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
