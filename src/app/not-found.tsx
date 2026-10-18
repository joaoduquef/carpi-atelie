import { BotaoLink } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";

export default function NaoEncontrada() {
  return (
    <div className="grid justify-items-center gap-5 py-10 text-center">
      <TituloSecao como="h1">Página não encontrada</TituloSecao>
      <p className="max-w-[44ch]">O endereço pode ter mudado ou a peça não está mais disponível.</p>
      <BotaoLink href="/colecao">Ver a coleção</BotaoLink>
    </div>
  );
}
