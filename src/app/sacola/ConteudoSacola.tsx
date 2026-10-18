"use client";

import Link from "next/link";
import { useCatalogo } from "@/components/loja/CatalogoProvider";
import { useLoja, MAX_POR_ITEM } from "@/components/loja/LojaProvider";
import { montarLinhas } from "@/components/loja/itensSacola";
import { MiniaturaAbajur } from "@/components/loja/MiniaturaAbajur";
import { CalculoFrete } from "@/components/produto/CalculoFrete";
import { NomeProduto, textoNomeProduto } from "@/components/produto/NomeProduto";
import { BotaoLink } from "@/components/ui/Botao";
import { Quantidade } from "@/components/ui/Quantidade";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { urlProduto } from "@/lib/catalogo";
import { formatarReais, precoPix } from "@/lib/dinheiro";
import { LOJA } from "@/config/loja";
import { AvisoVendasEmBreve } from "@/components/loja/AvisoVendasEmBreve";

export function ConteudoSacola() {
  const { sacola, carregado, alterarQuantidade, remover } = useLoja();
  const cat = useCatalogo();
  const linhas = montarLinhas(cat, sacola);
  const subtotal = linhas.reduce((s, l) => s + l.subtotal, 0);
  const producao = Math.max(0, ...linhas.map((l) => l.modelo.prazoProducaoDias));

  return (
    <div className="grid gap-6">
      <TituloSecao como="h1">Sua sacola</TituloSecao>

      {carregado && linhas.length === 0 ? (
        <div className="grid justify-items-center gap-4 rounded-bloco bg-superficie px-6 py-12 text-center">
          <p className="text-lg">Sua sacola está vazia.</p>
          <BotaoLink href="/colecao">Ver a coleção</BotaoLink>
        </div>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-[1.5fr_1fr]">
          <ul className="grid rounded-card bg-superficie px-5" aria-label="Itens da sacola">
            {linhas.map((l) => (
              <li key={l.variacao.id} className="grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-2 border-b border-linha py-4 last:border-b-0 sm:grid-cols-[76px_1fr_auto]">
                <Link href={urlProduto(l.modelo.slug, l.variacao.cor)} aria-label={`Ver ${textoNomeProduto(l.modelo.nome, l.cor.nome)}`}>
                  <MiniaturaAbajur linha={l} tamanho="w-16 sm:w-[76px]" />
                </Link>
                <div className="grid min-w-0 justify-items-start gap-2">
                  <NomeProduto modelo={l.modelo.nome} cor={l.cor.nome} />
                  <Quantidade
                    valor={l.quantidade}
                    max={MAX_POR_ITEM}
                    aoMudar={(n) => alterarQuantidade(l.variacao.id, n)}
                    rotulo={`Quantidade de ${l.modelo.nome}`}
                  />
                  <button type="button" onClick={() => remover(l.variacao.id)} className="text-sm text-link underline underline-offset-4">
                    Remover
                  </button>
                </div>
                <span className="col-start-2 font-bold text-destaque tabular-nums sm:col-start-auto">{formatarReais(l.subtotal)}</span>
              </li>
            ))}
          </ul>

          <aside aria-label="Resumo da sacola" className="grid gap-4 rounded-card bg-superficie px-5 py-5">
            <h2 className="text-base font-bold tracking-[0.08em] text-titulo uppercase">Resumo</h2>
            <CalculoFrete producaoDias={producao || 2} id="cep-sacola" />
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 border-t border-linha pt-3 text-[0.95rem] tabular-nums">
              <dt>Subtotal</dt>
              <dd className="text-right">{formatarReais(subtotal)}</dd>
              <dt>Frete</dt>
              <dd className="text-right text-texto-suave">calculado no CEP</dd>
              <dt className="pt-1.5 text-lg font-bold text-destaque">Total</dt>
              <dd className="pt-1.5 text-right text-lg font-bold text-destaque">{formatarReais(subtotal)}</dd>
            </dl>
            <p className="text-sm text-texto-suave">
              ou <strong className="text-texto">{formatarReais(precoPix(subtotal))} no Pix</strong> (5% de desconto)
            </p>
            {LOJA.vendasAbertas ? (
              <BotaoLink href="/finalizar-compra" className="w-full">
                Finalizar compra
              </BotaoLink>
            ) : (
              <AvisoVendasEmBreve />
            )}
            <Link href="/colecao" className="justify-self-center text-sm text-link underline underline-offset-4">
              Continuar comprando
            </Link>
            {LOJA.vendasAbertas && (
              <p className="text-sm text-texto-suave">Para finalizar, você entra na sua conta. Os itens da sacola continuam guardados.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
