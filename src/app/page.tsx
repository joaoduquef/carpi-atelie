import Image from "next/image";
import Link from "next/link";
import { foto } from "@/lib/fotos";
import { listarEmBreve, listarProdutos } from "@/lib/catalogo";
import { carregarCatalogo } from "@/lib/catalogo-servidor";
import { DestaqueBabi } from "@/components/inicio/DestaqueBabi";
import { BotaoLuzes } from "@/components/luzes/BotaoLuzes";
import { CardEmBreve } from "@/components/produto/CardEmBreve";
import { CardProduto } from "@/components/produto/CardProduto";
import { Carrossel, ItemCarrossel } from "@/components/produto/Carrossel";
import { BotaoLink } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";

export default async function Inicio() {
  const cat = await carregarCatalogo();
  const produtos = listarProdutos(cat);
  const emBreve = listarEmBreve(cat);
  const destaque = produtos.filter((p) => p.modelo.slug === produtos[0]?.modelo.slug);

  return (
    <div className="grid gap-20 sm:gap-24">
      <section aria-label="Destaque" className="grid items-center gap-8 md:grid-cols-[1fr_1.05fr] md:gap-12">
        <div className="grid justify-items-start gap-6 md:py-8">
          <h1 className="text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.02] font-bold tracking-[-0.01em] text-destaque">
            Abajures feitos com carinho.
          </h1>
          <p className="max-w-[44ch] text-lg leading-relaxed text-texto-suave">Ateliê de abajures feitos por encomendas.</p>
          <div className="flex flex-wrap gap-2.5">
            <BotaoLink href="/colecao">Ver a coleção</BotaoLink>
            <BotaoLuzes />
          </div>
        </div>
        <DestaqueBabi produtos={destaque} corInicial="damasco" />
      </section>

      <section aria-labelledby="titulo-colecao" className="grid gap-6">
        <div className="flex items-baseline justify-between gap-4">
          <TituloSecao id="titulo-colecao">A coleção</TituloSecao>
          <Link href="/colecao" className="text-sm font-bold whitespace-nowrap text-destaque underline-offset-4 hover:underline">
            Ver tudo
          </Link>
        </div>
        <Carrossel rotulo="Peças da coleção">
          {produtos.map((p, i) => (
            <ItemCarrossel key={p.variacao.id}>
              <CardProduto produto={p} priority={i < 2} />
            </ItemCarrossel>
          ))}
          {emBreve.map((m) => (
            <ItemCarrossel key={m.slug}>
              <CardEmBreve modelo={m} />
            </ItemCarrossel>
          ))}
        </Carrossel>
      </section>

      <section aria-labelledby="titulo-sobre" className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-bloco bg-superficie">
          <Image
            src={foto("/products/babi/ambiente-1.jpg")}
            alt="Abajur Babi rosa sobre uma escrivaninha de madeira"
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
          />
        </div>
        <div className="grid content-center justify-items-start gap-5">
          <TituloSecao id="titulo-sobre">Sobre o ateliê</TituloSecao>
          {/* TEXTO PROVISÓRIO: escrever o texto definitivo do ateliê */}
          <p className="max-w-[56ch] text-lg leading-relaxed">
            A CARPI é um ateliê de abajures de design autoral. Cada peça é produzida sob encomenda, em PETG translúcido,
            para levar cor durante o dia e uma luz quente e macia à noite.
          </p>
          <p className="text-sm text-texto-suave">Texto provisório: os donos vão escrever a versão final.</p>
          <BotaoLink href="/sobre" variante="secundario">
            Conheça o ateliê
          </BotaoLink>
        </div>
      </section>
    </div>
  );
}
