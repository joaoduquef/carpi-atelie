import Link from "next/link";
import { LOJA, urlInstagram } from "@/config/loja";
import { LINKS_AJUDA } from "./navegacao";

export function Rodape() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-2 pb-3 sm:px-4" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
      <div className="@container grid gap-8 overflow-hidden rounded-bloco bg-rodape px-6 pt-8 pb-6 text-rodape-texto sm:px-8">
        <p aria-hidden className="mr-[-0.12em] text-[25.5cqi] leading-[0.9] font-bold tracking-[0.12em]">
          CARPI
        </p>
        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3">
          <nav aria-label="Loja" className="grid content-start gap-1.5">
            <strong className="mb-1">Loja</strong>
            <Link href="/colecao">Coleção</Link>
            <Link href="/sobre">Sobre nós</Link>
            <Link href="/minha-conta">Minha conta</Link>
          </nav>
          <nav aria-label="Ajuda" className="grid content-start gap-1.5">
            <strong className="mb-1">Ajuda</strong>
            {LINKS_AJUDA.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.rotulo}
              </Link>
            ))}
          </nav>
          <div className="grid content-start gap-1.5">
            <strong className="mb-1">Fale com a gente</strong>
            <span className="select-all">{LOJA.email}</span>
            <a href={urlInstagram} target="_blank" rel="noreferrer">
              @{LOJA.instagram}
            </a>
            <Link href="/contato">Contato</Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rodape-texto/35 pt-4 text-xs">
          <span>
            {LOJA.nome} · {LOJA.razaoSocial} · CNPJ {LOJA.cnpj}
          </span>
          <ul aria-label="Formas de pagamento" className="flex flex-wrap gap-1.5">
            {LOJA.meiosPagamento.map((m) => (
              <li key={m} className="rounded-md bg-creme-claro px-2 py-0.5 text-[0.7rem] font-bold text-tinta">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
