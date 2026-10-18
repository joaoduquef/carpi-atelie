/* eslint-disable @next/next/no-img-element */
// Logo provisório (/public/brand/logo.svg, no rosa da marca, e logo-creme.svg, em branco).
// Para trocar pelo logo oficial, basta substituir esses arquivos.

export function Logo({ className = "", sempreCreme = false }: { className?: string; sempreCreme?: boolean }) {
  if (sempreCreme) return <img src="/brand/logo-creme.svg?v=3" alt="CARPI Ateliê" className={className} />;
  return (
    <span className={`relative inline-block ${className}`}>
      {/* rosa com as luzes acesas; branco com as luzes apagadas */}
      <img src="/brand/logo.svg?v=3" alt="CARPI Ateliê" className="logo-claro h-full w-full transition-opacity duration-700" />
      <img src="/brand/logo-creme.svg?v=3" alt="" aria-hidden className="logo-escuro absolute inset-0 h-full w-full transition-opacity duration-700" />
    </span>
  );
}
