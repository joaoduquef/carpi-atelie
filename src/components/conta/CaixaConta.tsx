import { TituloSecao } from "@/components/ui/TituloSecao";
import { supabaseConfigurado } from "@/lib/supabase/config";

export function CaixaConta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-md gap-5">
      <TituloSecao como="h1" className="text-center">
        {titulo}
      </TituloSecao>
      <div className="grid gap-4 rounded-bloco border border-linha bg-superficie px-6 py-7">{children}</div>
    </div>
  );
}

/** Aparece só enquanto o Supabase não estiver configurado. */
export function AvisoDemo() {
  if (supabaseConfigurado) return null;
  return (
    <p className="rounded-xl bg-bloco-amarelo px-3 py-2 text-xs text-texto-em-bloco">
      Demonstração: o login passa a funcionar quando o Supabase for configurado (veja o README).
    </p>
  );
}
