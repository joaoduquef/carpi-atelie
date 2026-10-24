import "server-only";
import { MAX_POR_ITEM } from "@/lib/limites-sacola";
import { carregarCatalogoAtual } from "@/lib/catalogo-servidor";
import { buscarCor, buscarModelo, buscarVariacao } from "@/lib/catalogo";
import { calcularParcelas, PIX_DESCONTO, MAX_PARCELAS } from "@/lib/dinheiro";
import { validarCupom } from "./cupom";
import { cotarFrete, type OpcaoFrete } from "./frete";
import type { PacoteFrete } from "./melhor-envio";
import type { EntradaResumo, LinhaResumo, Resumo } from "./tipos";

export type Calculo = {
  resumo: Resumo;
  /** opção de frete escolhida, com o custo para a loja (não vai para a tela) */
  freteEscolhido: OpcaoFrete | null;
};

/**
 * Calcula o pedido do zero, com os preços e o estoque lidos agora do banco.
 * Nada do que vem do navegador é usado como preço: só os ids das peças, as quantidades,
 * o CEP, o código do cupom e as escolhas de frete e pagamento.
 */
export async function calcularPedido(entrada: EntradaResumo): Promise<Calculo> {
  const cat = await carregarCatalogoAtual();
  const problemas: string[] = [];
  const linhas: LinhaResumo[] = [];
  const pacotes: PacoteFrete[] = [];
  let producaoDias = 0;

  const quantidades = new Map<string, number>();
  for (const i of entrada.itens.slice(0, 20)) {
    const q = Math.floor(Number(i.quantidade));
    if (typeof i.variacaoId !== "string" || !Number.isFinite(q) || q < 1) continue;
    quantidades.set(i.variacaoId, Math.min(MAX_POR_ITEM, (quantidades.get(i.variacaoId) ?? 0) + q));
  }

  for (const [variacaoId, quantidade] of quantidades) {
    const variacao = buscarVariacao(cat, variacaoId);
    const modelo = variacao && buscarModelo(cat, variacao.modeloSlug);
    const cor = variacao && buscarCor(cat, variacao.cor);
    if (!variacao || !modelo || !cor || !variacao.ativo || modelo.status !== "ativo" || modelo.precoCentavos === null) {
      problemas.push("Uma das peças da sacola não está mais à venda. Remova-a para continuar.");
      continue;
    }
    const nome = `${modelo.nome} ${cor.nome}`;
    const disponivel = cat.disponivel[variacao.id] ?? 0;
    if (disponivel < quantidade) {
      problemas.push(disponivel === 0 ? `${nome} esgotou. Remova da sacola para continuar.` : `Temos só ${disponivel} de ${nome}. Diminua a quantidade para continuar.`);
    }
    linhas.push({ variacaoId, nome, quantidade, precoUnitarioCentavos: modelo.precoCentavos, subtotalCentavos: modelo.precoCentavos * quantidade });
    pacotes.push({ id: variacaoId, ...modelo.embalagem, valorCentavos: modelo.precoCentavos, quantidade });
    producaoDias = Math.max(producaoDias, modelo.prazoProducaoDias);
  }
  if (linhas.length === 0 && problemas.length === 0) problemas.push("Sua sacola está vazia.");

  const subtotal = linhas.reduce((s, l) => s + l.subtotalCentavos, 0);

  // cupom (sobre os produtos)
  let cupom: Resumo["cupom"] = null;
  let erroCupom: string | null = null;
  if (entrada.cupom?.trim()) {
    const r = await validarCupom(entrada.cupom, subtotal);
    if ("erro" in r) erroCupom = r.erro;
    else cupom = { codigo: r.codigo, descontoCentavos: Math.min(r.descontoCentavos, subtotal) };
  }
  const produtos = subtotal - (cupom?.descontoCentavos ?? 0);

  // frete
  let frete: Resumo["frete"] = null;
  let erroFrete: string | null = null;
  let freteEscolhido: OpcaoFrete | null = null;
  if (entrada.cep && pacotes.length) {
    const r = await cotarFrete(entrada.cep, pacotes, subtotal);
    if ("erro" in r) erroFrete = r.erro;
    else {
      freteEscolhido = r.opcoes.find((o) => o.id === entrada.freteId) ?? r.opcoes[0];
      frete = {
        simulado: r.simulado,
        escolhidaId: freteEscolhido.id,
        opcoes: r.opcoes.map((o) => ({
          id: o.id,
          transportadora: o.transportadora,
          servico: o.servico,
          cobradoCentavos: o.cobradoCentavos,
          prazoMin: o.prazoMin + producaoDias,
          prazoMax: o.prazoMax + producaoDias,
        })),
      };
    }
  }
  const valorFrete = freteEscolhido?.cobradoCentavos ?? 0;

  // pagamento: Pix tem 5% de desconto nos produtos; cartão em até 12x com juros a partir de 2x
  const descontoPix = entrada.pagamento === "pix" ? Math.round(produtos * PIX_DESCONTO) : 0;
  const baseCartao = produtos + valorFrete;
  const tabela = calcularParcelas(baseCartao);
  const vezes = Math.min(MAX_PARCELAS, Math.max(1, Math.floor(Number(entrada.parcelas)) || 1));
  const juros = entrada.pagamento === "cartao" ? tabela[vezes - 1].total - baseCartao : 0;

  return {
    freteEscolhido,
    resumo: {
      linhas,
      subtotalCentavos: subtotal,
      cupom,
      erroCupom,
      frete,
      erroFrete,
      descontoPixCentavos: descontoPix,
      jurosCentavos: juros,
      parcelas: tabela.map((p) => ({ vezes: p.vezes, valorParcelaCentavos: p.valorParcela, totalCentavos: p.total, semJuros: p.semJuros })),
      totalCentavos: produtos - descontoPix + valorFrete + juros,
      problemas: [...new Set(problemas)],
    },
  };
}
