import type { Metadata } from "next";
import { LOJA } from "@/config/loja";
import { BotaoLink } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { Checkout } from "./Checkout";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default function FinalizarCompra() {
  if (!LOJA.vendasAbertas) {
    return (
      <div className="grid justify-items-start gap-5">
        <TituloSecao como="h1">Vendas abrem em breve</TituloSecao>
        <p className="max-w-[56ch] text-lg leading-relaxed">
          Estamos finalizando os últimos detalhes da loja. Seus itens continuam guardados na sacola, e você pode deixar seu e-mail logo abaixo
          para saber quando abrirmos.
        </p>
        <BotaoLink href="/sacola" variante="secundario">
          Voltar para a sacola
        </BotaoLink>
      </div>
    );
  }
  return <Checkout />;
}
