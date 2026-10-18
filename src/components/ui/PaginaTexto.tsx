import { TituloSecao } from "./TituloSecao";

/** Molde das páginas de texto (sobre, políticas, entrega...). */
export function PaginaTexto({
  titulo,
  provisorio = false,
  children,
}: {
  titulo: string;
  provisorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="grid gap-6">
      <TituloSecao como="h1">{titulo}</TituloSecao>
      {provisorio && (
        <p className="rounded-card bg-bloco-amarelo px-4 py-3 text-sm text-texto-em-bloco">
          Texto provisório para revisão. Antes de vender, revise com atenção (e, nas políticas, com um advogado ou contador).
        </p>
      )}
      <div className="grid max-w-[68ch] gap-4 leading-relaxed [&_a]:text-link [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-titulo [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1.5">
        {children}
      </div>
    </article>
  );
}
