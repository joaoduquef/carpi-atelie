import type { Metadata } from "next";
import Image from "next/image";
import { foto } from "@/lib/fotos";
import { TituloSecao } from "@/components/ui/TituloSecao";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça João Duque e Nalu Chagas, fundadores do CARPI Ateliê, que cria luminárias e objetos para a casa.",
};

export default function Sobre() {
  return (
    <article className="grid gap-20 sm:gap-24">
      <section aria-labelledby="titulo-quem" className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
        {/* Foto de João e Nalu: substitua o arquivo public/sobre/joao-e-nalu.jpg (retrato, fundo branco) */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-bloco bg-superficie">
          <Image
            src={foto("/sobre/joao-e-nalu.jpg")}
            alt="João Duque e Nalu Chagas, fundadores da CARPI"
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover"
            priority
          />
        </div>
        <div className="grid content-center justify-items-start gap-5">
          <TituloSecao como="h1" id="titulo-quem">
            Por trás da CARPI
          </TituloSecao>
          <p className="max-w-[58ch] text-lg leading-relaxed">
            Prazer, somos João e Nalu. Ele estuda Engenharia Aeroespacial e ela estuda Medicina. A CARPI é o nosso jeito de explorar nossa criatividade
            conjunta.
          </p>
          <p className="max-w-[58ch] text-lg leading-relaxed">
            O que começou como uma ideia entre nós virou um estúdio de design, onde tiramos projetos do papel e transformamos nossas referências em
            objetos para a casa.
          </p>
        </div>
      </section>

      <section aria-labelledby="titulo-atelie" className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-bloco bg-superficie md:order-2">
          <Image
            src={foto("/products/babi/ambiente-1.jpg")}
            alt="Abajur Babi rosa sobre uma escrivaninha de madeira"
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
          />
        </div>
        <div className="grid content-center justify-items-start gap-5 md:order-1">
          <TituloSecao id="titulo-atelie">Feito na CARPI</TituloSecao>
          <p className="max-w-[56ch] text-lg leading-relaxed">
            Desenvolvemos cada peça do início ao fim, do desenho ao objeto final. Gostamos de formas marcantes, cores interessantes e objetos que fazem
            a diferença no ambiente sem precisar de muito.
          </p>
          <p className="max-w-[56ch] text-lg leading-relaxed text-texto-suave">
            Produzimos sob encomenda, com prazo de preparo de 5 dias úteis e envio com rastreamento.
          </p>
        </div>
      </section>
    </article>
  );
}
