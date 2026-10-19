import NextLink from "next/link";

/** Link do site. Sem pré-carregamento, porque cada clique recarrega a página inteira (veja NavegacaoCompleta). */
export default function Link(props: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
