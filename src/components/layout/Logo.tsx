/* eslint-disable @next/next/no-img-element */
// Logo provisório (/public/brand/logo.svg e logo-creme.svg). Para trocar pelo
// logo oficial, basta substituir esses dois arquivos.

export function Logo({ className = "", sempreCreme = false }: { className?: string; sempreCreme?: boolean }) {
  if (sempreCreme) return <img src="/brand/logo-creme.svg?v=2" alt="CARPI Ateliê" className={className} />;
  return (
    <span className={`relative inline-block ${className}`}>
      {/* romã sobre creme; creme quando as luzes estão apagadas */}
      <img src="/brand/logo.svg?v=2" alt="CARPI Ateliê" className="logo-claro h-full w-full" />
      <img src="/brand/logo-creme.svg?v=2" alt="" aria-hidden className="logo-escuro absolute inset-0 h-full w-full" />
    </span>
  );
}
