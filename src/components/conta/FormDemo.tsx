"use client";

import { useState } from "react";

/** Formulário que ainda não envia nada (Fase 1). Evita que a senha vá parar na barra de endereço. */
export function FormDemo({ children }: { children: React.ReactNode }) {
  const [enviado, setEnviado] = useState(false);
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setEnviado(true);
      }}
    >
      {children}
      <p role="status" className="text-center text-sm font-bold text-destaque">
        {enviado ? "Demonstração: esta ação passa a funcionar na Fase 2." : ""}
      </p>
    </form>
  );
}
