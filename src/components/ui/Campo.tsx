import { useId } from "react";

export const classeEntrada =
  "w-full min-w-0 rounded-xl border border-linha bg-fundo px-4 py-2.5 text-texto placeholder:text-texto-suave/70 aria-[invalid=true]:border-erro";

export function Campo({
  rotulo,
  erro,
  dica,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { rotulo: string; erro?: string; dica?: string }) {
  const id = useId();
  return (
    <div className={`grid gap-1 ${className}`}>
      <label htmlFor={id} className="text-sm font-bold">
        {rotulo}
      </label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro || dica ? `${id}-ajuda` : undefined}
        className={classeEntrada}
        {...props}
      />
      {(erro || dica) && (
        <span id={`${id}-ajuda`} className={`text-xs ${erro ? "font-bold text-erro" : "text-texto-suave"}`}>
          {erro ?? dica}
        </span>
      )}
    </div>
  );
}
