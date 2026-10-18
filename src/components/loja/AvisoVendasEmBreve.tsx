/** Aparece no lugar de "Finalizar compra" enquanto LOJA.vendasAbertas for false. */
export function AvisoVendasEmBreve() {
  return (
    <div role="status" className="grid gap-1 rounded-card border-2 border-botao px-4 py-3 text-center">
      <p className="text-sm font-bold tracking-[0.07em] text-destaque uppercase">Vendas abrem em breve</p>
      <p className="text-sm text-texto-suave">
        Seus itens ficam guardados na sacola. Cadastre seu e-mail abaixo para saber quando abrirmos.
      </p>
    </div>
  );
}
