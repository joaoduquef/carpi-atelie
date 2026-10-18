import Link from "next/link";

type Variante = "primario" | "secundario";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-botao px-6 py-3 text-sm font-bold uppercase tracking-[0.07em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variantes: Record<Variante, string> = {
  primario: "bg-botao text-botao-texto hover:brightness-110",
  secundario: "bg-transparent text-destaque hover:bg-botao/10",
};

export function classesBotao(variante: Variante = "primario", extra = "") {
  return `${base} ${variantes[variante]} ${extra}`;
}

export function Botao({
  variante = "primario",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return <button className={classesBotao(variante, className)} {...props} />;
}

export function BotaoLink({
  variante = "primario",
  className = "",
  ...props
}: React.ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={classesBotao(variante, className)} {...props} />;
}
