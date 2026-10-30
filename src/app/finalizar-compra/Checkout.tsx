"use client";

import Link from "@/components/ui/Link";
import { LOJA } from "@/config/loja";
import { useEffect, useRef, useState } from "react";
import { useCatalogo } from "@/components/loja/CatalogoProvider";
import { useLoja } from "@/components/loja/LojaProvider";
import { montarLinhas } from "@/components/loja/itensSacola";
import { MiniaturaAbajur } from "@/components/loja/MiniaturaAbajur";
import { NomeProduto } from "@/components/produto/NomeProduto";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { Campo, classeEntrada } from "@/components/ui/Campo";
import { IconeVoltar } from "@/components/ui/Icones";
import { TituloSecao } from "@/components/ui/TituloSecao";
import type { EnderecoConta } from "@/lib/conta";
import type { DadosCliente, EnderecoEntrega, FormaPagamento, Resumo } from "@/lib/checkout/tipos";
import { formatarReais } from "@/lib/dinheiro";
import { cepValido, formatarCep, limparCep } from "@/lib/frete";
import { formatarCpf, formatarTelefone, UFS } from "@/lib/validacao";
import { calcularResumo, criarPedido } from "./acoes";

function Etapa({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`etapa-${numero}`} className="grid gap-4 rounded-card bg-superficie px-5 py-5">
      <h2 id={`etapa-${numero}`} className="flex items-center gap-2.5 text-base font-bold tracking-[0.08em] text-titulo uppercase">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-botao text-sm tracking-normal text-botao-texto">{numero}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

const ENDERECO_VAZIO: EnderecoEntrega = { destinatario: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };

function resumoDoEndereco(e: EnderecoConta) {
  return `${e.rua}, ${e.numero}${e.complemento ? ` · ${e.complemento}` : ""} · ${e.bairro} · ${e.cidade}/${e.uf} · ${formatarCep(e.cep)}`;
}

export function Checkout({ cliente: inicial, enderecos, teste }: { cliente: DadosCliente; enderecos: EnderecoConta[]; teste: boolean }) {
  const { sacola, carregado } = useLoja();
  const cat = useCatalogo();
  const linhasVisuais = montarLinhas(cat, sacola);

  const [cliente, setCliente] = useState<DadosCliente>({
    nome: inicial.nome,
    cpf: formatarCpf(inicial.cpf),
    telefone: formatarTelefone(inicial.telefone),
  });
  const [enderecoId, setEnderecoId] = useState<string>(enderecos[0]?.id ?? "novo");
  const [novo, setNovo] = useState<EnderecoEntrega>(ENDERECO_VAZIO);
  const [salvarEndereco, setSalvarEndereco] = useState(true);
  const [freteId, setFreteId] = useState<string | undefined>();
  const [pagamento, setPagamento] = useState<FormaPagamento>("pix");
  // as parcelas são escolhidas na tela de pagamento, junto com o cartão
  const parcelas = 1;
  const [codigoCupom, setCodigoCupom] = useState("");
  const [cupom, setCupom] = useState("");
  const [cupomAberto, setCupomAberto] = useState(false);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const salvo = enderecos.find((e) => e.id === enderecoId);
  const endereco: EnderecoEntrega = salvo
    ? { destinatario: salvo.destinatario, cep: salvo.cep, rua: salvo.rua, numero: salvo.numero, complemento: salvo.complemento ?? "", bairro: salvo.bairro, cidade: salvo.cidade, uf: salvo.uf }
    : novo;
  const cep = limparCep(endereco.cep);

  // O resumo (frete, cupom, descontos e total) vem sempre do servidor.
  const pedidoAtual = useRef(0);
  const itensChave = JSON.stringify(sacola);
  useEffect(() => {
    if (!carregado || sacola.length === 0) return;
    const minha = ++pedidoAtual.current;
    setCalculando(true);
    const t = window.setTimeout(async () => {
      const r = await calcularResumo({ itens: sacola, cep: cepValido(cep) ? cep : "", freteId, cupom, pagamento, parcelas });
      if (minha !== pedidoAtual.current) return;
      setCalculando(false);
      if ("erro" in r) {
        setErro(r.erro);
        return;
      }
      setErro("");
      setResumo(r);
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- itensChave representa a sacola
  }, [carregado, itensChave, cep, freteId, cupom, pagamento, parcelas]);

  // Preenche rua, bairro, cidade e UF pelo CEP (ViaCEP, serviço público e gratuito)
  const cepNovo = limparCep(novo.cep);
  useEffect(() => {
    if (enderecoId !== "novo" || cepNovo.length !== 8) return;
    let cancelado = false;
    fetch(`https://viacep.com.br/ws/${cepNovo}/json/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean } | null) => {
        if (cancelado || !d || d.erro) return;
        setNovo((n) => ({ ...n, rua: d.logradouro || n.rua, bairro: d.bairro || n.bairro, cidade: d.localidade || n.cidade, uf: d.uf || n.uf }));
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [cepNovo, enderecoId]);

  async function finalizar() {
    setEnviando(true);
    setErro("");
    const r = await criarPedido({
      itens: sacola,
      cep,
      freteId: resumo?.frete?.escolhidaId ?? undefined,
      cupom,
      pagamento,
      parcelas,
      cliente,
      endereco,
      salvarEndereco: enderecoId === "novo" && salvarEndereco,
    });
    if ("erro" in r) {
      setErro(r.erro);
      setEnviando(false);
      return;
    }
    // a sacola só é esvaziada quando o pagamento for aprovado
    window.location.assign(`/pedido/${r.id}/pagamento`);
  }

  if (carregado && sacola.length === 0) {
    return (
      <div className="grid justify-items-center gap-4 rounded-bloco bg-superficie px-6 py-12 text-center">
        <p className="text-lg">Sua sacola está vazia.</p>
        <BotaoLink href="/colecao">Ver a coleção</BotaoLink>
      </div>
    );
  }

  const freteEscolhido = resumo?.frete?.opcoes.find((o) => o.id === resumo.frete?.escolhidaId) ?? null;
  const camposNovos = (campo: keyof EnderecoEntrega) => ({
    value: novo[campo],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNovo((n) => ({ ...n, [campo]: campo === "cep" ? formatarCep(e.target.value) : e.target.value })),
  });
  const podeFinalizar = Boolean(resumo && freteEscolhido && resumo.problemas.length === 0 && !resumo.erroCupom && !calculando && !enviando);

  return (
    <div className="grid gap-6">
      <Link href="/sacola" className="inline-flex items-center gap-1 justify-self-start text-sm text-destaque">
        <IconeVoltar width={16} height={16} /> Voltar à sacola
      </Link>
      <TituloSecao como="h1">Finalizar compra</TituloSecao>
      {teste && (
        <p className="rounded-card bg-bloco-amarelo px-4 py-3 text-sm text-texto-em-bloco">
          Modo de teste (só administradores): as vendas ainda estão fechadas. O pedido é registrado de verdade; o pagamento usa o ambiente de testes do PagBank enquanto o token for o do sandbox.
        </p>
      )}

      <div className="grid items-start gap-4 md:grid-cols-[1.35fr_1fr]">
        <div className="grid min-w-0 gap-3">
          <Etapa numero={1} titulo="Seus dados">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo rotulo="Nome completo" autoComplete="name" className="sm:col-span-2" value={cliente.nome} onChange={(e) => setCliente((c) => ({ ...c, nome: e.target.value }))} />
              <Campo rotulo="CPF" inputMode="numeric" dica="Necessário para a nota fiscal." value={cliente.cpf} onChange={(e) => setCliente((c) => ({ ...c, cpf: formatarCpf(e.target.value) }))} />
              <Campo rotulo="Celular" type="tel" autoComplete="tel" value={cliente.telefone} onChange={(e) => setCliente((c) => ({ ...c, telefone: formatarTelefone(e.target.value) }))} />
            </div>
          </Etapa>

          <Etapa numero={2} titulo="Endereço de entrega">
            {enderecos.length > 0 && (
              <div role="radiogroup" aria-label="Endereço" className="grid gap-2">
                {enderecos.map((e) => (
                  <label key={e.id} className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-[0.95rem] ${enderecoId === e.id ? "border-destaque" : "border-linha"}`}>
                    <input type="radio" name="endereco" checked={enderecoId === e.id} onChange={() => { setEnderecoId(e.id); setFreteId(undefined); }} className="mt-1 accent-[var(--botao)]" />
                    <span className="grid">
                      <strong>{e.apelido}</strong>
                      <span className="text-sm text-texto-suave">{resumoDoEndereco(e)}</span>
                    </span>
                  </label>
                ))}
                <label className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-[0.95rem] ${enderecoId === "novo" ? "border-destaque" : "border-linha"}`}>
                  <input type="radio" name="endereco" checked={enderecoId === "novo"} onChange={() => { setEnderecoId("novo"); setFreteId(undefined); }} className="accent-[var(--botao)]" />
                  <strong>Outro endereço</strong>
                </label>
              </div>
            )}
            {enderecoId === "novo" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo rotulo="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" {...camposNovos("cep")} />
                <Campo rotulo="Número" {...camposNovos("numero")} />
                <Campo rotulo="Rua" autoComplete="address-line1" className="sm:col-span-2" {...camposNovos("rua")} />
                <Campo rotulo="Complemento (opcional)" autoComplete="address-line2" {...camposNovos("complemento")} />
                <Campo rotulo="Bairro" {...camposNovos("bairro")} />
                <Campo rotulo="Cidade" autoComplete="address-level2" {...camposNovos("cidade")} />
                <div className="grid gap-1">
                  <label htmlFor="uf" className="text-sm font-bold">
                    Estado (UF)
                  </label>
                  <select id="uf" value={novo.uf} onChange={(e) => setNovo((n) => ({ ...n, uf: e.target.value }))} className={classeEntrada}>
                    <option value="">Escolha</option>
                    {UFS.map((uf) => (
                      <option key={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
                <Campo rotulo="Quem recebe (opcional)" className="sm:col-span-2" placeholder={cliente.nome} {...camposNovos("destinatario")} />
                <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
                  <input type="checkbox" checked={salvarEndereco} onChange={(e) => setSalvarEndereco(e.target.checked)} className="h-[18px] w-[18px] accent-[var(--botao)]" />
                  Salvar este endereço na minha conta
                </label>
              </div>
            )}
          </Etapa>

          <Etapa numero={3} titulo="Entrega">
            {resumo?.frete ? (
              <div role="radiogroup" aria-label="Opções de entrega" className="grid gap-2">
                {resumo.frete.opcoes.map((o) => (
                  <label key={o.id} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-[0.95rem] ${o.id === resumo.frete?.escolhidaId ? "border-destaque" : "border-linha"}`}>
                    <input type="radio" name="frete" checked={o.id === resumo.frete?.escolhidaId} onChange={() => setFreteId(o.id)} className="accent-[var(--botao)]" />
                    <span className="grid">
                      <span>
                        <strong>{o.transportadora}</strong>
                        {o.servico !== "simulada" && ` ${o.servico}`}
                      </span>
                      <span className="text-sm text-texto-suave">
                        chega em {o.prazoMin} a {o.prazoMax} dias úteis
                      </span>
                    </span>
                    <span className="ml-auto font-bold whitespace-nowrap text-destaque">{o.cobradoCentavos === 0 ? "Grátis" : formatarReais(o.cobradoCentavos)}</span>
                  </label>
                ))}
                <p className="text-xs text-texto-suave">
                  Prazo = {LOJA.prazoProducaoDias} dias úteis de produção + transporte.
                  {resumo.frete.simulado && " Valores de exemplo: o frete real entra quando o Melhor Envio for ligado."}
                </p>
              </div>
            ) : (
              <p className={`text-sm ${resumo?.erroFrete ? "font-bold text-erro" : "text-texto-suave"}`}>
                {resumo?.erroFrete ?? (cepValido(cep) ? "Calculando o frete…" : "Preencha o CEP para ver as opções de entrega.")}
              </p>
            )}
          </Etapa>

          <Etapa numero={4} titulo="Pagamento">
            <div role="group" aria-label="Forma de pagamento" className="inline-flex justify-self-start rounded-full bg-fundo p-1 text-sm">
              {(
                [
                  ["pix", "Pix · 5% off"],
                  ["cartao", "Cartão de crédito"],
                ] as const
              ).map(([valor, rotulo]) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={pagamento === valor}
                  onClick={() => setPagamento(valor)}
                  className={`rounded-full px-4 py-2 ${pagamento === valor ? "bg-botao font-bold text-botao-texto" : ""}`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            {pagamento === "pix" ? (
              <p className="text-sm">Pague com 5% de desconto nos produtos. O QR Code e o código copia e cola aparecem depois de confirmar o pedido.</p>
            ) : (
              <p className="text-sm">
                Em até 12x, com juros a partir de 2x. Você escolhe as parcelas e digita os dados do cartão na próxima etapa.
              </p>
            )}
          </Etapa>
        </div>

        <aside aria-label="Resumo do pedido" className="grid gap-4 rounded-card bg-superficie px-5 py-5 md:sticky md:top-32">
          <h2 className="text-base font-bold tracking-[0.08em] text-titulo uppercase">Resumo</h2>
          <ul className="grid gap-3">
            {linhasVisuais.map((l) => (
              <li key={l.variacao.id} className="flex items-center gap-3">
                <MiniaturaAbajur linha={l} tamanho="w-14" />
                <div className="grid">
                  <NomeProduto modelo={l.modelo.nome} cor={l.cor.nome} className="text-[0.95rem]" />
                  <span className="text-sm text-texto-suave tabular-nums">
                    {l.quantidade} × {formatarReais(l.precoUnitario)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <details open={cupomAberto} onToggle={(e) => setCupomAberto(e.currentTarget.open)}>
            <summary className="cursor-pointer text-sm text-link underline underline-offset-4">Tenho um cupom</summary>
            <form
              className="mt-2.5 flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setCupom(codigoCupom.trim().toUpperCase());
              }}
            >
              <label htmlFor="cupom" className="sr-only">
                Código do cupom
              </label>
              <input
                id="cupom"
                value={codigoCupom}
                onChange={(e) => setCodigoCupom(e.target.value)}
                placeholder="Código do cupom"
                className="min-w-0 flex-[1_1_140px] rounded-full border border-linha bg-fundo px-4 py-2.5 uppercase"
              />
              <Botao type="submit" variante="secundario">
                Aplicar
              </Botao>
            </form>
            {cupom && (
              <p role="status" className={`mt-1.5 text-xs font-bold ${resumo?.erroCupom ? "text-erro" : "text-sucesso"}`}>
                {resumo?.erroCupom ?? (resumo?.cupom ? (resumo.cupom.noFrete && !resumo.frete ? `Cupom ${resumo.cupom.codigo} aplicado: o desconto entra quando você calcular o frete.` : `Cupom ${resumo.cupom.codigo} aplicado.`) : "Conferindo o cupom…")}
                {resumo?.erroCupom && (
                  <button type="button" onClick={() => { setCupom(""); setCodigoCupom(""); }} className="ml-2 underline">
                    tirar
                  </button>
                )}
              </p>
            )}
          </details>

          {resumo && (
            <dl className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 border-t border-linha pt-3 text-[0.95rem] tabular-nums transition-opacity ${calculando ? "opacity-50" : ""}`}>
              <dt>Subtotal</dt>
              <dd className="text-right">{formatarReais(resumo.subtotalCentavos)}</dd>
              {!resumo.cupom?.noFrete && resumo.cupom && resumo.cupom.descontoCentavos > 0 && (
                <>
                  <dt>Cupom {resumo.cupom.codigo}</dt>
                  <dd className="text-right">− {formatarReais(resumo.cupom.descontoCentavos)}</dd>
                </>
              )}
              <dt>Frete</dt>
              <dd className="text-right">{freteEscolhido ? (freteEscolhido.cobradoCentavos === 0 ? "Grátis" : formatarReais(freteEscolhido.cobradoCentavos)) : "—"}</dd>
              {resumo.cupom?.noFrete && resumo.cupom.descontoCentavos > 0 && (
                <>
                  <dt>Cupom {resumo.cupom.codigo} (frete)</dt>
                  <dd className="text-right">− {formatarReais(resumo.cupom.descontoCentavos)}</dd>
                </>
              )}
              {resumo.descontoPixCentavos > 0 && (
                <>
                  <dt>Desconto Pix (5%)</dt>
                  <dd className="text-right">− {formatarReais(resumo.descontoPixCentavos)}</dd>
                </>
              )}
              {resumo.jurosCentavos > 0 && (
                <>
                  <dt>Juros do parcelamento</dt>
                  <dd className="text-right">{formatarReais(resumo.jurosCentavos)}</dd>
                </>
              )}
              <dt className="pt-1.5 text-lg font-bold text-destaque">Total</dt>
              <dd className="pt-1.5 text-right text-lg font-bold text-destaque">{formatarReais(resumo.totalCentavos)}</dd>
            </dl>
          )}

          {resumo?.problemas.map((p) => (
            <p key={p} role="alert" className="text-sm font-bold text-erro">
              {p}
            </p>
          ))}

          <Botao type="button" className="w-full" disabled={!podeFinalizar} onClick={finalizar}>
            {enviando ? "Registrando…" : "Ir para o pagamento"}
          </Botao>
          {!freteEscolhido && !resumo?.erroFrete && <p className="text-xs text-texto-suave">Preencha o endereço para continuar.</p>}
          {erro && (
            <p role="alert" className="text-sm font-bold text-erro">
              {erro}
            </p>
          )}
          <p className="text-xs text-texto-suave">Os dados do cartão vão direto para o intermediador de pagamento. A CARPI não guarda esses dados.</p>
        </aside>
      </div>
    </div>
  );
}
