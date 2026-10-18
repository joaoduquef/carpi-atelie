import { TituloSecao } from "@/components/ui/TituloSecao";

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

export function AvisoDemo() {
  return (
    <p className="rounded-xl bg-bloco-amarelo px-3 py-2 text-xs text-texto-em-bloco">
      Demonstração: o login e o cadastro passam a funcionar na Fase 2.
    </p>
  );
}
