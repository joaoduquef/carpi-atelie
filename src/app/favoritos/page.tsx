import type { Metadata } from "next";
import { ConteudoFavoritos } from "./ConteudoFavoritos";

export const metadata: Metadata = { title: "Favoritos", robots: { index: false } };

export default function Favoritos() {
  return <ConteudoFavoritos />;
}
