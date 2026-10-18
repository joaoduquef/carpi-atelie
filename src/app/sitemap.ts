import type { MetadataRoute } from "next";
import { LOJA } from "@/config/loja";
import { listarModelos } from "@/lib/catalogo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = ["", "/colecao", "/sobre", "/contato", "/pagamentos-e-entrega", "/trocas-e-devolucoes", "/privacidade"];
  const produtos = listarModelos()
    .filter((m) => m.status === "ativo")
    .map((m) => `/produto/${m.slug}`);
  return [...paginas, ...produtos].map((p) => ({ url: `${LOJA.url}${p}` }));
}
