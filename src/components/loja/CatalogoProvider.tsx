"use client";

import { createContext, useContext } from "react";
import type { Catalogo } from "@/lib/tipos";

const CatalogoContext = createContext<Catalogo | null>(null);

/** Leva o catálogo (carregado no servidor) para os componentes do navegador: sacola, favoritos, checkout. */
export function CatalogoProvider({ catalogo, children }: { catalogo: Catalogo; children: React.ReactNode }) {
  return <CatalogoContext.Provider value={catalogo}>{children}</CatalogoContext.Provider>;
}

export function useCatalogo(): Catalogo {
  const c = useContext(CatalogoContext);
  if (!c) throw new Error("useCatalogo precisa estar dentro de <CatalogoProvider>");
  return c;
}
