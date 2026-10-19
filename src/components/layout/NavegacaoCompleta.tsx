"use client";

import { useEffect } from "react";

/**
 * Faz cada clique em link interno recarregar a página inteira, como num site tradicional
 * (o navegador mostra o "carregando"). Para voltar à navegação instantânea do Next.js,
 * basta tirar <NavegacaoCompleta /> de src/app/layout.tsx.
 */
export function NavegacaoCompleta() {
  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download") || link.origin !== window.location.origin) return;
      // âncoras na mesma página (ex.: "#conteudo") continuam sem recarregar
      if (link.pathname === window.location.pathname && link.search === window.location.search && link.hash) return;
      // impede o Next.js de trocar a página sozinho; o navegador segue o link normalmente
      e.stopPropagation();
    }
    // na fase de captura da window, antes do React (que escuta no document)
    window.addEventListener("click", aoClicar, true);
    return () => window.removeEventListener("click", aoClicar, true);
  }, []);
  return null;
}
