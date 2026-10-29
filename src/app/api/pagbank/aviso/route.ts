import { NextResponse, type NextRequest } from "next/server";
import { dentroDoLimite, ipDaRequisicao } from "@/lib/limite";
import { assinaturaValida, pagbankConfigurado } from "@/lib/pagamento/pagbank";
import { confirmarSePago } from "@/lib/pagamento/servico";
import { supabaseAdmin } from "@/lib/supabase/servidor";

/**
 * Aviso do PagBank (webhook): chega quando um pagamento muda de situação.
 * 1. Confere a assinatura (x-authenticity-token). Assinatura errada: recusa.
 * 2. Nunca confia no conteúdo do aviso: consulta o pedido de novo no PagBank, com o nosso token,
 *    e só então marca como pago. Assim, um aviso falso não consegue aprovar nada.
 */
export async function POST(request: NextRequest) {
  if (!pagbankConfigurado()) return NextResponse.json({ ok: false }, { status: 503 });

  const corpo = await request.text();
  const assinatura = request.headers.get("x-authenticity-token");
  if (assinatura !== null && !assinaturaValida(corpo, assinatura)) {
    console.error("[aviso] assinatura inválida");
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (assinatura === null) {
    // sem assinatura: ainda conferimos direto no PagBank, mas com limite para ninguém usar a rota para gastar a API
    if (!(await dentroDoLimite(`aviso:ip:${await ipDaRequisicao()}`, 30, 10 * 60))) return NextResponse.json({ ok: false }, { status: 429 });
    console.warn("[aviso] aviso sem x-authenticity-token: conferindo direto no PagBank");
  }

  let idExterno = "";
  try {
    idExterno = String((JSON.parse(corpo) as { id?: string }).id ?? "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!/^[A-Z0-9_-]{6,64}$/i.test(idExterno)) return NextResponse.json({ ok: false }, { status: 400 });

  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ ok: false }, { status: 503 });
  // só pedidos que nós mesmos criamos no PagBank
  const { data: pagamento } = await sb.from("pagamentos").select("pedido_id").eq("provedor", "pagbank").eq("id_externo", idExterno).maybeSingle();
  if (!pagamento) return NextResponse.json({ ok: true, ignorado: true });

  try {
    await confirmarSePago(pagamento.pedido_id, idExterno);
  } catch (e) {
    console.error("[aviso] falha ao conferir o pagamento", e);
    return NextResponse.json({ ok: false }, { status: 500 }); // o PagBank tenta de novo
  }
  return NextResponse.json({ ok: true });
}
