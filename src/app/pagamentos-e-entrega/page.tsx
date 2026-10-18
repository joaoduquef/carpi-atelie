import type { Metadata } from "next";
import Link from "next/link";
import { CartaoTexto, PaginaTexto } from "@/components/ui/PaginaTexto";

export const metadata: Metadata = {
  title: "Pagamentos e entrega",
  description: "Formas de pagamento, parcelamento, desconto no Pix, prazos e frete grátis para o Sudeste.",
};

export default function PagamentosEEntrega() {
  return (
    <PaginaTexto titulo="Pagamentos e entrega" provisorio>
      <CartaoTexto titulo="Formas de pagamento" tom="rosa">
        <ul>
          <li>
            <strong>Pix, com 5% de desconto</strong> nos produtos. O QR Code e o código copia e cola aparecem na própria página, e a confirmação é
            automática.
          </li>
          <li>
            <strong>Cartão de crédito:</strong> 1x sem juros, ou de 2x a 12x com os juros da operadora. Antes de confirmar, você vê o valor de cada
            parcela e o total.
          </li>
          <li>Cupons de desconto podem ser usados no campo “Tenho um cupom”, na finalização da compra.</li>
        </ul>
      </CartaoTexto>
      <CartaoTexto titulo="Prazos" tom="mare">
        <p>
          Cada peça é feita sob encomenda. O prazo de entrega é a soma de <strong>2 dias úteis de produção</strong> com o prazo da transportadora, que
          aparece quando você digita o CEP na página do produto ou na sacola.
        </p>
      </CartaoTexto>
      <CartaoTexto titulo="Frete" tom="damasco">
        <ul>
          <li>
            <strong>Frete grátis para todo o Sudeste</strong> (SP, RJ, MG e ES).
          </li>
          <li>Para as outras regiões, o frete é calculado pelo CEP. Enviamos preferencialmente pela Jadlog.</li>
        </ul>
      </CartaoTexto>
      <CartaoTexto titulo="Rastreio" tom="amarelo">
        <p>
          Assim que o pedido for enviado, você recebe um e-mail com o código de rastreio. O código também fica em{" "}
          <Link href="/minha-conta">Minha conta</Link>, com um link para acompanhar no site da transportadora.
        </p>
      </CartaoTexto>
    </PaginaTexto>
  );
}
