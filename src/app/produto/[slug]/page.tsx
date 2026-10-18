import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOJA } from "@/config/loja";
import {
  buscarModelo,
  coresDoModelo,
  ehCorValida,
  imagemDa,
  imagensDoModelo,
  listarEmBreve,
  listarProdutos,
  nomeCor,
  urlProduto,
} from "@/lib/catalogo";
import { carregarCatalogo } from "@/lib/catalogo-servidor";
import { formatarReais, precoPix, calcularParcelas } from "@/lib/dinheiro";
import { CardEmBreve } from "@/components/produto/CardEmBreve";
import { CardProduto } from "@/components/produto/CardProduto";
import { Carrossel, ItemCarrossel } from "@/components/produto/Carrossel";
import { GaleriaProduto } from "@/components/produto/GaleriaProduto";
import { NomeProduto, textoNomeProduto } from "@/components/produto/NomeProduto";
import { PainelCompra } from "@/components/produto/PainelCompra";
import { BotaoFavorito } from "@/components/produto/BotaoFavorito";
import { Acordeao } from "@/components/ui/Acordeao";
import { IconeVoltar } from "@/components/ui/Icones";
import { TituloSecao } from "@/components/ui/TituloSecao";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ cor?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { cor } = await searchParams;
  const cat = await carregarCatalogo();
  const modelo = buscarModelo(cat, slug);
  if (!modelo) return {};
  const c = ehCorValida(cat, cor) ? cor : (coresDoModelo(cat, slug)[0]?.slug ?? "");
  const img = imagemDa(cat, slug, c, "apagado");
  return {
    title: textoNomeProduto(modelo.nome, nomeCor(cat, c)),
    description: modelo.descricao,
    alternates: { canonical: `/produto/${slug}` },
    openGraph: { images: img ? [{ url: img.url, alt: img.alt }] : undefined },
  };
}

export default async function PaginaProduto({ params, searchParams }: Props) {
  const { slug } = await params;
  const { cor: corParam } = await searchParams;
  const cat = await carregarCatalogo();
  const modelo = buscarModelo(cat, slug);
  if (!modelo || modelo.status !== "ativo" || modelo.precoCentavos === null) notFound();

  const coresDisponiveis = coresDoModelo(cat, slug);
  const corObj = coresDisponiveis.find((c) => c.slug === corParam) ?? coresDisponiveis[0];
  if (!corObj) notFound();
  const cor = corObj.slug;
  const variacao = cat.variacoes.find((v) => v.modeloSlug === slug && v.cor === cor);
  const apagado = imagemDa(cat, slug, cor, "apagado");
  const aceso = imagemDa(cat, slug, cor, "aceso");
  if (!variacao || !apagado || !aceso) notFound();

  const extras = imagensDoModelo(cat, slug).filter((i) => i.tipo === "ambiente" || i.tipo === "desenho_tecnico");
  const desenho = extras.find((i) => i.tipo === "desenho_tecnico");
  const preco = modelo.precoCentavos;
  const maiorParcela = calcularParcelas(preco).at(-1)!;
  const nome = textoNomeProduto(modelo.nome, corObj.nome);
  const disponivel = (cat.disponivel[variacao.id] ?? 0) > 0;

  const sugestoes = listarProdutos(cat).filter((p) => p.variacao.id !== variacao.id);
  const emBreve = listarEmBreve(cat);

  const dadosEstruturados = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: nome,
    description: modelo.descricao,
    sku: variacao.sku,
    color: corObj.nome,
    brand: { "@type": "Brand", name: LOJA.nome },
    image: [`${LOJA.url}${apagado.url}`, `${LOJA.url}${aceso.url}`],
    offers: {
      "@type": "Offer",
      url: `${LOJA.url}${urlProduto(slug, cor)}`,
      priceCurrency: "BRL",
      price: (preco / 100).toFixed(2),
      availability: disponivel ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="grid gap-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }} />

      <div className="grid gap-4">
        <Link href="/colecao" className="inline-flex items-center gap-1 justify-self-start text-sm text-destaque">
          <IconeVoltar width={16} height={16} /> Coleção
        </Link>

        <div className="grid items-start gap-4 md:grid-cols-[1.1fr_1fr]">
          <GaleriaProduto key={cor} cor={corObj} apagado={apagado} aceso={aceso} extras={extras} />

          <div className="grid gap-5 rounded-bloco border border-linha bg-superficie px-5 py-6 sm:px-7">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-[2rem] leading-tight font-normal text-titulo">
                <NomeProduto modelo={modelo.nome} cor={corObj.nome} />
              </h1>
              <BotaoFavorito variacaoId={variacao.id} nome={nome} />
            </div>
            <div className="grid gap-1">
              <p className="text-[1.6rem] font-bold text-destaque tabular-nums">{formatarReais(preco)}</p>
              <p className="text-sm text-texto-suave">
                <strong className="text-texto">{formatarReais(precoPix(preco))} no Pix</strong> (5% de desconto)
              </p>
              <p className="text-sm text-texto-suave">
                ou 1x sem juros no cartão, ou até {maiorParcela.vezes}x com juros da operadora
              </p>
            </div>

            <p className="max-w-[60ch] text-[0.95rem]">{modelo.descricao}</p>

            <div className="grid gap-2">
              <span className="text-xs font-bold tracking-[0.08em] text-texto-suave uppercase" id="rotulo-cor">
                Cor
              </span>
              <div role="group" aria-labelledby="rotulo-cor" className="flex flex-wrap gap-2">
                {coresDisponiveis.map((c) => {
                  const ativa = c.slug === cor;
                  return (
                    <Link
                      key={c.slug}
                      href={urlProduto(slug, c.slug)}
                      replace
                      scroll={false}
                      aria-current={ativa ? "true" : undefined}
                      className={`inline-flex items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-sm ${
                        ativa ? "border-2 border-destaque font-bold" : "border border-linha"
                      }`}
                    >
                      <span aria-hidden className="h-[22px] w-[22px] rounded-full" style={{ background: c.hex }} />
                      {c.nome.toLocaleLowerCase("pt-BR")}
                    </Link>
                  );
                })}
              </div>
            </div>

            <PainelCompra variacaoId={variacao.id} disponivel={disponivel} producaoDias={modelo.prazoProducaoDias} />
          </div>
        </div>
      </div>

      <div className="grid gap-2.5">
        <Acordeao titulo="Medidas e desenho técnico" tom="rosa" aberto>
          <div className="grid items-center gap-4 md:grid-cols-[1fr_1.3fr]">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-2 text-[0.95rem]">
              {modelo.especificacoes.map((e) => (
                <div key={e.rotulo} className="contents">
                  <dt className="font-bold">{e.rotulo}</dt>
                  <dd>{e.valor}</dd>
                </div>
              ))}
            </dl>
            {desenho && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={desenho.url} alt={desenho.alt} className="w-full rounded-xl bg-white p-2" loading="lazy" />
            )}
          </div>
        </Acordeao>
        <Acordeao titulo="Como funciona" tom="mare">
          <ol className="grid gap-2 sm:grid-cols-3">
            {[
              ["Você escolhe", "O modelo e a cor que combinam com a sua casa."],
              ["Nós produzimos", `Sua peça fica pronta em ${modelo.prazoProducaoDias} dias úteis, feita sob encomenda.`],
              ["Chega na sua casa", "Enviamos com código de rastreio, que aparece em Minha conta."],
            ].map(([t, d], i) => (
              <li key={t} className="grid gap-1 rounded-xl bg-fundo/70 p-4 text-texto">
                <span className="text-2xl font-bold">{i + 1}</span>
                <strong>{t}</strong>
                <span>{d}</span>
              </li>
            ))}
          </ol>
        </Acordeao>
        <Acordeao titulo="Cuidados com a peça" tom="damasco">
          {/* TEXTO PROVISÓRIO */}
          <p>Limpe com pano macio e seco. Evite álcool e produtos abrasivos. Troque a lâmpada só com o abajur desligado da tomada.</p>
        </Acordeao>
        <Acordeao titulo="Pagamentos e entrega" tom="amarelo">
          <p>
            Pix com 5% de desconto ou cartão de crédito em até 12x. Frete grátis para todo o Sudeste. Prazo de entrega = {modelo.prazoProducaoDias} dias úteis
            de produção + prazo da transportadora. Você acompanha o pedido pelo código de rastreio em Minha conta.
          </p>
          <Link href="/pagamentos-e-entrega" className="justify-self-start font-bold underline underline-offset-4">
            Ver todos os detalhes
          </Link>
        </Acordeao>
      </div>

      <section aria-labelledby="titulo-sugestoes" className="grid gap-5">
        <TituloSecao id="titulo-sugestoes">Você também pode gostar</TituloSecao>
        <Carrossel rotulo="Outras peças">
          {sugestoes.map((p) => (
            <ItemCarrossel key={p.variacao.id}>
              <CardProduto produto={p} />
            </ItemCarrossel>
          ))}
          {emBreve.map((m) => (
            <ItemCarrossel key={m.slug}>
              <CardEmBreve modelo={m} />
            </ItemCarrossel>
          ))}
        </Carrossel>
      </section>
    </div>
  );
}
