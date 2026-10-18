import type { Metadata } from "next";
import Link from "next/link";
import { LOJA } from "@/config/loja";
import { PaginaTexto } from "@/components/ui/PaginaTexto";

export const metadata: Metadata = { title: "Política de privacidade", description: "Como o CARPI Ateliê trata os seus dados pessoais (LGPD)." };

export default function Privacidade() {
  return (
    <PaginaTexto titulo="Política de privacidade" provisorio>
      <p>
        Esta política explica quais dados pessoais o {LOJA.nome} ({LOJA.razaoSocial}, CNPJ {LOJA.cnpj}) coleta, por que coleta e quais são os seus
        direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>
      <h2>Dados que coletamos</h2>
      <ul>
        <li>Nome, e-mail, CPF e telefone, para criar a sua conta, emitir a nota fiscal e processar o pagamento.</li>
        <li>Endereços de entrega, para calcular o frete e enviar o pedido.</li>
        <li>Histórico de pedidos e favoritos, para você acompanhar as suas compras.</li>
        <li>E-mail da newsletter, só se você marcar a autorização.</li>
      </ul>
      <h2>Dados que não guardamos</h2>
      <p>Não guardamos os dados do seu cartão. Eles vão direto para o intermediador de pagamento, que é certificado para isso.</p>
      <h2>Com quem compartilhamos</h2>
      <ul>
        <li>Intermediador de pagamento (para processar a cobrança).</li>
        <li>Transportadora (nome, endereço e telefone, para a entrega).</li>
        <li>Serviços de hospedagem e banco de dados que mantêm o site funcionando.</li>
      </ul>
      <h2>Seus direitos</h2>
      <p>
        Você pode ver, corrigir e pedir a exclusão dos seus dados a qualquer momento em <Link href="/minha-conta">Minha conta</Link> ou pelo e-mail{" "}
        <span className="select-all">{LOJA.email}</span>. Dados de pedidos podem ser mantidos pelo prazo exigido pela legislação fiscal.
      </p>
      <h2>Cookies e armazenamento no navegador</h2>
      <p>Usamos o armazenamento do navegador só para lembrar a sua sacola, os seus favoritos e a escolha de luzes acesas ou apagadas.</p>
    </PaginaTexto>
  );
}
