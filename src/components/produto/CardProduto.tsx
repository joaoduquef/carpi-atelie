"use client";

import Link from "@/components/ui/Link";
import { classeFundo, urlProduto, type ProdutoCard } from "@/lib/catalogo";
import { formatarReais } from "@/lib/dinheiro";
import { ImagemAbajur } from "@/components/luzes/ImagemAbajur";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { IconeCoracao, IconeSacola } from "@/components/ui/Icones";
import { useLoja } from "@/components/loja/LojaProvider";
import { NomeProduto, textoNomeProduto } from "./NomeProduto";

export function CardProduto({
  produto,
  priority = false,
}: {
  produto: ProdutoCard;
  priority?: boolean;
}) {
  const { variacao, modelo, cor, imagemApagado, imagemAceso } = produto;
  const { ehFavorito, alternarFavorito, adicionar } = useLoja();
  const favorito = ehFavorito(variacao.id);
  const nome = textoNomeProduto(modelo.nome, cor.nome);
  const href = urlProduto(modelo.slug, variacao.cor);

  return (
    <article className="group @container relative grid min-w-0 content-start gap-2.5 self-start transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.04] focus-within:z-10 focus-within:scale-[1.04] motion-reduce:transition-none">
      <Link
        href={href}
        style={{ "--brilho": `${cor.hex}cc` } as React.CSSProperties}
        className={`fundo-abajur grid aspect-[1/1.08] w-full place-items-center overflow-hidden rounded-card ${classeFundo(cor)} transition-colors duration-500 group-hover:bg-[color-mix(in_srgb,var(--rosa)_13%,var(--fundo))]`}
        aria-label={nome}
      >
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
          tom="branco"
          onClick={() => alternarFavorito(variacao.id)}
          aria-pressed={favorito}
          aria-label={
            favorito ? `Remover ${nome} dos favoritos` : `Favoritar ${nome}`
          }
        >
          <IconeCoracao width={15} height={15} cheio={favorito} />
        </BotaoIcone>
        <BotaoIcone
          tamanho="p"
          tom="branco"
          disabled={produto.disponivel <= 0}
          onClick={() => adicionar(variacao.id)}
          aria-label={
            produto.disponivel > 0
              ? `Adicionar ${nome} à sacola`
              : `${nome} esgotado`
          }
          className="disabled:opacity-50"
        >
          <IconeSacola width={15} height={15} />
        </BotaoIcone>
      </div>
      <Link
        href={href}
        className="flex flex-col gap-0.5 px-1 text-[0.95rem] @[220px]:flex-row @[220px]:items-baseline @[220px]:justify-between @[220px]:gap-2"
      >
        <NomeProduto
          modelo={modelo.nome}
          cor={cor.nome}
          className="transition-colors group-hover:text-destaque"
        />
        {modelo.precoCentavos !== null && (
          <span className="font-bold whitespace-nowrap text-destaque tabular-nums">
            {formatarReais(modelo.precoCentavos)}
          </span>
        )}
      </Link>
    </article>
  );
}
