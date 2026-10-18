import type { Metadata } from "next";
import { Checkout } from "./Checkout";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default function FinalizarCompra() {
  return <Checkout />;
}
