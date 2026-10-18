import type { Metadata } from "next";
import { LOJA, urlInstagram } from "@/config/loja";
import { PaginaTexto } from "@/components/ui/PaginaTexto";

export const metadata: Metadata = { title: "Contato", description: "Fale com o CARPI Ateliê por e-mail ou Instagram." };

export default function Contato() {
  return (
    <PaginaTexto titulo="Contato">
      <p>Ficou com alguma dúvida sobre as peças, o seu pedido ou a entrega? Fale com a gente:</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1 rounded-card bg-bloco-rosa px-5 py-4 text-texto-em-bloco">
          <strong>E-mail</strong>
          <span className="select-all break-all">{LOJA.email}</span>
        </div>
        <div className="grid gap-1 rounded-card bg-bloco-mare px-5 py-4 text-texto-em-mare">
          <strong>Instagram</strong>
          <a href={urlInstagram} target="_blank" rel="noreferrer" className="!text-texto-em-mare">
            @{LOJA.instagram}
          </a>
        </div>
      </div>
      <p className="text-sm text-texto-suave">
        {LOJA.nome} · {LOJA.razaoSocial} · CNPJ {LOJA.cnpj}
      </p>
    </PaginaTexto>
  );
}
