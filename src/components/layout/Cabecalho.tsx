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

export function Cabecalho() {
  const caminho = usePathname();
  const { totalItens, favoritos } = useLoja();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6">
      <Link href="/" aria-label="CARPI Ateliê, página inicial" className="block">
        <Logo className="h-9 w-[122px]" />
      </Link>

      <nav aria-label="Principal" className="hidden rounded-full border border-linha bg-superficie p-1 text-sm md:flex">
        {LINKS_PRINCIPAIS.map((l) => {
          const ativo = caminho.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={ativo ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 ${ativo ? "bg-botao font-bold text-botao-texto" : "text-destaque hover:bg-botao/10"}`}
            >
              {l.rotulo}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-1.5">
        <span className="hidden md:contents">
          <LinkIcone href="/minha-conta" aria-label="Minha conta">
            <IconeConta />
          </LinkIcone>
        </span>
        <LinkIcone href="/favoritos" aria-label={`Favoritos (${favoritos.length})`}>
          <IconeCoracao />
          <Contador valor={favoritos.length} />
        </LinkIcone>
        <LinkIcone href="/sacola" aria-label={`Sacola (${totalItens} itens)`}>
          <IconeSacola />
          <Contador valor={totalItens} />
        </LinkIcone>
        <BotaoIcone
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          aria-controls="menu-lateral"
          onClick={() => setMenuAberto(true)}
          className="max-md:inline-grid md:!hidden"
        >
          <IconeMenu />
        </BotaoIcone>
      </div>

      <MenuLateral aberto={menuAberto} aoFechar={() => setMenuAberto(false)} />
    </header>
  );
}
