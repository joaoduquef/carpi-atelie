import type { Modelo } from "@/lib/tipos";
import { NomeProduto } from "./NomeProduto";

export function CardEmBreve({ modelo }: { modelo: Modelo }) {
  return (
    <article className="@container grid min-w-0 content-start self-start overflow-hidden rounded-card bg-superficie" aria-label={`${modelo.nome}, em breve`}>
      <div className="relative grid aspect-[1/1.02] w-full place-items-center bg-bloco-amarelo">
        <span className="absolute top-3 left-3 rounded-full bg-amarelo px-2.5 py-0.5 text-xs font-bold text-tinta ring-1 ring-tinta/20">
          Em breve
        </span>
        <span className="mr-[-0.2em] text-[min(3rem,17cqi)] font-bold tracking-[0.2em] text-texto-em-bloco">
          {modelo.nome.toLocaleUpperCase("pt-BR")}
        </span>
      </div>
      <div className="border-t-[1.5px] border-[var(--contorno)] bg-superficie px-3 py-2.5 text-[0.92rem]">
        <NomeProduto modelo={modelo.nome} />
      </div>
    </article>
  );
}
