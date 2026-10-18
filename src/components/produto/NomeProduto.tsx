import { nomeCor } from "@/lib/catalogo";
import type { CorSlug } from "@/lib/tipos";

/** "BABI  maré": modelo em caixa alta e negrito, dois espaços, cor em minúsculas. */
export function NomeProduto({ modelo, cor, className = "" }: { modelo: string; cor?: CorSlug; className?: string }) {
  return (
    <span className={`nome-produto ${className}`}>
      <b className="tracking-[0.1em]">{modelo.toLocaleUpperCase("pt-BR")}</b>
      {cor ? `  ${nomeCor(cor).toLocaleLowerCase("pt-BR")}` : null}
    </span>
  );
}

export function textoNomeProduto(modelo: string, cor: CorSlug) {
  return `${modelo} ${nomeCor(cor)}`;
}
