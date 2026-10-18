export function TituloSecao({ children, id, como: Tag = "h2", className = "" }: { children: React.ReactNode; id?: string; como?: "h1" | "h2"; className?: string }) {
  return (
    <Tag id={id} className={`text-[clamp(1.5rem,4vw,2.2rem)] font-bold tracking-[0.08em] text-titulo uppercase ${className}`}>
      {children}
    </Tag>
  );
}
