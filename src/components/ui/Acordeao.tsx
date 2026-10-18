import { IconeMais } from "./Icones";

const tons = {
  rosa: "bg-bloco-rosa text-texto-em-bloco",
  mare: "bg-bloco-mare text-texto-em-mare",
  damasco: "bg-bloco-damasco text-texto-em-bloco",
  amarelo: "bg-bloco-amarelo text-texto-em-bloco",
} as const;

export function Acordeao({
  titulo,
  tom,
  aberto = false,
  children,
}: {
  titulo: string;
  tom: keyof typeof tons;
  aberto?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={aberto} className={`group rounded-card ${tons[tom]}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 pr-3.5 pl-5 text-[1.05rem] font-bold [&::-webkit-details-marker]:hidden">
        {titulo}
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-botao text-botao-texto">
          <IconeMais width={14} height={14} className="transition-transform group-open:rotate-45" />
        </span>
      </summary>
      <div className="grid gap-3 px-5 pb-5 text-[0.92rem]">{children}</div>
    </details>
  );
}
