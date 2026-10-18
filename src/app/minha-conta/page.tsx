import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoSair, DadosPessoais, Enderecos, PedidoExclusao } from "@/components/conta/PartesConta";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { CONTA_DEMO, ROTULO_STATUS, type DadosConta, type StatusPedido } from "@/lib/conta";
import { formatarData } from "@/lib/datas";
import { formatarReais } from "@/lib/dinheiro";
import { supabaseServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

const ETAPAS: StatusPedido[] = ["aguardando_pagamento", "pago", "em_producao", "enviado", "entregue"];

const corStatus: Record<StatusPedido, string> = {
  aguardando_pagamento: "bg-fundo text-destaque ring-1 ring-current",
  pago: "bg-selo text-selo-texto",
  em_producao: "bg-selo text-selo-texto",
  enviado: "bg-selo text-selo-texto",
  entregue: "bg-texto text-fundo",
  cancelado: "bg-fundo text-texto ring-1 ring-current",
};

async function carregarConta(): Promise<DadosConta | null> {
  const sb = await supabaseServidor();
  if (!sb) return CONTA_DEMO;
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;

  const [perfil, enderecos, pedidos] = await Promise.all([
    sb.from("perfis").select("nome, email, cpf, telefone, exclusao_solicitada_em").eq("id", auth.user.id).single(),
    sb.from("enderecos").select("*").order("padrao", { ascending: false }).order("criado_em"),
    sb
      .from("pedidos")
      .select("id, numero, criado_em, status, total_centavos, forma_pagamento, parcelas, codigo_rastreio, url_rastreio, transportadora, pedido_itens(nome, quantidade)")
      .order("criado_em", { ascending: false }),
  ]);

  return {
    perfil: {
      nome: perfil.data?.nome ?? "",
      email: perfil.data?.email ?? auth.user.email ?? "",
      cpf: perfil.data?.cpf ?? null,
      telefone: perfil.data?.telefone ?? null,
      exclusaoSolicitadaEm: perfil.data?.exclusao_solicitada_em ?? null,
    },
    enderecos: enderecos.data ?? [],
    pedidos: (pedidos.data ?? []).map((p) => ({
      id: p.id,
      numero: p.numero,
      criadoEm: p.criado_em,
      status: p.status,
      totalCentavos: p.total_centavos,
      pagamento: p.forma_pagamento === "pix" ? "Pix" : p.forma_pagamento === "cartao" ? `Cartão ${p.parcelas}x` : "—",
      codigoRastreio: p.codigo_rastreio,
      urlRastreio: p.url_rastreio,
      transportadora: p.transportadora,
      itens: p.pedido_itens ?? [],
    })),
  };
}

function Bloco({ titulo, children, id }: { titulo: string; children: React.ReactNode; id: string }) {
  return (
    <section id={id} aria-labelledby={`t-${id}`} className="grid scroll-mt-28 content-start gap-4 rounded-bloco bg-superficie px-5 py-6 sm:px-7">
      <h2 id={`t-${id}`} className="text-base font-bold tracking-[0.08em] text-titulo uppercase">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** "Babi Maré" → BABI  maré */
function NomeItem({ nome }: { nome: string }) {
  const [modelo, ...cor] = nome.split(" ");
  return (
    <span className="nome-produto">
      <b className="tracking-[0.1em]">{modelo.toLocaleUpperCase("pt-BR")}</b>
      {cor.length ? `  ${cor.join(" ").toLocaleLowerCase("pt-BR")}` : ""}
    </span>
  );
}

export default async function MinhaConta({ searchParams }: { searchParams: Promise<{ "bem-vindo"?: string; senha?: string }> }) {
  const params = await searchParams;
  const dados = await carregarConta();
  if (!dados) redirect("/entrar?proximo=/minha-conta");
  const demo = dados === CONTA_DEMO;
  const { perfil, enderecos, pedidos } = dados;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <TituloSecao como="h1">Minha conta</TituloSecao>
        {perfil.nome && <span className="text-sm text-texto-suave">Olá, {perfil.nome.split(" ")[0]}</span>}
      </div>

      {demo && (
        <p className="rounded-card bg-bloco-amarelo px-5 py-3 text-sm text-texto-em-bloco">
          Demonstração com dados fictícios. Quando o Supabase for configurado, esta página mostra a conta de quem entrou.
        </p>
      )}
      {params["bem-vindo"] && (
        <p role="status" className="rounded-card bg-bloco-mare px-5 py-3 text-sm font-bold text-texto-em-mare">
          E-mail confirmado. Boas-vindas à CARPI!
        </p>
      )}
      {params.senha === "ok" && (
        <p role="status" className="rounded-card bg-bloco-mare px-5 py-3 text-sm font-bold text-texto-em-mare">
          Senha alterada.
        </p>
      )}

      <nav aria-label="Seções da conta" className="sem-barra flex gap-2 overflow-x-auto text-sm">
        {[
          ["#pedidos", "Pedidos"],
          ["#dados", "Meus dados"],
          ["#enderecos", "Endereços"],
          ["/favoritos", "Favoritos"],
          ["#privacidade", "Privacidade"],
        ].map(([href, rotulo]) => (
          <a key={href} href={href} className="rounded-full bg-superficie px-4 py-1.5 whitespace-nowrap">
            {rotulo}
          </a>
        ))}
      </nav>

      <Bloco titulo="Pedidos" id="pedidos">
        {pedidos.length === 0 ? (
          <p className="text-sm text-texto-suave">
            Você ainda não fez pedidos.{" "}
            <Link href="/colecao" className="text-link underline underline-offset-4">
              Ver a coleção
            </Link>
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {pedidos.map((p) => {
              const etapa = ETAPAS.indexOf(p.status);
              return (
                <li key={p.id} className="grid content-start gap-3 rounded-xl bg-fundo px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>Pedido nº {p.numero}</strong>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${corStatus[p.status]}`}>{ROTULO_STATUS[p.status]}</span>
                  </div>
                  {p.status !== "cancelado" && (
                    <ol aria-label="Andamento" className="grid grid-cols-5 gap-1">
                      {ETAPAS.map((e, i) => (
                        <li key={e} title={ROTULO_STATUS[e]} className={`h-1.5 rounded-full ${i <= etapa ? "bg-botao" : "bg-linha"}`}>
                          <span className="sr-only">
                            {ROTULO_STATUS[e]}: {i <= etapa ? "concluído" : "pendente"}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                  <ul className="text-sm">
                    {p.itens.map((it, i) => (
                      <li key={i}>
                        {it.quantidade} × <NomeItem nome={it.nome} />
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap justify-between gap-2 text-sm text-texto-suave">
                    <span>
                      {formatarData(new Date(p.criadoEm))} · {p.pagamento}
                    </span>
                    <strong className="text-texto tabular-nums">{formatarReais(p.totalCentavos)}</strong>
                  </div>
                  {p.codigoRastreio && (
                    <p className="text-sm">
                      Código de rastreio: <strong className="select-all">{p.codigoRastreio}</strong>
                      {p.urlRastreio && (
                        <>
                          {" · "}
                          <a href={p.urlRastreio} target="_blank" rel="noreferrer" className="text-link underline underline-offset-4">
                            Rastrear{p.transportadora ? ` na ${p.transportadora}` : ""}
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Bloco>

      <div className="grid items-start gap-5 md:grid-cols-2">
        <Bloco titulo="Meus dados" id="dados">
          <DadosPessoais perfil={perfil} demo={demo} />
        </Bloco>
        <Bloco titulo="Endereços" id="enderecos">
          <Enderecos enderecos={enderecos} demo={demo} />
        </Bloco>
      </div>

      <Bloco titulo="Privacidade" id="privacidade">
        <p className="text-sm">
          Você pode pedir a exclusão dos seus dados pessoais.{" "}
          <Link href="/privacidade" className="text-link underline underline-offset-4">
            Ler a política de privacidade
          </Link>
        </p>
        <PedidoExclusao solicitadoEm={perfil.exclusaoSolicitadaEm} demo={demo} />
      </Bloco>

      <div className="justify-self-start">
        <BotaoSair demo={demo} />
      </div>
    </div>
  );
}
