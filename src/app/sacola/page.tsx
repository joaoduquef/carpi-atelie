import type { Metadata } from "next";
import { ConteudoSacola } from "./ConteudoSacola";

export const metadata: Metadata = { title: "Sacola", robots: { index: false } };

export default function Sacola() {
  return <ConteudoSacola />;
}
