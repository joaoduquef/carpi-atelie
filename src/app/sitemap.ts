import type { MetadataRoute } from "next";
import { LOJA } from "@/config/loja";
import { listarModelos } from "@/lib/catalogo";
import { carregarCatalogo } from "@/lib/catalogo-servidor";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cat = await carregarCatalogo();
  const paginas = ["", "/colecao", "/sobre", "/contato", "/pagamentos-e-entrega", "/trocas-e-devolucoes", "/privacidade"];
  const produtos = listarModelos(cat)
    .filter((m) => m.status === "ativo")
    .map((m) => `/produto/${m.slug}`);
  return [...paginas, ...produtos].map((p) => ({ url: `${LOJA.url}${p}` }));
}
