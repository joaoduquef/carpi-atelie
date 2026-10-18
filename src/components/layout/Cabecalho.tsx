"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLoja } from "@/components/loja/LojaProvider";
import { BotaoIcone, Contador, LinkIcone } from "@/components/ui/BotaoIcone";
import { IconeConta, IconeCoracao, IconeMenu, IconeSacola } from "@/components/ui/Icones";
import { Logo } from "./Logo";
import { MenuLateral } from "./MenuLateral";
import { LINKS_PRINCIPAIS } from "./navegacao";

export function Cabecalho({ nomeUsuario }: { nomeUsuario: string | null }) {
  const caminho = usePathname();
  const { totalItens, favoritos } = useLoja();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rosa/20 bg-fundo/95 backdrop-blur-md" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-7">
      <Link href="/" aria-label="CARPI Ateliê, página inicial" className="block">
        <Logo className="h-11 w-[149px] sm:h-12 sm:w-[163px]" />
      </Link>

      <nav aria-label="Principal" className="hidden items-center gap-1 text-[0.82rem] font-bold tracking-[0.1em] uppercase md:flex">
        {LINKS_PRINCIPAIS.map((l) => {
          const ativo = caminho.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={ativo ? "page" : undefined}
              className={`rounded-full px-4 py-2 transition-colors ${ativo ? "text-destaque" : "text-texto hover:text-destaque"}`}
            >
              {l.rotulo}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-1.5">
        <span className="hidden md:contents">
          <LinkIcone tom="nu" href={nomeUsuario ? "/minha-conta" : "/entrar"} aria-label={nomeUsuario ? `Minha conta (${nomeUsuario})` : "Entrar"}>
            <IconeConta />
          </LinkIcone>
        </span>
        <LinkIcone tom="nu" href="/favoritos" aria-label={`Favoritos (${favoritos.length})`}>
          <IconeCoracao />
          <Contador valor={favoritos.length} />
        </LinkIcone>
        <LinkIcone tom="nu" href="/sacola" aria-label={`Sacola (${totalItens} itens)`}>
          <IconeSacola />
          <Contador valor={totalItens} />
        </LinkIcone>
        <BotaoIcone
          tom="nu"
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          aria-controls="menu-lateral"
          onClick={() => setMenuAberto(true)}
          className="max-md:inline-grid md:!hidden"
        >
          <IconeMenu />
        </BotaoIcone>
      </div>

      </div>
      <MenuLateral aberto={menuAberto} aoFechar={() => setMenuAberto(false)} nomeUsuario={nomeUsuario} />
    </header>
  );
}
