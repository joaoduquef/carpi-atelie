"use client";

import Link from "next/link";
import { CORES } from "@/data/mock";
import { urlProduto, type ProdutoCard } from "@/lib/catalogo";
import { formatarReais } from "@/lib/dinheiro";
import { ImagemAbajur } from "@/components/luzes/ImagemAbajur";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { IconeCoracao, IconeSacola } from "@/components/ui/Icones";
import { useLoja } from "@/components/loja/LojaProvider";
import { NomeProduto, textoNomeProduto } from "./NomeProduto";

export function CardProduto({ produto, priority = false }: { produto: ProdutoCard; priority?: boolean }) {
  const { variacao, modelo, imagemApagado, imagemAceso } = produto;
  const cor = CORES[variacao.cor];
  const { ehFavorito, alternarFavorito, adicionar } = useLoja();
  const favorito = ehFavorito(variacao.id);
  const nome = textoNomeProduto(modelo.nome, variacao.cor);
  const href = urlProduto(modelo.slug, variacao.cor);

  return (
    <article className="@container relative grid min-w-0 content-start gap-1.5 self-start">
      <Link href={href} className={`grid aspect-[1/1.02] w-full place-items-center rounded-card ${cor.fundo}`} aria-label={nome}>
        <ImagemAbajur
          apagado={imagemApagado}
          aceso={imagemAceso}
          corBrilho={cor.hex}
          sizes="(max-width: 640px) 50vw, 240px"
          priority={priority}
          className="h-[78%]"
        />
      </Link>
      <div className="absolute top-2.5 right-2.5 grid gap-1.5">
        <BotaoIcone
          tamanho="p"
          tom="forte"
          onClick={() => alternarFavorito(variacao.id)}
          aria-pressed={favorito}
          aria-label={favorito ? `Remover ${nome} dos favoritos` : `Favoritar ${nome}`}
        >
          <IconeCoracao width={15} height={15} cheio={favorito} />
        </BotaoIcone>
        <BotaoIcone tamanho="p" tom="forte" onClick={() => adicionar(variacao.id)} aria-label={`Adicionar ${nome} à sacola`}>
          <IconeSacola width={15} height={15} />
        </BotaoIcone>
      </div>
      <Link
        href={href}
        className="flex flex-col gap-0.5 rounded-[14px] bg-superficie px-3 py-2.5 text-[0.92rem] @[220px]:flex-row @[220px]:items-baseline @[220px]:justify-between @[220px]:gap-2"
      >
        <NomeProduto modelo={modelo.nome} cor={variacao.cor} />
        {modelo.precoCentavos !== null && (
          <span className="font-bold whitespace-nowrap text-destaque tabular-nums">
            {formatarReais(modelo.precoCentavos)}
          </span>
        )}
      </Link>
    </article>
  );
}
