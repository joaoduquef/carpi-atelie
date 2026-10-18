import Image from "next/image";
import { listarEmBreve, listarProdutos } from "@/lib/catalogo";
import { DestaqueBabi } from "@/components/inicio/DestaqueBabi";
import { Logo } from "@/components/layout/Logo";
import { BotaoLuzes } from "@/components/luzes/BotaoLuzes";
import { CardEmBreve } from "@/components/produto/CardEmBreve";
import { CardProduto } from "@/components/produto/CardProduto";
import { Carrossel, ItemCarrossel } from "@/components/produto/Carrossel";
import { BotaoLink } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";

export default function Inicio() {
  const produtos = listarProdutos();
  const emBreve = listarEmBreve();

  return (
    <div className="grid gap-14">
      <section aria-label="Destaque" className="grid gap-3 md:grid-cols-[1.05fr_1fr]">
        <div className="grid content-center justify-items-center gap-6 rounded-bloco border border-linha bg-superficie px-6 py-12 text-center">
          <h1 className="grid justify-items-center gap-5">
            <Logo className="h-auto w-[min(78%,380px)] [&_img]:h-auto" />
            <span className="text-xl font-bold tracking-[0.02em] text-titulo sm:text-2xl">Abajures feitos com carinho.</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-2.5">
            <BotaoLink href="/colecao">Ver a coleção</BotaoLink>
            <BotaoLuzes />
          </div>
        </div>
        <DestaqueBabi produtos={produtos} />
      </section>

      <section aria-labelledby="titulo-colecao" className="grid gap-5">
        <TituloSecao id="titulo-colecao">A coleção</TituloSecao>
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

      <section aria-labelledby="titulo-sobre" className="grid gap-3 md:grid-cols-[1.1fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-bloco bg-bloco-rosa">
          <Image
            src="/products/babi/ambiente-1.jpg"
            alt="Abajur Babi aceso sobre um aparador"
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
          />
        </div>
        <div className="grid content-center gap-4 rounded-bloco bg-bloco-mare px-6 py-8 text-texto-em-mare sm:px-8">
          <TituloSecao id="titulo-sobre" className="!text-texto-em-mare">
            Sobre o ateliê
          </TituloSecao>
          {/* TEXTO PROVISÓRIO: escrever o texto definitivo do ateliê */}
          <p className="max-w-[60ch]">
            A CARPI é um ateliê de abajures de design autoral. Cada peça é produzida sob encomenda, em PETG translúcido,
            para levar cor durante o dia e uma luz quente e macia à noite.
          </p>
          <p className="max-w-[60ch] text-sm opacity-80">Texto provisório: os donos vão escrever a versão final.</p>
          <BotaoLink href="/sobre" variante="secundario" className="justify-self-start !border-texto-em-mare !text-texto-em-mare">
            Conheça o ateliê
          </BotaoLink>
        </div>
      </section>
    </div>
  );
}
