import type { Metadata } from "next";
import { LOJA, urlInstagram } from "@/config/loja";
import { IconeEmail, IconeInstagram } from "@/components/ui/Icones";
import { CartaoTexto, PaginaTexto } from "@/components/ui/PaginaTexto";

export const metadata: Metadata = { title: "Contato", description: "Fale com o CARPI Ateliê por e-mail ou Instagram." };

export default function Contato() {
  return (
    <PaginaTexto titulo="Contato">
      <CartaoTexto largo>
        <p className="text-lg">Ficou com alguma dúvida sobre as peças, o seu pedido ou a entrega? Fale com a gente por um destes canais.</p>
      </CartaoTexto>
      <CartaoTexto titulo="E-mail" tom="rosa" icone={<IconeEmail width={24} height={24} />}>
        <p className="text-xl font-bold break-all select-all sm:text-2xl">{LOJA.email}</p>
        <p className="text-sm">Para dúvidas sobre pedidos, informe o número do pedido.</p>
      </CartaoTexto>
      <CartaoTexto titulo="Instagram" tom="mare" icone={<IconeInstagram width={24} height={24} />}>
        <a href={urlInstagram} target="_blank" rel="noreferrer" className="justify-self-start text-xl !no-underline transition-colors hover:text-destaque sm:text-2xl">
          @{LOJA.instagram}
        </a>
        <p className="text-sm">Novidades, bastidores do ateliê e mensagens diretas.</p>
      </CartaoTexto>
      <CartaoTexto titulo="Dados da empresa" tom="damasco" largo>
        <dl className="grid gap-x-8 gap-y-1 sm:grid-cols-[max-content_1fr]">
          <dt className="font-bold">Nome</dt>
          <dd>{LOJA.nome}</dd>
          <dt className="font-bold">Razão social</dt>
          <dd>{LOJA.razaoSocial}</dd>
          <dt className="font-bold">CNPJ</dt>
          <dd>{LOJA.cnpj}</dd>
        </dl>
      </CartaoTexto>
    </PaginaTexto>
  );
}
