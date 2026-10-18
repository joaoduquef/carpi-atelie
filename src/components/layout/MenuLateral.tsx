"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LOJA, urlInstagram } from "@/config/loja";
import { useLoja } from "@/components/loja/LojaProvider";
import { BotaoLuzes } from "@/components/luzes/BotaoLuzes";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { IconeFechar } from "@/components/ui/Icones";
import { Logo } from "./Logo";
import { LINKS_AJUDA } from "./navegacao";

/** Painel do celular. Usa <dialog> para ter foco preso, tecla Esc e fundo escurecido. */
export function MenuLateral({ aberto, aoFechar, nomeUsuario }: { aberto: boolean; aoFechar: () => void; nomeUsuario: string | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  const caminho = usePathname();
  const { totalItens, favoritos } = useLoja();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  // fecha ao navegar
  useEffect(() => {
    aoFechar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caminho]);

  const principais = [
    { href: "/colecao", rotulo: "Coleção" },
    { href: "/favoritos", rotulo: "Favoritos", extra: favoritos.length ? `${favoritos.length} ${favoritos.length === 1 ? "peça" : "peças"}` : "" },
    { href: "/sacola", rotulo: "Sacola", extra: totalItens ? `${totalItens} ${totalItens === 1 ? "item" : "itens"}` : "" },
    nomeUsuario
      ? { href: "/minha-conta", rotulo: "Minha conta", extra: `olá, ${nomeUsuario}` }
      : { href: "/entrar", rotulo: "Entrar", extra: "ou criar conta" },
    { href: "/sobre", rotulo: "Sobre nós" },
    { href: "/contato", rotulo: "Contato" },
  ];

  return (
    <dialog
      id="menu-lateral"
      ref={ref}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
      aria-label="Menu"
      className="fixed inset-y-0 right-0 left-auto m-0 h-full max-h-none w-[86%] max-w-sm rounded-l-[26px] border-l border-linha bg-superficie p-0 text-texto backdrop:bg-black/40"
    >
      <div
        className="grid content-start gap-6 px-6 py-5"
        style={{ paddingTop: "calc(20px + env(safe-area-inset-top, 0px))", paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center justify-between">
          <Logo className="h-8 w-[108px]" />
          <BotaoIcone aria-label="Fechar menu" onClick={aoFechar}>
            <IconeFechar />
          </BotaoIcone>
        </div>
        <nav aria-label="Páginas principais" className="grid">
          {principais.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between border-b border-linha py-3 text-lg font-bold tracking-[0.08em] text-titulo uppercase"
            >
              {l.rotulo}
              {l.extra && <span className="text-sm font-normal tracking-normal text-texto-suave normal-case">{l.extra}</span>}
            </Link>
          ))}
        </nav>
        <nav aria-label="Ajuda" className="grid gap-1 text-[0.92rem]">
          {LINKS_AJUDA.map((l) => (
            <Link key={l.href} href={l.href} className="py-1 text-texto-suave">
              {l.rotulo}
            </Link>
          ))}
        </nav>
        <BotaoLuzes />
        <div className="grid gap-0.5 text-sm text-texto-suave">
          <span className="select-all">{LOJA.email}</span>
          <a href={urlInstagram} className="text-texto-suave" target="_blank" rel="noreferrer">
            @{LOJA.instagram}
          </a>
        </div>
      </div>
    </dialog>
  );
}
