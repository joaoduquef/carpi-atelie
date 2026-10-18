"use client";

import { useLuzes } from "./LuzesProvider";
import { Botao } from "@/components/ui/Botao";

/** "Acender as luzes" acende o abajur (o fundo escurece em volta); "Apagar as luzes" apaga. */
export function BotaoLuzes({ className = "", variante = "secundario" }: { className?: string; variante?: "primario" | "secundario" }) {
  const { apagadas: abajurAceso, alternar } = useLuzes();
  return (
    <Botao type="button" variante={variante} onClick={alternar} aria-pressed={abajurAceso} className={className}>
      {abajurAceso ? "Apagar as luzes" : "Acender as luzes"}
    </Botao>
  );
}
