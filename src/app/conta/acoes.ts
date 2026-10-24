"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LOJA } from "@/config/loja";
import { dentroDoLimite, ipDaRequisicao } from "@/lib/limite";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { caminhoSeguro, cpfValido, emailValido, soDigitos, UFS } from "@/lib/validacao";

export type Resultado = { erro?: string; ok?: string; campos?: Record<string, string> } | null;

const NAO_CONFIGURADO: Resultado = { erro: "Demonstração: o login passa a funcionar quando o Supabase for configurado." };
const MUITAS_TENTATIVAS: Resultado = { erro: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." };

function texto(form: FormData, campo: string): string {
  return String(form.get(campo) ?? "").trim();
}

async function origem(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : LOJA.url;
}

// ---------------------------------------------------------------- entrar
export async function entrar(_: Resultado, form: FormData): Promise<Resultado> {
  const sb = await supabaseServidor();
  if (!sb) return NAO_CONFIGURADO;
  const email = texto(form, "email").toLowerCase();
  const senha = String(form.get("senha") ?? "");
  if (!emailValido(email) || !senha) return { erro: "Preencha o e-mail e a senha.", campos: { email } };

  const ip = await ipDaRequisicao();
  if (!(await dentroDoLimite(`entrar:ip:${ip}`, 20, 15 * 60)) || !(await dentroDoLimite(`entrar:email:${email}`, 8, 15 * 60)))
    return MUITAS_TENTATIVAS;

  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) {
    if (error.code === "email_not_confirmed")
      return { erro: "Confirme o seu e-mail antes de entrar. Procure a mensagem da CARPI na sua caixa de entrada (e no spam).", campos: { email } };
    return { erro: "E-mail ou senha incorretos.", campos: { email } };
  }
  revalidatePath("/", "layout");
  redirect(caminhoSeguro(form.get("proximo")));
}

// ---------------------------------------------------------------- cadastro
export async function cadastrar(_: Resultado, form: FormData): Promise<Resultado> {
  const sb = await supabaseServidor();
  if (!sb) return NAO_CONFIGURADO;
  const campos = {
    nome: texto(form, "nome"),
    email: texto(form, "email").toLowerCase(),
    cpf: soDigitos(texto(form, "cpf")),
    telefone: soDigitos(texto(form, "telefone")),
  };
  const senha = String(form.get("senha") ?? "");
  const aceitaNewsletter = form.get("newsletter") === "on";

  if (campos.nome.length < 3) return { erro: "Digite o seu nome completo.", campos };
  if (!emailValido(campos.email)) return { erro: "Digite um e-mail válido, como nome@exemplo.com.", campos };
  if (!cpfValido(campos.cpf)) return { erro: "CPF inválido. Confira os números.", campos };
  if (campos.telefone && (campos.telefone.length < 10 || campos.telefone.length > 11))
    return { erro: "Celular inválido. Use DDD + número, como (11) 98765-4321.", campos };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres.", campos };

  const ip = await ipDaRequisicao();
  if (!(await dentroDoLimite(`cadastro:ip:${ip}`, 5, 60 * 60))) return MUITAS_TENTATIVAS;

  const proximo = caminhoSeguro(form.get("proximo"));
  const { data, error } = await sb.auth.signUp({
    email: campos.email,
    password: senha,
    options: {
      emailRedirectTo: `${await origem()}/auth/confirmar?tipo=cadastro&proximo=${encodeURIComponent(proximo)}`,
      data: { nome: campos.nome, cpf: campos.cpf, telefone: campos.telefone, aceita_newsletter: aceitaNewsletter },
    },
  });
  if (error) {
    // aparece nos Logs da Vercel, para descobrir a causa (não inclui senha nem chaves)
    console.error("[cadastro] Supabase recusou o cadastro", { code: error.code, status: error.status, message: error.message });
    switch (error.code) {
      case "weak_password":
        return { erro: "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.", campos };
      case "user_already_exists":
      case "email_exists":
        return { erro: "Já existe uma conta com esse e-mail. Entre ou use \"Esqueci minha senha\".", campos };
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return MUITAS_TENTATIVAS;
      case "email_address_not_authorized":
        return { erro: "Não conseguimos enviar o e-mail de confirmação para esse endereço agora. Tente mais tarde ou fale com a gente.", campos };
      case "signup_disabled":
        return { erro: "Os cadastros estão fechados no momento.", campos };
    }
    // status 0: o servidor do site nem conseguiu chegar ao Supabase (endereço errado ou projeto pausado)
    if (!error.status) return { erro: "Não conseguimos falar com o nosso sistema de contas agora. Tente de novo em instantes. (código: sem conexão)", campos };
    return { erro: `Não foi possível criar a conta agora. Tente de novo em instantes. (código: ${error.code ?? error.status ?? "desconhecido"})`, campos };
  }
  // Se a confirmação de e-mail estiver desligada no Supabase, a pessoa já entra direto.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(proximo);
  }
  return {
    ok: `Conta criada! Enviamos um e-mail para ${campos.email}. Clique no link da mensagem para confirmar e entrar.`,
  };
}

// ---------------------------------------------------------------- senha
export async function recuperarSenha(_: Resultado, form: FormData): Promise<Resultado> {
  const sb = await supabaseServidor();
  if (!sb) return NAO_CONFIGURADO;
  const email = texto(form, "email").toLowerCase();
  if (!emailValido(email)) return { erro: "Digite um e-mail válido.", campos: { email } };
  const ip = await ipDaRequisicao();
  if (!(await dentroDoLimite(`senha:ip:${ip}`, 5, 60 * 60))) return MUITAS_TENTATIVAS;

  await sb.auth.resetPasswordForEmail(email, { redirectTo: `${await origem()}/auth/confirmar?proximo=/nova-senha` });
  // Mesma resposta exista ou não a conta, para não revelar quem é cliente.
  return { ok: `Se existir uma conta com ${email}, você vai receber um e-mail com o link para criar uma nova senha.` };
}

export async function definirNovaSenha(_: Resultado, form: FormData): Promise<Resultado> {
  const sb = await supabaseServidor();
  if (!sb) return NAO_CONFIGURADO;
  const senha = String(form.get("senha") ?? "");
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (senha !== String(form.get("confirmacao") ?? "")) return { erro: "As duas senhas não são iguais." };
  const { error } = await sb.auth.updateUser({ password: senha });
  if (error) return { erro: "O link expirou. Peça um novo em “Esqueci minha senha”." };
  redirect("/minha-conta?senha=ok");
}

export async function sair() {
  const sb = await supabaseServidor();
  await sb?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ---------------------------------------------------------------- minha conta
async function exigirUsuario() {
  const sb = await supabaseServidor();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ? { sb, user: data.user } : null;
}

export async function atualizarDados(_: Resultado, form: FormData): Promise<Resultado> {
  const ctx = await exigirUsuario();
  if (!ctx) return { erro: "Entre na sua conta para editar os dados." };
  const nome = texto(form, "nome");
  const cpf = soDigitos(texto(form, "cpf"));
  const telefone = soDigitos(texto(form, "telefone"));
  if (nome.length < 3) return { erro: "Digite o seu nome completo." };
  if (cpf && !cpfValido(cpf)) return { erro: "CPF inválido. Confira os números." };
  if (telefone && (telefone.length < 10 || telefone.length > 11)) return { erro: "Celular inválido." };

  const mudancas: Record<string, string | null> = { nome, telefone: telefone || null };
  if (cpf) mudancas.cpf = cpf; // em branco = mantém o CPF já cadastrado
  const { error } = await ctx.sb.from("perfis").update(mudancas).eq("id", ctx.user.id);
  if (error) return { erro: "Não foi possível salvar. Tente de novo." };
  revalidatePath("/minha-conta");
  return { ok: "Dados salvos." };
}

export async function salvarEndereco(_: Resultado, form: FormData): Promise<Resultado> {
  const ctx = await exigirUsuario();
  if (!ctx) return { erro: "Entre na sua conta para salvar endereços." };
  const e = {
    apelido: texto(form, "apelido") || "Casa",
    destinatario: texto(form, "destinatario"),
    cep: soDigitos(texto(form, "cep")),
    rua: texto(form, "rua"),
    numero: texto(form, "numero"),
    complemento: texto(form, "complemento") || null,
    bairro: texto(form, "bairro"),
    cidade: texto(form, "cidade"),
    uf: texto(form, "uf").toUpperCase(),
    padrao: form.get("padrao") === "on",
  };
  if (!e.destinatario || !e.rua || !e.numero || !e.bairro || !e.cidade) return { erro: "Preencha todos os campos obrigatórios." };
  if (e.cep.length !== 8) return { erro: "CEP inválido." };
  if (!(UFS as readonly string[]).includes(e.uf)) return { erro: "Escolha o estado." };

  const id = texto(form, "id");
  const { count } = await ctx.sb.from("enderecos").select("id", { count: "exact", head: true });
  if (!count) e.padrao = true; // o primeiro endereço vira o padrão
  const { error } = id
    ? await ctx.sb.from("enderecos").update(e).eq("id", id)
    : await ctx.sb.from("enderecos").insert({ ...e, perfil_id: ctx.user.id });
  if (error) return { erro: "Não foi possível salvar o endereço." };
  revalidatePath("/minha-conta");
  return { ok: "Endereço salvo." };
}

export async function excluirEndereco(id: string) {
  const ctx = await exigirUsuario();
  if (!ctx) return;
  await ctx.sb.from("enderecos").delete().eq("id", id);
  revalidatePath("/minha-conta");
}

export async function tornarPadrao(id: string) {
  const ctx = await exigirUsuario();
  if (!ctx) return;
  await ctx.sb.from("enderecos").update({ padrao: true }).eq("id", id);
  revalidatePath("/minha-conta");
}

export async function solicitarExclusao(_: Resultado, form: FormData): Promise<Resultado> {
  const ctx = await exigirUsuario();
  if (!ctx) return { erro: "Entre na sua conta para fazer o pedido." };
  if (form.get("confirmo") !== "on") return { erro: "Marque a caixa para confirmar o pedido." };
  const { error } = await ctx.sb.from("perfis").update({ exclusao_solicitada_em: new Date().toISOString() }).eq("id", ctx.user.id);
  if (error) return { erro: "Não foi possível registrar o pedido. Escreva para " + LOJA.email + "." };
  revalidatePath("/minha-conta");
  return { ok: "Pedido registrado." };
}
