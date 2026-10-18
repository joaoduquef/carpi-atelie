import type { Metadata } from "next";
import { LOJA } from "@/config/loja";
import { CartaoTexto, PaginaTexto } from "@/components/ui/PaginaTexto";

export const metadata: Metadata = { title: "Trocas e devoluções", description: "Direito de arrependimento, trocas e devoluções no CARPI Ateliê." };

export default function TrocasEDevolucoes() {
  return (
    <PaginaTexto titulo="Trocas e devoluções" provisorio>
      <CartaoTexto titulo="Direito de arrependimento (7 dias)" tom="rosa" largo>
        <p>
          Pelo Código de Defesa do Consumidor (art. 49), compras feitas pela internet podem ser canceladas em até <strong>7 dias corridos</strong> a
          partir do recebimento do produto, sem precisar explicar o motivo. Nesse caso, devolvemos o valor integral pago pelo produto.
        </p>
      </CartaoTexto>
      <CartaoTexto titulo="Como pedir" tom="mare">
        <ul>
          <li>
            Escreva para <span className="font-bold select-all">{LOJA.email}</span> com o número do pedido.
          </li>
          <li>Enviamos as instruções e o código de postagem para a devolução.</li>
          <li>Quando a peça chegar ao ateliê, fazemos o reembolso pelo mesmo meio de pagamento.</li>
        </ul>
      </CartaoTexto>
      <CartaoTexto titulo="Peça com defeito ou danificada no transporte" tom="damasco">
        <p>
          Se a sua peça chegar com algum problema, fale com a gente em até 7 dias, com fotos da embalagem e do abajur. Após avaliarmos a situação,
          trocamos a peça ou devolvemos o valor, como você preferir.
        </p>
      </CartaoTexto>
    </PaginaTexto>
  );
}
