"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoja } from "@/components/loja/LojaProvider";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { Campo, classeEntrada } from "@/components/ui/Campo";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { formatarReais } from "@/lib/dinheiro";
import type { PlanoParcela } from "@/lib/pagamento/pagbank";
import { formatarCpf, soDigitos } from "@/lib/validacao";
import { chaveCartao, gerarPix, pagarCartao, parcelasCartao, simularPagamento, situacaoPagamento, trocarForma } from "./acoes";

// SDK oficial do PagBank: criptografa o cartão aqui no navegador
const SDK_PAGBANK = "https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js";

declare global {
  interface Window {
    PagSeguro?: {
      encryptCard: (d: { publicKey: string; holder: string; number: string; expMonth: string; expYear: string; securityCode: string }) => {
        encryptedCard?: string;
        hasErrors: boolean;
        errors: { code: string; message: string }[];
      };
    };
  }
}

type PedidoTela = {
  id: string;
  numero: number;
  status: string;
  forma: "pix" | "cartao";
  subtotal: number;
  descontoCupom: number;
  descontoPix: number;
  frete: number;
  cupomFrete: string | null;
  total: number;
  itens: { nome: string; quantidade: number }[];
  titularNome: string;
  titularCpf: string;
};

type Pix = { copiaECola: string; imagemQr: string | null; expiraEm: string };

function Linha({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <>
      <dt className={destaque ? "pt-1.5 text-lg font-bold text-destaque" : ""}>{rotulo}</dt>
      <dd className={`text-right ${destaque ? "pt-1.5 text-lg font-bold text-destaque" : ""}`}>{valor}</dd>
    </>
  );
}

function tempoRestante(expiraEm: string, agora: number) {
  const s = Math.max(0, Math.floor((new Date(expiraEm).getTime() - agora) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function Pagamento({ pedido, pagbankLigado, podeSimular, sandbox }: { pedido: PedidoTela; pagbankLigado: boolean; podeSimular: boolean; sandbox: boolean }) {
  const { esvaziar } = useLoja();
  const [status, setStatus] = useState(pedido.status);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  // Pix
  const [pix, setPix] = useState<Pix | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());

  // cartão
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState(pedido.titularNome.toUpperCase());
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [cpf, setCpf] = useState(formatarCpf(pedido.titularCpf));
  const [planos, setPlanos] = useState<PlanoParcela[]>([]);
  const [vezes, setVezes] = useState(1);
  const bin = soDigitos(numero).slice(0, 6);

  const pago = status === "pago" || status === "em_producao" || status === "enviado" || status === "entregue";

  // sacola esvaziada só quando o pagamento é aprovado
  const esvaziou = useRef(false);
  useEffect(() => {
    if (pago && !esvaziou.current) {
      esvaziou.current = true;
      esvaziar();
    }
  }, [pago, esvaziar]);

  // pergunta ao servidor, a cada 5 s, se o pagamento já caiu
  const conferir = useCallback(async () => {
    const r = await situacaoPagamento(pedido.id);
    if (!("erro" in r)) setStatus(r.status);
  }, [pedido.id]);
  useEffect(() => {
    if (pago || status === "cancelado" || (pedido.forma === "pix" && !pix)) return;
    const t = window.setInterval(() => {
      setAgora(Date.now());
      void conferir();
    }, 5000);
    return () => window.clearInterval(t);
  }, [pago, status, pix, pedido.forma, conferir]);
  useEffect(() => {
    if (!pix) return;
    const t = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [pix]);

  // parcelas reais para o cartão digitado
  useEffect(() => {
    if (pedido.forma !== "cartao") return;
    let cancelado = false;
    parcelasCartao(pedido.id, bin.length === 6 ? bin : "").then((r) => {
      if (cancelado || "erro" in r) return;
      setPlanos(r.parcelas);
      setVezes((v) => (r.parcelas.some((p) => p.vezes === v) ? v : 1));
    });
    return () => {
      cancelado = true;
    };
  }, [bin, pedido.forma, pedido.id]);

  async function mudarForma(forma: "pix" | "cartao") {
    if (forma === pedido.forma) return;
    setOcupado(true);
    const r = await trocarForma(pedido.id, forma);
    if ("erro" in r) {
      setErro(r.erro);
      setOcupado(false);
      return;
    }
    window.location.reload(); // novo total vem do servidor
  }

  async function gerar() {
    setOcupado(true);
    setErro("");
    const r = await gerarPix(pedido.id);
    setOcupado(false);
    if ("erro" in r) setErro(r.erro);
    else setPix(r);
  }

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    const [mes, ano] = validade.split("/");
    if (soDigitos(numero).length < 13 || !mes || !ano || soDigitos(cvv).length < 3) {
      setErro("Confira o número, a validade e o código de segurança do cartão.");
      return;
    }
    if (!window.PagSeguro) {
      setErro("Ainda carregando a proteção do cartão. Espere um segundo e tente de novo.");
      return;
    }
    setOcupado(true);
    const chave = await chaveCartao();
    if ("erro" in chave) {
      setErro(chave.erro);
      setOcupado(false);
      return;
    }
    const cifrado = window.PagSeguro.encryptCard({
      publicKey: chave.chave,
      holder: nome,
      number: soDigitos(numero),
      expMonth: mes.padStart(2, "0"),
      expYear: ano.length === 2 ? `20${ano}` : ano,
      securityCode: soDigitos(cvv),
    });
    if (cifrado.hasErrors || !cifrado.encryptedCard) {
      setErro("Confira os dados do cartão: número, validade ou código de segurança inválidos.");
      setOcupado(false);
      return;
    }
    const r = await pagarCartao(pedido.id, { criptografado: cifrado.encryptedCard, bin, titularNome: nome, titularCpf: cpf, parcelas: vezes });
    setOcupado(false);
    setCvv("");
    if ("erro" in r) setErro(r.erro);
    else if (r.pago) setStatus("pago");
    else setAviso(r.mensagem);
  }

  async function simular() {
    setOcupado(true);
    const r = await simularPagamento(pedido.id);
    setOcupado(false);
    if ("erro" in r) setErro(r.erro);
    else setStatus("pago");
  }

  async function copiar() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.copiaECola);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  if (pago) {
    return (
      <div className="grid justify-items-center gap-4 rounded-bloco bg-superficie px-6 py-12 text-center">
        <TituloSecao como="h1" centralizado>
          Pagamento aprovado!
        </TituloSecao>
        <p className="max-w-[48ch] text-lg">
          Obrigado! Seu pedido #{pedido.numero} já está com a gente e entra em produção. Você acompanha tudo em Minha conta, e avisamos por e-mail quando for enviado.
        </p>
        <BotaoLink href={`/minha-conta?pedido=${pedido.numero}#pedidos`}>Ver meu pedido</BotaoLink>
      </div>
    );
  }

  if (status === "cancelado") {
    return (
      <div className="grid justify-items-center gap-4 rounded-bloco bg-superficie px-6 py-12 text-center">
        <TituloSecao como="h1" centralizado>
          Pedido cancelado
        </TituloSecao>
        <p className="max-w-[48ch]">O prazo para pagar o pedido #{pedido.numero} terminou. Os itens continuam na sua sacola: é só finalizar de novo.</p>
        <BotaoLink href="/sacola">Voltar para a sacola</BotaoLink>
      </div>
    );
  }

  const planoEscolhido = planos.find((p) => p.vezes === vezes);
  const totalTela = pedido.forma === "cartao" && planoEscolhido ? planoEscolhido.totalCentavos : pedido.total;

  return (
    <div className="grid gap-6">
      {pedido.forma === "cartao" && <Script src={SDK_PAGBANK} strategy="afterInteractive" />}
      <TituloSecao como="h1">Pagamento do pedido #{pedido.numero}</TituloSecao>
      {pagbankLigado && sandbox && (
        <p className="rounded-card bg-bloco-amarelo px-4 py-3 text-sm text-texto-em-bloco">
          Ambiente de testes do PagBank (sandbox): use os cartões e o Pix de teste. Nenhum dinheiro de verdade é cobrado.
        </p>
      )}

      <div className="grid items-start gap-4 md:grid-cols-[1.35fr_1fr]">
        <section aria-label="Forma de pagamento" className="grid min-w-0 gap-4 rounded-card bg-superficie px-5 py-5">
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
                disabled={ocupado || Boolean(pix)}
                aria-pressed={pedido.forma === valor}
                onClick={() => mudarForma(valor)}
                className={`rounded-full px-4 py-2 disabled:opacity-60 ${pedido.forma === valor ? "bg-botao font-bold text-botao-texto" : ""}`}
              >
                {rotulo}
              </button>
            ))}
          </div>

          {pedido.forma === "pix" ? (
            pix ? (
              <div className="grid justify-items-center gap-3 text-center">
                {pix.imagemQr && (
                  // eslint-disable-next-line @next/next/no-img-element -- imagem gerada pelo PagBank
                  <img src={pix.imagemQr} alt="QR Code do Pix" width={220} height={220} className="rounded-xl bg-white p-2" />
                )}
                <p className="text-sm">Abra o app do seu banco, escolha Pix e leia o QR Code ou cole o código abaixo.</p>
                <p className="w-full rounded-xl border border-dashed border-linha bg-fundo px-3 py-2 text-xs break-all text-texto-suave select-all">{pix.copiaECola}</p>
                <Botao type="button" variante="secundario" onClick={copiar}>
                  {copiado ? "Código copiado" : "Copiar código Pix"}
                </Botao>
                <p role="status" className="text-sm font-bold text-destaque">
                  Aguardando o pagamento… a confirmação aparece aqui sozinha. O código vale por {tempoRestante(pix.expiraEm, agora)}.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                <p className="text-sm">Pague com 5% de desconto nos produtos. A confirmação é automática.</p>
                <Botao type="button" onClick={gerar} disabled={ocupado || !pagbankLigado}>
                  {ocupado ? "Gerando…" : `Gerar Pix de ${formatarReais(pedido.total)}`}
                </Botao>
              </div>
            )
          ) : (
            <form onSubmit={pagar} className="grid gap-3 sm:grid-cols-2" noValidate>
              <Campo rotulo="Número do cartão" inputMode="numeric" autoComplete="cc-number" className="sm:col-span-2" value={numero} onChange={(e) => setNumero(soDigitos(e.target.value).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 "))} />
              <Campo rotulo="Nome impresso no cartão" autoComplete="cc-name" className="sm:col-span-2" value={nome} onChange={(e) => setNome(e.target.value.toUpperCase())} />
              <Campo
                rotulo="Validade (MM/AA)"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                value={validade}
                onChange={(e) => {
                  const d = soDigitos(e.target.value).slice(0, 4);
                  setValidade(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                }}
              />
              <Campo rotulo="Código de segurança (CVV)" inputMode="numeric" autoComplete="cc-csc" value={cvv} onChange={(e) => setCvv(soDigitos(e.target.value).slice(0, 4))} />
              <Campo rotulo="CPF do titular do cartão" inputMode="numeric" className="sm:col-span-2" value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} />
              <div className="grid gap-1 sm:col-span-2">
                <label htmlFor="parcelas" className="text-sm font-bold">
                  Parcelas
                </label>
                <select id="parcelas" value={vezes} onChange={(e) => setVezes(Number(e.target.value))} className={classeEntrada}>
                  {planos.map((p) => (
                    <option key={p.vezes} value={p.vezes}>
                      {p.semJuros ? `${p.vezes}x de ${formatarReais(p.valorParcelaCentavos)} sem juros` : `${p.vezes}x de ${formatarReais(p.valorParcelaCentavos)} (total ${formatarReais(p.totalCentavos)})`}
                    </option>
                  ))}
                </select>
                {bin.length < 6 && <span className="text-xs text-texto-suave">Digite o número do cartão para ver as parcelas exatas.</span>}
              </div>
              <Botao type="submit" className="sm:col-span-2" disabled={ocupado || !pagbankLigado}>
                {ocupado ? "Processando…" : `Pagar ${formatarReais(totalTela)}`}
              </Botao>
              <p className="text-xs text-texto-suave sm:col-span-2">
                Os dados do cartão são criptografados aqui no seu navegador e vão direto para o PagBank. A CARPI não recebe nem guarda esses dados.
              </p>
            </form>
          )}

          {!pagbankLigado && <p className="text-sm font-bold text-erro">O pagamento ainda não está ligado: falta configurar o token do PagBank na Vercel.</p>}
          {erro && (
            <p role="alert" className="text-sm font-bold text-erro">
              {erro}
            </p>
          )}
          {aviso && (
            <p role="status" className="text-sm font-bold text-destaque">
              {aviso}
            </p>
          )}
          {podeSimular && (
            <Botao type="button" variante="secundario" onClick={simular} disabled={ocupado}>
              Simular pagamento aprovado (teste, só administradores)
            </Botao>
          )}
        </section>

        <aside aria-label="Resumo do pedido" className="grid gap-3 rounded-card bg-superficie px-5 py-5">
          <h2 className="text-base font-bold tracking-[0.08em] text-titulo uppercase">Resumo</h2>
          <ul className="grid gap-1 text-[0.95rem]">
            {pedido.itens.map((i) => (
              <li key={i.nome}>
                {i.quantidade} × {i.nome}
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 border-t border-linha pt-3 text-[0.95rem] tabular-nums">
            <Linha rotulo="Subtotal" valor={formatarReais(pedido.subtotal)} />
            {pedido.descontoCupom > 0 && <Linha rotulo="Cupom" valor={`− ${formatarReais(pedido.descontoCupom)}`} />}
            <Linha rotulo={pedido.cupomFrete ? `Frete (com cupom ${pedido.cupomFrete})` : "Frete"} valor={pedido.frete === 0 ? "Grátis" : formatarReais(pedido.frete)} />
            {pedido.forma === "pix" && pedido.descontoPix > 0 && <Linha rotulo="Desconto Pix (5%)" valor={`− ${formatarReais(pedido.descontoPix)}`} />}
            {pedido.forma === "cartao" && planoEscolhido && !planoEscolhido.semJuros && (
              <Linha rotulo="Juros do parcelamento" valor={formatarReais(planoEscolhido.totalCentavos - (pedido.subtotal - pedido.descontoCupom + pedido.frete))} />
            )}
            <Linha rotulo="Total" valor={formatarReais(totalTela)} destaque />
          </dl>
        </aside>
      </div>
    </div>
  );
}
