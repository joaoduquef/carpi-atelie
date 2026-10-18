import Link from "next/link";

const tamanhos = { p: "h-8 w-8", m: "h-10 w-10" } as const;
const tons = {
  suave: "bg-icone-fundo text-icone",
  forte: "bg-botao text-botao-texto",
  branco: "bg-fundo text-icone",
  nu: "bg-transparent text-texto hover:bg-superficie",
} as const;

type Comum = { tamanho?: keyof typeof tamanhos; tom?: keyof typeof tons; className?: string };

function classes({ tamanho = "m", tom = "suave", className = "" }: Comum) {
  return `relative inline-grid shrink-0 place-items-center rounded-full ${tamanhos[tamanho]} ${tons[tom]} ${className}`;
}

export function BotaoIcone({
  tamanho,
  tom,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & Comum & { "aria-label": string }) {
  return <button type="button" className={classes({ tamanho, tom, className })} {...props} />;
}

export function LinkIcone({
  tamanho,
  tom,
  className,
  ...props
}: React.ComponentProps<typeof Link> & Comum & { "aria-label": string }) {
  return <Link className={classes({ tamanho, tom, className })} {...props} />;
}

export function Contador({ valor }: { valor: number }) {
  if (valor <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-selo px-1 text-[0.68rem] font-bold text-selo-texto">
      {valor}
    </span>
  );
}
