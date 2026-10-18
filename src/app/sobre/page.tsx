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
          <TituloSecao como="h1">Sobre nós</TituloSecao>
          <p className="text-[clamp(1.6rem,3.4vw,2.4rem)] leading-tight font-bold text-destaque" id="titulo-quem">
            Somos João e Nalu, os fundadores da CARPI.
          </p>
          <p className="max-w-[58ch] text-lg leading-relaxed">
            João Duque estuda Engenharia Aeroespacial. Nalu Chagas, sócia e namorada, estuda Medicina. Mundos bem diferentes, mas com uma vontade em
            comum: criar algo nosso.
          </p>
          <p className="max-w-[58ch] text-lg leading-relaxed">
            A CARPI surgiu dessa vontade de empreender e do desejo de transformar ideias de objetos de decoração para a casa em artesanato de verdade:
            peças pensadas por nós e produzidas com cuidado, uma a uma, para a sua casa.
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
          <TituloSecao id="titulo-atelie">O ateliê</TituloSecao>
          <p className="max-w-[56ch] text-lg leading-relaxed">
            A CARPI cria luminárias e objetos para a casa. Peças que chamam atenção mesmo quando estão apagadas — e ganham outra vida quando acesas.
          </p>
          <p className="max-w-[56ch] text-lg leading-relaxed text-texto-suave">
            Cada pedido fica pronto em 2 dias úteis e segue para a sua casa com código de rastreio.
          </p>
        </div>
      </section>
    </article>
  );
}
