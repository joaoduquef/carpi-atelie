/** "BABI  maré": modelo em caixa alta e negrito, dois espaços, cor em minúsculas. */
export function NomeProduto({ modelo, cor, className = "" }: { modelo: string; cor?: string; className?: string }) {
  return (
    <span className={`nome-produto ${className}`}>
      <b className="tracking-[0.1em]">{modelo.toLocaleUpperCase("pt-BR")}</b>
      {cor ? `  ${cor.toLocaleLowerCase("pt-BR")}` : null}
    </span>
  );
}

/** Versão em texto corrido ("Babi Maré"), para títulos de página e leitores de tela. */
export function textoNomeProduto(modelo: string, cor: string) {
  return `${modelo} ${cor}`;
}
