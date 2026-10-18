"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const CHAVE = "carpi:luzes";

type Luzes = { apagadas: boolean; alternar: () => void };

const LuzesContext = createContext<Luzes>({ apagadas: false, alternar: () => {} });

/** Roda antes da página aparecer, para não piscar quando a escolha salva é "apagadas". */
export const scriptLuzes = `try{if(sessionStorage.getItem("${CHAVE}")==="apagadas")document.documentElement.classList.add("apagadas")}catch(e){}`;

export function LuzesProvider({ children }: { children: React.ReactNode }) {
  const [apagadas, setApagadas] = useState(false);

  useEffect(() => {
    setApagadas(document.documentElement.classList.contains("apagadas"));
  }, []);

  const alternar = useCallback(() => {
    const raiz = document.documentElement;
    const novo = !raiz.classList.contains("apagadas");
    raiz.classList.toggle("apagadas", novo);
    try {
      sessionStorage.setItem(CHAVE, novo ? "apagadas" : "acesas");
    } catch {
      // navegação privada ou armazenamento bloqueado: a escolha vale só nesta página
    }
    setApagadas(novo);
  }, []);

  return <LuzesContext.Provider value={{ apagadas, alternar }}>{children}</LuzesContext.Provider>;
}

export function useLuzes() {
  return useContext(LuzesContext);
}
