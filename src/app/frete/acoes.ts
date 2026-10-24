"use server";

import { carregarCatalogo } from "@/lib/catalogo-servidor";
import { buscarModelo, buscarVariacao } from "@/lib/catalogo";
import { cotarFrete } from "@/lib/checkout/frete";
import type { PacoteFrete } from "@/lib/checkout/melhor-envio";
import type { OpcaoFreteResumo } from "@/lib/checkout/tipos";
import { dentroDoLimite, ipDaRequisicao } from "@/lib/limite";
import { MAX_POR_ITEM } from "@/lib/limites-sacola";
import type { ItemSacola } from "@/lib/tipos";

/** "Calcular frete" da página do produto e da sacola: mesmo cálculo da finalização, feito aqui no servidor. */
export async function simularFrete(cep: string, itens: ItemSacola[]): Promise<{ opcoes: OpcaoFreteResumo[]; simulado: boolean } | { erro: string }> {
  const ip = await ipDaRequisicao();
  if (!(await dentroDoLimite(`frete:ip:${ip}`, 40, 10 * 60))) return { erro: "Muitas consultas seguidas. Espere alguns minutos." };

  const cat = await carregarCatalogo();
  const pacotes: PacoteFrete[] = [];
  let subtotal = 0;
  let producao = 0;
  for (const i of itens.slice(0, 20)) {
    const variacao = buscarVariacao(cat, i.variacaoId);
    const modelo = variacao && buscarModelo(cat, variacao.modeloSlug);
    if (!variacao || !modelo || modelo.precoCentavos === null) continue;
    const quantidade = Math.min(MAX_POR_ITEM, Math.max(1, Math.floor(Number(i.quantidade)) || 1));
    pacotes.push({ id: variacao.id, ...modelo.embalagem, valorCentavos: modelo.precoCentavos, quantidade });
    subtotal += modelo.precoCentavos * quantidade;
    producao = Math.max(producao, modelo.prazoProducaoDias);
  }
  if (!pacotes.length) return { erro: "Escolha uma peça para calcular o frete." };

  const r = await cotarFrete(cep, pacotes, subtotal);
  if ("erro" in r) return r;
  return {
    simulado: r.simulado,
    opcoes: r.opcoes.map((o) => ({
      id: o.id,
      transportadora: o.transportadora,
      servico: o.servico,
      cobradoCentavos: o.cobradoCentavos,
      prazoMin: o.prazoMin + producao,
      prazoMax: o.prazoMax + producao,
    })),
  };
}
