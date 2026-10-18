import type { Metadata } from "next";
import Link from "next/link";
import { CONTA_DEMO, ROTULO_STATUS, type StatusPedido } from "@/data/contaDemo";
import { buscarVariacao, buscarModelo } from "@/lib/catalogo";
import { formatarData } from "@/lib/datas";
import { formatarReais } from "@/lib/dinheiro";
import { NomeProduto } from "@/components/produto/NomeProduto";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

const ETAPAS: StatusPedido[] = ["aguardando_pagamento", "pago", "em_producao", "enviado", "entregue"];

const corStatus: Record<StatusPedido, string> = {
  aguardando_pagamento: "bg-amarelo text-tinta",
  pago: "bg-mare text-tinta",
  em_producao: "bg-damasco-claro text-tinta",
  enviado: "bg-rosa-claro text-tinta",
  entregue: "bg-creme-claro text-tinta ring-1 ring-tinta/30",
  cancelado: "bg-tinta text-creme",
};

function Bloco({ titulo, children, id }: { titulo: string; children: React.ReactNode; id: string }) {
  return (
    <section id={id} aria-labelledby={`t-${id}`} className="grid scroll-mt-6 gap-4 rounded-card border border-linha bg-superficie px-5 py-5">
      <h2 id={`t-${id}`} className="text-base font-bold tracking-[0.08em] text-titulo uppercase">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default function MinhaConta() {
  const c = CONTA_DEMO;
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <TituloSecao como="h1">Minha conta</TituloSecao>
        <span className="text-sm text-texto-suave">Olá, {c.nome.split(" ")[0]}</span>
      </div>
      <p className="rounded-card bg-bloco-amarelo px-4 py-3 text-sm text-texto-em-bloco">
        Demonstração com dados fictícios. Na Fase 2 esta página mostra os dados reais de quem entrou na conta.{" "}
        <Link href="/entrar" className="font-bold underline underline-offset-4">
          Ver a tela de entrar
        </Link>
      </p>

      <nav aria-label="Seções da conta" className="sem-barra flex gap-2 overflow-x-auto text-sm">
        {[
          ["#pedidos", "Pedidos"],
          ["#dados", "Meus dados"],
          ["#enderecos", "Endereços"],
          ["/favoritos", "Favoritos"],
          ["#privacidade", "Privacidade"],
        ].map(([href, rotulo]) => (
          <a key={href} href={href} className="rounded-full border border-linha bg-superficie px-4 py-1.5 whitespace-nowrap">
            {rotulo}
          </a>
        ))}
      </nav>

      <Bloco titulo="Pedidos" id="pedidos">
        <ul className="grid gap-3">
          {c.pedidos.map((p) => {
            const etapa = ETAPAS.indexOf(p.status);
            return (
              <li key={p.numero} className="grid gap-3 rounded-xl border border-linha bg-fundo px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>Pedido nº {p.numero}</strong>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${corStatus[p.status]}`}>{ROTULO_STATUS[p.status]}</span>
                </div>
                <ol aria-label="Andamento" className="grid grid-cols-5 gap-1">
                  {ETAPAS.map((e, i) => (
                    <li key={e} title={ROTULO_STATUS[e]} className={`h-1.5 rounded-full ${i <= etapa ? "bg-botao" : "bg-linha"}`}>
                      <span className="sr-only">
                        {ROTULO_STATUS[e]}: {i <= etapa ? "concluído" : "pendente"}
                      </span>
                    </li>
                  ))}
                </ol>
                <ul className="text-sm">
                  {p.itens.map((it) => {
                    const v = buscarVariacao(it.variacaoId);
                    const m = v && buscarModelo(v.modeloSlug);
                    return v && m ? (
                      <li key={it.variacaoId}>
                        {it.quantidade} × <NomeProduto modelo={m.nome} cor={v.cor} />
                      </li>
                    ) : null;
                  })}
                </ul>
                <div className="flex flex-wrap justify-between gap-2 text-sm text-texto-suave">
                  <span>
                    {formatarData(p.data)} · {p.pagamento}
                  </span>
                  <strong className="text-texto tabular-nums">{formatarReais(p.totalCentavos)}</strong>
                </div>
                {p.rastreio && (
                  <p className="text-sm">
                    Código de rastreio: <strong className="select-all">{p.rastreio}</strong> ·{" "}
                    <a href={p.urlRastreio} target="_blank" rel="noreferrer" className="text-link underline underline-offset-4">
                      Rastrear na Jadlog
                    </a>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Bloco>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Bloco titulo="Meus dados" id="dados">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="font-bold">Nome</dt>
            <dd>{c.nome}</dd>
            <dt className="font-bold">E-mail</dt>
            <dd className="break-all">{c.email}</dd>
            <dt className="font-bold">CPF</dt>
            <dd>{c.cpf}</dd>
            <dt className="font-bold">Celular</dt>
            <dd>{c.telefone}</dd>
          </dl>
          <Botao variante="secundario" className="justify-self-start">
            Editar dados
          </Botao>
        </Bloco>

        <Bloco titulo="Endereços" id="enderecos">
          <ul className="grid gap-2.5 text-sm">
            {c.enderecos.map((e) => (
              <li key={e.apelido} className="rounded-xl border border-linha bg-fundo px-4 py-3">
                <strong>{e.apelido}</strong>
                {e.padrao && <span className="ml-2 rounded-full bg-amarelo px-2 py-0.5 text-xs font-bold text-tinta">Padrão</span>}
                <p>{e.linha1}</p>
                <p className="text-texto-suave">{e.linha2}</p>
              </li>
            ))}
          </ul>
          <Botao variante="secundario" className="justify-self-start">
            Adicionar endereço
          </Botao>
        </Bloco>
      </div>

      <Bloco titulo="Privacidade" id="privacidade">
        <p className="text-sm">
          Você pode pedir a exclusão dos seus dados pessoais. Os dados de pedidos já feitos são guardados pelo prazo exigido pela legislação fiscal.{" "}
          <Link href="/privacidade" className="text-link underline underline-offset-4">
            Ler a política de privacidade
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          <Botao variante="secundario">Pedir exclusão dos meus dados</Botao>
          <BotaoLink href="/" variante="secundario">
            Sair
          </BotaoLink>
        </div>
      </Bloco>
    </div>
  );
}
