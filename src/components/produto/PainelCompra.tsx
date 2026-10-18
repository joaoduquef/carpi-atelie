"use client";

import { useState } from "react";
import { MAX_POR_ITEM, useLoja } from "@/components/loja/LojaProvider";
import { BotaoLuzes } from "@/components/luzes/BotaoLuzes";
import { Botao } from "@/components/ui/Botao";
import { Quantidade } from "@/components/ui/Quantidade";
import { CalculoFrete } from "./CalculoFrete";

export function PainelCompra({
  variacaoId,
  disponivel,
  producaoDias,
}: {
  variacaoId: string;
  disponivel: boolean;
  producaoDias: number;
}) {
  const { adicionar } = useLoja();
  const [quantidade, setQuantidade] = useState(1);

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-2">
        <Quantidade valor={quantidade} aoMudar={setQuantidade} max={MAX_POR_ITEM} />
        <Botao type="button" className="min-w-0 flex-1 px-3 whitespace-nowrap max-sm:text-[0.8rem] max-sm:tracking-[0.04em]" disabled={!disponivel} onClick={() => adicionar(variacaoId, quantidade)}>
          {disponivel ? "Adicionar à sacola" : "Indisponível"}
        </Botao>
      </div>
      <BotaoLuzes />
      <div className="border-t border-linha pt-4">
        <CalculoFrete producaoDias={producaoDias} id="cep-produto" />
      </div>
    </div>
  );
}
