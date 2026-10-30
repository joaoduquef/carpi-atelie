import type { Metadata } from "next";
import { LOJA } from "@/config/loja";
import Link from "@/components/ui/Link";
import { CartaoTexto, PaginaTexto } from "@/components/ui/PaginaTexto";

export const metadata: Metadata = {
  title: "Pagamentos e entrega",
  description: "Formas de pagamento, parcelamento, desconto no Pix, prazos e cupom de desconto no frete para todas as regiões.",
};

export default function PagamentosEEntrega() {
  return (
    <PaginaTexto titulo="Pagamentos e entrega">
      <CartaoTexto titulo="Formas de pagamento" tom="rosa">
        <ul>
          <li>Pix, com 5% de desconto nos produtos. O QR Code e o código copia e cola aparecem na própria página, e a confirmação é automática.</li>
          <li>Cartão de crédito: 1x sem juros, ou de 2x a 12x com os juros da operadora.</li>
          <li>Cupons de desconto podem ser usados no campo “Tenho um cupom”, na finalização da compra.</li>
        </ul>
      </CartaoTexto>
      <CartaoTexto titulo="Prazos" tom="mare">
        <p>Cada peça é feita sob encomenda. O prazo de entrega é a soma de {LOJA.prazoProducaoDias} dias úteis de produção com o prazo da transportadora.</p>
      </CartaoTexto>
      <CartaoTexto titulo="Frete" tom="damasco">
        <ul>
          <li>Cupom de frete para todas as regiões: informe o código FRETEQUINZE no campo “Tenho um cupom”, ao finalizar o pedido, e receba R$ 15,00 de desconto no frete.</li>
          <li>O frete é calculado pelo CEP. Enviamos preferencialmente pela plataforma Melhor Envio.</li>
        </ul>
      </CartaoTexto>
      <CartaoTexto titulo="Rastreio" tom="amarelo">
        <p>
          Assim que o pedido for enviado, você recebe um e-mail com o código de rastreio. O código também fica em{" "}
          <Link href="/minha-conta" className="!font-normal">
            Minha conta
          </Link>, com um link para acompanhar no site da transportadora.
        </p>
      </CartaoTexto>
    </PaginaTexto>
  );
}
