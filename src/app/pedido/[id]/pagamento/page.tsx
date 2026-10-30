import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { pagbankConfigurado } from "@/lib/pagamento/pagbank";
import { lerPedido, limparVencidos } from "@/lib/pagamento/servico";
import { usuarioAtual } from "@/lib/supabase/servidor";
import { Pagamento } from "./Pagamento";

export const metadata: Metadata = { title: "Pagamento", robots: { index: false } };

export default async function PaginaPagamento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) redirect(`/entrar?proximo=/pedido/${id}/pagamento`);

  await limparVencidos();
  const pedido = await lerPedido(id);
  if (!pedido || pedido.perfilId !== usuario.id) notFound();

  return (
    <Pagamento
      pedido={{
        id: pedido.id,
        numero: pedido.numero,
        status: pedido.status,
        forma: pedido.forma,
        subtotal: pedido.subtotal,
        descontoCupom: pedido.descontoCupom,
        descontoPix: pedido.descontoPix,
        frete: pedido.frete,
        // cupom de frete: o frete gravado já vem com o desconto
        cupomFrete: pedido.cupomCodigo && pedido.descontoCupom === 0 ? pedido.cupomCodigo : null,
        total: pedido.total,
        itens: pedido.itens.map((i) => ({ nome: i.nome, quantidade: i.quantidade })),
        titularNome: pedido.cliente.nome,
        titularCpf: pedido.cliente.cpf,
      }}
      pagbankLigado={pagbankConfigurado()}
      podeSimular={!pagbankConfigurado() && usuario.papel === "admin"}
      sandbox={process.env.PAGBANK_AMBIENTE?.trim() !== "producao"}
    />
  );
}
