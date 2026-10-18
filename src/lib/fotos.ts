// Ao trocar uma foto mantendo o mesmo nome de arquivo, aumente este número:
// assim o site (e a Vercel) param de mostrar a versão antiga guardada em cache.
export const VERSAO_FOTOS = 6;

export function foto(caminho: string): string {
  return `${caminho}?v=${VERSAO_FOTOS}`;
}
