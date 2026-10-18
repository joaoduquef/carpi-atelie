import { TituloSecao } from "./TituloSecao";

/** Molde das páginas de texto (sobre, políticas, entrega...): título e cards que ocupam a largura toda. */
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
        <p className="rounded-card bg-bloco-amarelo px-5 py-3 text-sm text-texto-em-bloco">
          Texto provisório para revisão. Antes de vender, revise com atenção (e, nas políticas, com um advogado ou contador).
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </article>
  );
}

const tons = {
  creme: { fundo: "bg-superficie", titulo: "text-destaque" },
  rosa: { fundo: "bg-bloco-rosa", titulo: "text-destaque" },
  mare: { fundo: "bg-bloco-mare", titulo: "text-destaque" },
  damasco: { fundo: "bg-bloco-damasco", titulo: "text-destaque" },
  amarelo: { fundo: "bg-bloco-amarelo", titulo: "text-destaque" },
} as const;

export type TomCartao = keyof typeof tons;

/** Uma "bolha" de conteúdo. `largo` faz o card ocupar as duas colunas. */
export function CartaoTexto({
  titulo,
  tom = "creme",
  largo = false,
  icone,
  children,
}: {
  titulo?: string;
  /** ícone ao lado do título, no rosa da marca */
  icone?: React.ReactNode;
  tom?: TomCartao;
  largo?: boolean;
  children: React.ReactNode;
}) {
  const t = tons[tom];
  return (
    <section
      className={`grid content-start gap-3 rounded-bloco px-6 py-6 leading-relaxed text-texto sm:px-8 ${t.fundo} ${largo ? "md:col-span-2" : ""} [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1.5`}
    >
      {titulo && (
        <h2 className={`flex items-center gap-2.5 text-lg font-bold tracking-[0.04em] ${t.titulo}`}>
          {icone}
          {titulo}
        </h2>
      )}
      {children}
    </section>
  );
}
