"use client";

import { useState } from "react";
import { formatarReais } from "@/lib/dinheiro";
import { cepValido, cotarFreteSimulado, formatarCep, prazoTotal, type CotacaoFrete } from "@/lib/frete";
import { Botao } from "@/components/ui/Botao";

export function CalculoFrete({ producaoDias, id = "cep" }: { producaoDias: number; id?: string }) {
  const [cep, setCep] = useState("");
  const [cotacao, setCotacao] = useState<CotacaoFrete | null>(null);
  const [erro, setErro] = useState("");

  function calcular(e: React.FormEvent) {
    e.preventDefault();
    if (!cepValido(cep)) {
      setCotacao(null);
      setErro("Digite os 8 números do CEP.");
      return;
    }
    setErro("");
    setCotacao(cotarFreteSimulado(cep)); // Fase 3: cotação real pelo Melhor Envio, no servidor
  }

  const prazo = cotacao ? prazoTotal(cotacao, producaoDias) : null;

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
        <Botao type="submit" variante="secundario">
          Calcular
        </Botao>
      </div>
      <div role="status" className="text-sm">
        {erro && <p className="font-bold text-erro">{erro}</p>}
        {cotacao && prazo && (
          <>
            <p>
              <strong>{cotacao.valorCentavos === 0 ? "Grátis" : formatarReais(cotacao.valorCentavos)}</strong> · {cotacao.transportadora} · chega em{" "}
              {prazo.min} a {prazo.max} dias úteis
            </p>
            <p className="text-texto-suave">
              {producaoDias} dias úteis de produção + {cotacao.prazoMin} a {cotacao.prazoMax} de transporte
            </p>
          </>
        )}
        {!cotacao && !erro && <p className="text-texto-suave">Produção em {producaoDias} dias úteis + transporte.</p>}
      </div>
    </form>
  );
}
