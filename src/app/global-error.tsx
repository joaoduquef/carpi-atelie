"use client";

/** Último recurso, quando até o layout do site falha. Sem as fontes e cores do site, de propósito. */
export default function ErroGeral({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "Arial, sans-serif", padding: 32, color: "#171717" }}>
        <h1 style={{ color: "#b63a55" }}>Algo deu errado</h1>
        <p>Não conseguimos abrir o site agora. Tente de novo em instantes.</p>
        <button type="button" onClick={reset} style={{ padding: "10px 20px", marginRight: 8 }}>
          Tentar de novo
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- recarrega o site inteiro de propósito */}
        <a href="/">Voltar ao início</a>
        <p style={{ fontSize: 12, color: "#575757", wordBreak: "break-all" }}>
          Detalhe técnico: {error.message || "sem mensagem"}
          {error.digest ? ` · ${error.digest}` : ""}
        </p>
      </body>
    </html>
  );
}
