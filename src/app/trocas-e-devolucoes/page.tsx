import type { Metadata } from "next";
import { LOJA } from "@/config/loja";
import { PaginaTexto } from "@/components/ui/PaginaTexto";

export const metadata: Metadata = { title: "Trocas e devoluções", description: "Direito de arrependimento, trocas e devoluções no CARPI Ateliê." };

export default function TrocasEDevolucoes() {
  return (
    <PaginaTexto titulo="Trocas e devoluções" provisorio>
      <h2>Direito de arrependimento (7 dias)</h2>
      <p>
        Pelo Código de Defesa do Consumidor (art. 49), compras feitas pela internet podem ser canceladas em até <strong>7 dias corridos</strong> a partir do
        recebimento do produto, sem precisar explicar o motivo. Nesse caso, devolvemos o valor integral pago, incluindo o frete.
      </p>
      <h2>Como pedir</h2>
      <ul>
        <li>
          Escreva para <span className="select-all">{LOJA.email}</span> com o número do pedido.
        </li>
        <li>Enviamos as instruções e o código de postagem para a devolução.</li>
        <li>Quando a peça chegar ao ateliê, fazemos o reembolso pelo mesmo meio de pagamento.</li>
      </ul>
      <h2>Peça com defeito ou danificada no transporte</h2>
      <p>
        Se a sua peça chegar com algum problema, fale com a gente em até 7 dias, com fotos da embalagem e do abajur. Trocamos a peça ou devolvemos o valor,
        como você preferir.
      </p>
    </PaginaTexto>
  );
}
