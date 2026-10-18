"use client";

import { useLoja } from "@/components/loja/LojaProvider";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { IconeCoracao } from "@/components/ui/Icones";

export function BotaoFavorito({ variacaoId, nome }: { variacaoId: string; nome: string }) {
  const { ehFavorito, alternarFavorito } = useLoja();
  const favorito = ehFavorito(variacaoId);
  return (
    <BotaoIcone
      onClick={() => alternarFavorito(variacaoId)}
      aria-pressed={favorito}
      aria-label={favorito ? `Remover ${nome} dos favoritos` : `Favoritar ${nome}`}
    >
      <IconeCoracao cheio={favorito} />
    </BotaoIcone>
  );
}
