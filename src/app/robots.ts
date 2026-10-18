import type { MetadataRoute } from "next";
import { LOJA } from "@/config/loja";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/minha-conta", "/sacola", "/finalizar-compra", "/api"] },
    sitemap: `${LOJA.url}/sitemap.xml`,
  };
}
