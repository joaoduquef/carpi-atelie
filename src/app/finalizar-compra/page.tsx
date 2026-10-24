import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LOJA } from "@/config/loja";
import { BotaoLink } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";
import type { EnderecoConta } from "@/lib/conta";
import { supabaseServidor, usuarioAtual } from "@/lib/supabase/servidor";
import { Checkout } from "./Checkout";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

function VendasEmBreve() {
  return (
    <div className="grid justify-items-start gap-5">
      <TituloSecao como="h1">Vendas abrem em breve</TituloSecao>
      <p className="max-w-[56ch] text-lg leading-relaxed">
        Estamos finalizando os últimos detalhes da loja. Seus itens continuam guardados na sacola, e você pode deixar seu e-mail logo abaixo para
        saber quando abrirmos.
      </p>
      <BotaoLink href="/sacola" variante="secundario">
        Voltar para a sacola
      </BotaoLink>
    </div>
  );
}

export default async function FinalizarCompra() {
  const usuario = await usuarioAtual();
  // com as vendas fechadas, só os administradores entram (para testar)
  if (!LOJA.vendasAbertas && usuario?.papel !== "admin") return <VendasEmBreve />;
  if (!usuario) redirect("/entrar?proximo=/finalizar-compra");

  const sb = await supabaseServidor();
  const [perfil, enderecos] = sb
    ? await Promise.all([
        sb.from("perfis").select("nome, cpf, telefone").eq("id", usuario.id).maybeSingle(),
        sb.from("enderecos").select("*").eq("perfil_id", usuario.id).order("padrao", { ascending: false }).order("criado_em"),
      ])
    : [null, null];

  return (
    <Checkout
      cliente={{ nome: perfil?.data?.nome ?? usuario.nome, cpf: perfil?.data?.cpf ?? "", telefone: perfil?.data?.telefone ?? "" }}
      enderecos={(enderecos?.data ?? []) as EnderecoConta[]}
      teste={!LOJA.vendasAbertas}
    />
  );
}
