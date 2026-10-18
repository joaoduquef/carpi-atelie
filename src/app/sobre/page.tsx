import type { Metadata } from "next";
import Image from "next/image";
import { PaginaTexto } from "@/components/ui/PaginaTexto";

export const metadata: Metadata = { title: "Sobre nós", description: "Conheça o CARPI Ateliê, de abajures de design autoral feitos sob encomenda." };

export default function Sobre() {
  return (
    <PaginaTexto titulo="Sobre nós" provisorio>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-bloco">
        <Image src="/products/babi/ambiente-1.jpg" alt="Abajur Babi aceso sobre um aparador" fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover" />
      </div>
      <p>
        A CARPI é um ateliê brasileiro de abajures de design autoral. Desenhamos cada modelo e produzimos as peças sob encomenda, em PETG translúcido,
        em três cores: Maré, Damasco e Romã.
      </p>
      <p>
        Durante o dia, o abajur é uma peça de cor na sua casa. À noite, a luz atravessa o material e deixa o ambiente quente e acolhedor. Aqui no site,
        você pode ver essa diferença no botão “Apagar as luzes”.
      </p>
      <p>Cada pedido fica pronto em 2 dias úteis e segue para a sua casa com código de rastreio.</p>
    </PaginaTexto>
  );
}
