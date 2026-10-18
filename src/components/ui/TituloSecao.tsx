/** Título de seção em caixa alta, espaçado. */
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
  return (
    <Tag
      id={id}
      className={`text-[clamp(1.35rem,2.6vw,1.9rem)] font-bold tracking-[0.12em] text-titulo uppercase ${centralizado ? "text-center" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
