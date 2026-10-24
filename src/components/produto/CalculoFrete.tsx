"use client";

import { useState, useTransition } from "react";
import { simularFrete } from "@/app/frete/acoes";
import type { OpcaoFreteResumo } from "@/lib/checkout/tipos";
import { formatarReais } from "@/lib/dinheiro";
import { cepValido, formatarCep } from "@/lib/frete";
import type { ItemSacola } from "@/lib/tipos";
import { Botao } from "@/components/ui/Botao";

/** Consulta de frete e prazo. O valor vem do servidor (Melhor Envio), igual ao da finalização da compra. */
export function CalculoFrete({ producaoDias, itens, id = "cep" }: { producaoDias: number; itens: ItemSacola[]; id?: string }) {
  const [cep, setCep] = useState("");
  const [opcoes, setOpcoes] = useState<OpcaoFreteResumo[] | null>(null);
  const [erro, setErro] = useState("");
  const [calculando, iniciar] = useTransition();

  function calcular(e: React.FormEvent) {
    e.preventDefault();
    if (!cepValido(cep)) {
      setOpcoes(null);
      setErro("Digite os 8 números do CEP.");
      return;
    }
    setErro("");
    iniciar(async () => {
      const r = await simularFrete(cep, itens);
      if ("erro" in r) {
        setOpcoes(null);
        setErro(r.erro);
      } else setOpcoes(r.opcoes);
    });
  }

  return (
    <form onSubmit={calcular} className="grid gap-2" noValidate>
      <label htmlFor={id} className="text-xs font-bold tracking-[0.08em] text-texto-suave uppercase">
        Frete e prazo
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(formatarCep(e.target.value))}
          className="min-w-0 flex-[1_1_140px] rounded-full border border-linha bg-fundo px-4 py-2.5 text-texto"
        />
        <Botao type="submit" variante="secundario" disabled={calculando}>
          {calculando ? "Calculando…" : "Calcular"}
        </Botao>
      </div>
      <div role="status" className="text-sm">
        {erro && <p className="font-bold text-erro">{erro}</p>}
        {opcoes && (
          <ul className="grid gap-1">
            {opcoes.map((o) => (
              <li key={o.id}>
                <strong>{o.cobradoCentavos === 0 ? "Grátis" : formatarReais(o.cobradoCentavos)}</strong> · {o.transportadora}
                {o.servico !== "simulada" && ` ${o.servico}`} · chega em {o.prazoMin} a {o.prazoMax} dias úteis
              </li>
            ))}
          </ul>
        )}
        <p className="text-texto-suave">Produção em {producaoDias} dias úteis + transporte.</p>
      </div>
    </form>
  );
}
