/** Título de seção em caixa alta, com uma linha que puxa até a borda (ou linhas dos dois lados, se centralizado). */
export function TituloSecao({
  children,
  id,
  como: Tag = "h2",
  centralizado = false,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  como?: "h1" | "h2";
  centralizado?: boolean;
  className?: string;
}) {
  const linha = <span aria-hidden className="h-[1.5px] min-w-6 flex-1 bg-[var(--contorno)]" />;
  return (
    <div className="flex items-center gap-4">
      {centralizado && linha}
      <Tag id={id} className={`text-[clamp(1.5rem,4vw,2.2rem)] font-bold tracking-[0.08em] text-titulo uppercase ${className}`}>
        {children}
      </Tag>
      {linha}
    </div>
  );
}
