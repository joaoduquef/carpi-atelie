"use server";

import { dentroDoLimite, ipDaRequisicao } from "@/lib/limite";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { emailValido } from "@/lib/validacao";

export async function inscreverNewsletter(email: string, aceite: boolean): Promise<{ erro?: string; ok?: string }> {
  const limpo = email.trim().toLowerCase();
  if (!emailValido(limpo)) return { erro: "Digite um e-mail válido, como nome@exemplo.com." };
  if (!aceite) return { erro: "Marque a caixa para autorizar o envio de e-mails." };

  const sb = supabaseAdmin(); // a inscrição só é feita pelo servidor, depois de conferir o aceite
  if (sb) {
    if (!(await dentroDoLimite(`newsletter:ip:${await ipDaRequisicao()}`, 10, 60 * 60)))
      return { erro: "Muitas tentativas seguidas. Tente de novo mais tarde." };
    const { error } = await sb.rpc("inscrever_newsletter", { p_email: limpo, p_origem: "site" });
    if (error) return { erro: "Não foi possível fazer a inscrição agora. Tente de novo em instantes." };
  }
  return { ok: "Pronto! Você vai receber as novidades do ateliê." };
}
