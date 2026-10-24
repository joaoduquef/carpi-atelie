-- ============================================================
-- Fase 3: criação do pedido
-- ============================================================
-- Rode este arquivo no SQL Editor do Supabase depois do 20261018000001_inicial.sql.
--
-- O servidor do site recalcula preço, cupom e frete e chama esta função com a chave secreta.
-- Ela faz tudo de uma vez (ou nada): confere o estoque com as variações travadas, para duas
-- pessoas não comprarem a última peça ao mesmo tempo, cria o pedido, os itens, o histórico e
-- reserva o estoque por 30 minutos enquanto o pagamento não chega (Fase 4).

create or replace function public.criar_pedido(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  disponivel int;
  novo public.pedidos;
begin
  -- trava as variações do pedido (sempre na mesma ordem, para não haver impasse entre compras)
  perform 1 from public.variacoes
   where id in (select i ->> 'variacao_id' from jsonb_array_elements(p -> 'itens') i)
   order by id
   for update;

  for item in select * from jsonb_array_elements(p -> 'itens') loop
    select greatest(v.estoque - coalesce((select sum(r.quantidade) from public.reservas_estoque r
                                           where r.variacao_id = v.id and r.expira_em > now()), 0), 0)
      into disponivel
      from public.variacoes v
      join public.modelos m on m.slug = v.modelo_slug
     where v.id = item ->> 'variacao_id' and v.ativo and m.status = 'ativo';
    if coalesce(disponivel, 0) < (item ->> 'quantidade')::int then
      raise exception 'estoque_insuficiente:%', item ->> 'variacao_id';
    end if;
  end loop;

  insert into public.pedidos (
    perfil_id, subtotal_centavos, desconto_cupom_centavos, desconto_pix_centavos,
    frete_cobrado_centavos, frete_custo_centavos, juros_centavos, total_centavos,
    forma_pagamento, parcelas, cupom_codigo, cliente, endereco,
    transportadora, servico_frete, prazo_dias_min, prazo_dias_max
  ) values (
    (p ->> 'perfil_id')::uuid, (p ->> 'subtotal')::int, (p ->> 'desconto_cupom')::int, (p ->> 'desconto_pix')::int,
    (p ->> 'frete_cobrado')::int, (p ->> 'frete_custo')::int, (p ->> 'juros')::int, (p ->> 'total')::int,
    (p ->> 'forma_pagamento')::public.forma_pagamento, (p ->> 'parcelas')::int, nullif(p ->> 'cupom_codigo', ''),
    p -> 'cliente', p -> 'endereco',
    p ->> 'transportadora', p ->> 'servico_frete', (p ->> 'prazo_min')::int, (p ->> 'prazo_max')::int
  )
  returning * into novo;

  insert into public.pedido_itens (pedido_id, variacao_id, nome, preco_unitario_centavos, quantidade)
  select novo.id, i ->> 'variacao_id', i ->> 'nome', (i ->> 'preco_unitario')::int, (i ->> 'quantidade')::int
    from jsonb_array_elements(p -> 'itens') i;

  insert into public.reservas_estoque (variacao_id, pedido_id, quantidade, expira_em)
  select i ->> 'variacao_id', novo.id, (i ->> 'quantidade')::int, now() + interval '30 minutes'
    from jsonb_array_elements(p -> 'itens') i;

  insert into public.pedido_historico (pedido_id, status, observacao)
  values (novo.id, 'aguardando_pagamento', 'Pedido criado no site');

  return jsonb_build_object('id', novo.id, 'numero', novo.numero);
end;
$$;

-- Só o servidor (chave secreta) pode criar pedidos; clientes e visitantes, não.
revoke all on function public.criar_pedido(jsonb) from public, anon, authenticated;
grant execute on function public.criar_pedido(jsonb) to service_role;

-- Limpa reservas vencidas (chamada pelo servidor de vez em quando; o estoque disponível já ignora as vencidas)
create or replace function public.limpar_reservas_vencidas()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.reservas_estoque where expira_em < now() - interval '1 day';
$$;
revoke all on function public.limpar_reservas_vencidas() from public, anon, authenticated;
grant execute on function public.limpar_reservas_vencidas() to service_role;
