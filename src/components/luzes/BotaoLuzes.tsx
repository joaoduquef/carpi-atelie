"use client";

import { useLuzes } from "./LuzesProvider";
import { Botao } from "@/components/ui/Botao";

/**
 * `luzesDoAbajur`: o texto fala da luz da peça (na página do produto), e não da luz da casa:
 * "Acender as luzes" acende o abajur. No resto do site, "Apagar as luzes" apaga a casa e acende o abajur.
 */
export function BotaoLuzes({
  className = "",
  variante = "secundario",
  luzesDoAbajur = false,
}: {
  className?: string;
  variante?: "primario" | "secundario";
  luzesDoAbajur?: boolean;
}) {
  const { apagadas, alternar } = useLuzes();
  const abajurAceso = apagadas;
  const rotulo = luzesDoAbajur
    ? abajurAceso
      ? "Apagar as luzes"
      : "Acender as luzes"
    : abajurAceso
      ? "Acender as luzes"
      : "Apagar as luzes";
  return (
    <Botao type="button" variante={variante} onClick={alternar} aria-pressed={apagadas} className={className}>
      {rotulo}
    </Botao>
  );
}
