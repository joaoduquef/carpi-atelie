import "server-only";
import { cache } from "react";
import { CATALOGO_FICTICIO } from "@/data/mock";
import { foto } from "@/lib/fotos";
import { supabasePublico } from "@/lib/supabase/servidor";
import type { Catalogo, Especificacao, StatusModelo, TipoImagem } from "@/lib/tipos";

/**
 * Carrega o catálogo do Supabase (ou o fictício, se o Supabase ainda não foi configurado).
 * Se o banco falhar ou estiver vazio, usa o fictício e registra o erro nos logs da Vercel,
 * para o site nunca sair do ar por causa do banco.
 */
export const carregarCatalogo = cache(async (): Promise<Catalogo> => {
  const sb = supabasePublico();
  if (!sb) return CATALOGO_FICTICIO;
  try {
    const catalogo = await lerCatalogo(sb);
    if (catalogo.modelos.length === 0) {
      console.error("[catalogo] o banco não tem modelos: rode supabase/seed.sql. Usando o catálogo fictício.");
      return CATALOGO_FICTICIO;
    }
    return catalogo;
  } catch (e) {
    console.error("[catalogo] falha ao ler o Supabase. Usando o catálogo fictício.", e);
    return CATALOGO_FICTICIO;
  }
});

async function lerCatalogo(sb: NonNullable<ReturnType<typeof supabasePublico>>): Promise<Catalogo> {

  const [cores, modelos, variacoes, imagens, estoque] = await Promise.all([
    sb.from("cores").select("slug, nome, hex, fundo, ordem"),
    sb.from("modelos").select("*"),
    sb.from("variacoes").select("id, modelo_slug, cor_slug, sku, estoque, ativo"),
    sb.from("imagens").select("modelo_slug, cor_slug, tipo, url, alt, ordem"),
    sb.rpc("estoque_disponivel"),
  ]);
  const erro = cores.error ?? modelos.error ?? variacoes.error ?? imagens.error ?? estoque.error;
  if (erro) throw new Error(`Não foi possível carregar o catálogo: ${erro.message}`);

  return {
    cores: cores.data ?? [],
    modelos: (modelos.data ?? []).map((m) => ({
      slug: m.slug,
      nome: m.nome,
      descricao: m.descricao,
      precoCentavos: m.preco_centavos,
      status: m.status as StatusModelo,
      especificacoes: (m.especificacoes ?? []) as Especificacao[],
      prazoProducaoDias: m.prazo_producao_dias,
      embalagem: {
        pesoKg: Number(m.peso_kg),
        larguraCm: Number(m.largura_cm),
        alturaCm: Number(m.altura_cm),
        comprimentoCm: Number(m.comprimento_cm),
      },
      ordem: m.ordem,
    })),
    variacoes: (variacoes.data ?? []).map((v) => ({
      id: v.id,
      modeloSlug: v.modelo_slug,
      cor: v.cor_slug,
      sku: v.sku,
      estoque: v.estoque,
      ativo: v.ativo,
    })),
    imagens: (imagens.data ?? []).map((i) => ({
      modeloSlug: i.modelo_slug,
      cor: i.cor_slug,
      tipo: i.tipo as TipoImagem,
      url: i.url.startsWith("/") ? foto(i.url) : i.url, // fotos do próprio site ganham a versão anti-cache
      alt: i.alt,
      ordem: i.ordem,
    })),
    disponivel: Object.fromEntries(
      ((estoque.data ?? []) as { variacao_id: string; disponivel: number }[]).map((e) => [e.variacao_id, e.disponivel]),
    ),
  };
}
