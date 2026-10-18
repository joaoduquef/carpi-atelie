"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCatalogo } from "@/components/loja/CatalogoProvider";
import { useLoja } from "@/components/loja/LojaProvider";
import { montarLinhas } from "@/components/loja/itensSacola";
import { MiniaturaAbajur } from "@/components/loja/MiniaturaAbajur";
import { NomeProduto } from "@/components/produto/NomeProduto";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { Campo, classeEntrada } from "@/components/ui/Campo";
import { IconeVoltar } from "@/components/ui/Icones";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { validarCupomDemo } from "@/lib/cupons";
import { calcularParcelas, formatarReais, PIX_DESCONTO } from "@/lib/dinheiro";
import { cepValido, cotarFreteSimulado, formatarCep, prazoTotal } from "@/lib/frete";
import { QrDemo } from "./QrDemo";

type Pagamento = "pix" | "cartao";

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

export function Checkout() {
  const { sacola, carregado } = useLoja();
  const cat = useCatalogo();
  const linhas = montarLinhas(cat, sacola);
  const subtotal = linhas.reduce((s, l) => s + l.subtotal, 0);
  const producao = Math.max(2, ...linhas.map((l) => l.modelo.prazoProducaoDias));

  const [cep, setCep] = useState("");
  const [pagamento, setPagamento] = useState<Pagamento>("pix");
  const [parcelas, setParcelas] = useState(1);
  const [codigoCupom, setCodigoCupom] = useState("");
  const [cupom, setCupom] = useState<{ codigo: string; desconto: number } | null>(null);
  const [erroCupom, setErroCupom] = useState("");
  const [pixGerado, setPixGerado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [mensagemCartao, setMensagemCartao] = useState("");

  const frete = cepValido(cep) ? cotarFreteSimulado(cep) : null;
  const prazo = frete ? prazoTotal(frete, producao) : null;

  // Só para exibir. Na Fase 3 tudo isto é recalculado no servidor antes de cobrar.
  const descontoCupom = cupom ? Math.min(cupom.desconto, subtotal) : 0;
  const produtos = subtotal - descontoCupom;
  const descontoPix = pagamento === "pix" ? Math.round(produtos * PIX_DESCONTO) : 0;
  const valorFrete = frete?.valorCentavos ?? 0;
  const baseCartao = produtos + valorFrete;
  const opcoesParcelas = useMemo(() => calcularParcelas(baseCartao), [baseCartao]);
  const parcelaEscolhida = opcoesParcelas[parcelas - 1];
  const juros = pagamento === "cartao" && parcelaEscolhida ? parcelaEscolhida.total - baseCartao : 0;
  const total = produtos - descontoPix + valorFrete + juros;

  function aplicarCupom() {
    const r = validarCupomDemo(codigoCupom, subtotal);
    if ("erro" in r) {
      setCupom(null);
      setErroCupom(r.erro);
    } else {
      setCupom({ codigo: r.cupom.codigo, desconto: r.desconto });
      setErroCupom("");
    }
  }

  const copiaECola = "00020126580014br.gov.bcb.pix0136EXEMPLO-CARPI-NAO-PAGAR5204000053039865802BR6304ABCD";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(copiaECola);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  if (carregado && linhas.length === 0) {
    return (
      <div className="grid justify-items-center gap-4 rounded-bloco bg-superficie px-6 py-12 text-center">
        <p className="text-lg">Sua sacola está vazia.</p>
        <BotaoLink href="/colecao">Ver a coleção</BotaoLink>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Link href="/sacola" className="inline-flex items-center gap-1 justify-self-start text-sm text-destaque">
        <IconeVoltar width={16} height={16} /> Voltar à sacola
      </Link>
      <TituloSecao como="h1">Finalizar compra</TituloSecao>
      <p className="rounded-card bg-bloco-amarelo px-4 py-3 text-sm text-texto-em-bloco">
        Versão de demonstração: nenhum pagamento é feito. Na loja pronta, o cliente entra na conta antes desta etapa.
      </p>

      <div className="grid items-start gap-4 md:grid-cols-[1.35fr_1fr]">
        <div className="grid min-w-0 gap-3">
          <Etapa numero={1} titulo="Dados e endereço">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo rotulo="Nome completo" autoComplete="name" className="sm:col-span-2" />
              <Campo rotulo="CPF" inputMode="numeric" dica="Necessário para a nota fiscal." />
              <Campo rotulo="Celular" type="tel" autoComplete="tel" />
              <Campo
                rotulo="CEP"
                inputMode="numeric"
                autoComplete="postal-code"
                value={cep}
                onChange={(e) => setCep(formatarCep(e.target.value))}
                placeholder="00000-000"
              />
              <Campo rotulo="Número" />
              <Campo rotulo="Rua" autoComplete="address-line1" className="sm:col-span-2" />
              <Campo rotulo="Complemento" autoComplete="address-line2" />
              <Campo rotulo="Bairro" />
              <Campo rotulo="Cidade" autoComplete="address-level2" />
              <Campo rotulo="Estado (UF)" autoComplete="address-level1" maxLength={2} />
            </div>
          </Etapa>

          <Etapa numero={2} titulo="Entrega">
            {frete && prazo ? (
              <label className="flex items-center gap-3 rounded-xl border-2 border-destaque px-4 py-3 text-[0.95rem]">
                <input type="radio" name="frete" defaultChecked className="accent-[var(--botao)]" />
                <span>
                  <strong>{frete.transportadora}</strong> · chega em {prazo.min} a {prazo.max} dias úteis
                </span>
                <span className="ml-auto font-bold whitespace-nowrap text-destaque">
                  {frete.valorCentavos === 0 ? "Grátis" : formatarReais(frete.valorCentavos)}
                </span>
              </label>
            ) : (
              <p className="text-sm text-texto-suave">Preencha o CEP para ver as opções de entrega.</p>
            )}
          </Etapa>

          <Etapa numero={3} titulo="Pagamento">
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
                  onClick={() => {
                    setPagamento(valor);
                    setPixGerado(false);
                    setMensagemCartao("");
                  }}
                  className={`rounded-full px-4 py-2 ${pagamento === valor ? "bg-botao font-bold text-botao-texto" : ""}`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            {pagamento === "pix" ? (
              <p className="text-sm">Pague com 5% de desconto nos produtos. O QR Code e o código copia e cola aparecem aqui mesmo e valem por 30 minutos.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Na Fase 4 estes campos vêm do intermediador (tokenização): os dados do cartão não passam pelo nosso servidor. */}
                <Campo rotulo="Número do cartão" inputMode="numeric" autoComplete="cc-number" className="sm:col-span-2" />
                <Campo rotulo="Nome impresso no cartão" autoComplete="cc-name" className="sm:col-span-2" />
                <Campo rotulo="Validade (MM/AA)" autoComplete="cc-exp" />
                <Campo rotulo="CVV" inputMode="numeric" autoComplete="cc-csc" />
                <div className="grid gap-1 sm:col-span-2">
                  <label htmlFor="parcelas" className="text-sm font-bold">
                    Parcelas
                  </label>
                  <select id="parcelas" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className={classeEntrada}>
                    {opcoesParcelas.map((p) => (
                      <option key={p.vezes} value={p.vezes}>
                        {p.semJuros
                          ? `1x de ${formatarReais(p.valorParcela)} sem juros`
                          : `${p.vezes}x de ${formatarReais(p.valorParcela)} (total ${formatarReais(p.total)})`}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-texto-suave">Juros de exemplo. Os valores reais vêm do intermediador de pagamento.</span>
                </div>
              </div>
            )}
          </Etapa>
        </div>

        <aside aria-label="Resumo do pedido" className="grid gap-4 rounded-card bg-superficie px-5 py-5 md:sticky md:top-32">
          <h2 className="text-base font-bold tracking-[0.08em] text-titulo uppercase">Resumo</h2>
          <ul className="grid gap-3">
            {linhas.map((l) => (
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

          <details open={Boolean(cupom || erroCupom)}>
            <summary className="cursor-pointer text-sm text-link underline underline-offset-4">Tenho um cupom</summary>
            <div className="mt-2.5 flex flex-wrap gap-2">
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
              <Botao type="button" variante="secundario" onClick={aplicarCupom}>
                Aplicar
              </Botao>
            </div>
            <p role="status" className={`mt-1.5 text-xs font-bold ${erroCupom ? "text-erro" : "text-sucesso"}`}>
              {erroCupom || (cupom ? `Cupom ${cupom.codigo} aplicado.` : "Para testar, use CARPI10.")}
            </p>
          </details>

          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 border-t border-linha pt-3 text-[0.95rem] tabular-nums">
            <dt>Subtotal</dt>
            <dd className="text-right">{formatarReais(subtotal)}</dd>
            {descontoCupom > 0 && (
              <>
                <dt>Cupom {cupom?.codigo}</dt>
                <dd className="text-right">− {formatarReais(descontoCupom)}</dd>
              </>
            )}
            <dt>Frete</dt>
            <dd className="text-right">{frete ? (frete.valorCentavos === 0 ? "Grátis" : formatarReais(frete.valorCentavos)) : "—"}</dd>
            {descontoPix > 0 && (
              <>
                <dt>Desconto Pix (5%)</dt>
                <dd className="text-right">− {formatarReais(descontoPix)}</dd>
              </>
            )}
            {juros > 0 && (
              <>
                <dt>Juros do parcelamento</dt>
                <dd className="text-right">{formatarReais(juros)}</dd>
              </>
            )}
            <dt className="pt-1.5 text-lg font-bold text-destaque">Total</dt>
            <dd className="pt-1.5 text-right text-lg font-bold text-destaque">{formatarReais(total)}</dd>
          </dl>

          {pagamento === "pix" && pixGerado ? (
            <div className="grid justify-items-center gap-3 text-center">
              <QrDemo />
              <p className="w-full rounded-xl border border-dashed border-linha bg-fundo px-3 py-2 text-xs break-all text-texto-suave select-all">
                {copiaECola}
              </p>
              <Botao type="button" variante="secundario" onClick={copiar}>
                {copiado ? "Código copiado" : "Copiar código"}
              </Botao>
              <p role="status" className="text-sm font-bold text-destaque">
                Aguardando pagamento… a confirmação aparece aqui sozinha.
              </p>
            </div>
          ) : (
            <Botao
              type="button"
              className="w-full"
              disabled={!frete}
              onClick={() =>
                pagamento === "pix"
                  ? setPixGerado(true)
                  : setMensagemCartao("Demonstração: na Fase 4 o pagamento com cartão é enviado ao intermediador.")
              }
            >
              {pagamento === "pix" ? "Gerar Pix" : `Pagar ${formatarReais(total)}`}
            </Botao>
          )}
          {!frete && <p className="text-xs text-texto-suave">Preencha o CEP para continuar.</p>}
          {mensagemCartao && (
            <p role="status" className="text-sm font-bold text-destaque">
              {mensagemCartao}
            </p>
          )}
          <p className="text-xs text-texto-suave">Os dados do cartão vão direto para o intermediador de pagamento. A CARPI não guarda esses dados.</p>
        </aside>
      </div>
    </div>
  );
}
