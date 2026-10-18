"use client";

import { useLuzes } from "./LuzesProvider";
import { Botao } from "@/components/ui/Botao";

export function BotaoLuzes({ className = "", variante = "secundario" }: { className?: string; variante?: "primario" | "secundario" }) {
  const { apagadas, alternar } = useLuzes();
  return (
    <Botao type="button" variante={variante} onClick={alternar} aria-pressed={apagadas} className={className}>
      {apagadas ? "Acender as luzes" : "Apagar as luzes"}
    </Botao>
  );
}
