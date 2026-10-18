import Link from "next/link";
import { LOJA, urlInstagram } from "@/config/loja";
import { LINKS_AJUDA } from "./navegacao";

export function Rodape() {
  return (
    <footer className="w-full bg-rodape text-rodape-texto" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="@container mx-auto grid max-w-6xl gap-10 overflow-hidden px-4 pt-12 pb-8 sm:px-6">
        <p aria-hidden className="mr-[-0.12em] text-[25.5cqi] leading-[0.9] font-bold tracking-[0.12em]">
          CARPI
        </p>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
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
              <li key={m.arquivo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/payments/${m.arquivo}.svg`} alt={m.nome} title={m.nome} width={38} height={24} className="h-6 w-[38px]" loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
