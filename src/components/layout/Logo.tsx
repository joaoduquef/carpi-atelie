/* eslint-disable @next/next/no-img-element */
// Logo provisório (/public/brand/logo.svg, no rosa da marca, e logo-creme.svg, em branco).
// Para trocar pelo logo oficial, basta substituir esses arquivos.

export function Logo({ className = "", sempreCreme = false }: { className?: string; sempreCreme?: boolean }) {
  return (
    <img src={sempreCreme ? "/brand/logo-creme.svg?v=3" : "/brand/logo.svg?v=3"} alt="CARPI Ateliê" className={className} />
  );
}
