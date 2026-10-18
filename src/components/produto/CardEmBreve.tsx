import type { Modelo } from "@/lib/tipos";
import { NomeProduto } from "./NomeProduto";

export function CardEmBreve({ modelo }: { modelo: Modelo }) {
  return (
    <article className="@container grid min-w-0 content-start gap-1.5 self-start" aria-label={`${modelo.nome}, em breve`}>
      <div className="relative grid aspect-[1/1.02] w-full place-items-center rounded-card bg-bloco-amarelo">
        <span className="absolute top-3 left-3 rounded-full bg-amarelo px-2.5 py-0.5 text-xs font-bold text-tinta ring-1 ring-tinta/20">
          Em breve
        </span>
        <span className="mr-[-0.2em] text-[min(3rem,17cqi)] font-bold tracking-[0.2em] text-texto-em-bloco">
          {modelo.nome.toLocaleUpperCase("pt-BR")}
        </span>
      </div>
      <div className="rounded-[14px] bg-superficie px-3 py-2.5 text-[0.92rem]">
        <NomeProduto modelo={modelo.nome} />
      </div>
    </article>
  );
}
