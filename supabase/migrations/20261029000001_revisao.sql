-- ============================================================
-- Revisão de segurança (29/10/2026)
-- ============================================================
-- Rode este arquivo no SQL Editor do Supabase depois do 20261025000001_pagamento.sql.
--
-- 1. A reserva de estoque passa a durar o mesmo que o prazo para pagar (60 minutos),
--    para a peça não ficar livre para outra pessoa enquanto o pedido ainda pode ser pago.
-- 2. Cupom com limite de usos: conta também os pedidos abertos, para o limite não estourar.
-- 3. Pagamento que chega depois do pedido cancelado: se ainda houver estoque, o pedido volta
--    e é confirmado; se não houver, o erro "pago_sem_estoque" avisa o servidor (para estornar).
-- 4. A inscrição na newsletter só pode ser feita pelo servidor do site (que confere o aceite).

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
  cupom public.cupons;
  abertos int;
begin
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

  -- cupom com limite: usos já pagos + pedidos ainda abertos com ele
  if nullif(p ->> 'cupom_codigo', '') is not null then
    select * into cupom from public.cupons where codigo = p ->> 'cupom_codigo' for update;
    if cupom.limite_usos is not null then
      select count(*) into abertos from public.pedidos
       where cupom_codigo = cupom.codigo and status = 'aguardando_pagamento' and criado_em > now() - interval '60 minutes';
      if cupom.usos + abertos >= cupom.limite_usos then
        raise exception 'cupom_esgotado';
      end if;
    end if;
  end if;

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

  -- a reserva vale enquanto o pedido pode ser pago (60 minutos)
  insert into public.reservas_estoque (variacao_id, pedido_id, quantidade, expira_em)
  select i ->> 'variacao_id', novo.id, (i ->> 'quantidade')::int, now() + interval '60 minutes'
    from jsonb_array_elements(p -> 'itens') i;

  insert into public.pedido_historico (pedido_id, status, observacao)
  values (novo.id, 'aguardando_pagamento', 'Pedido criado no site');

  return jsonb_build_object('id', novo.id, 'numero', novo.numero);
end;
$$;
revoke all on function public.criar_pedido(jsonb) from public, anon, authenticated;
grant execute on function public.criar_pedido(jsonb) to service_role;

create or replace function public.confirmar_pagamento(p_pedido uuid, p_observacao text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  ped public.pedidos;
  falta text;
begin
  select * into ped from public.pedidos where id = p_pedido for update;
  if not found or ped.status not in ('aguardando_pagamento', 'cancelado') then
    return false;
  end if;

  perform 1 from public.variacoes
   where id in (select variacao_id from public.pedido_itens where pedido_id = p_pedido)
   order by id
   for update;

  -- pedido que já tinha sido cancelado (pagamento atrasado): só volta se ainda houver estoque
  if ped.status = 'cancelado' then
    select i.variacao_id into falta
      from public.pedido_itens i
      join public.variacoes v on v.id = i.variacao_id
     where i.pedido_id = p_pedido
       and v.estoque - coalesce((select sum(r.quantidade) from public.reservas_estoque r
                                  where r.variacao_id = v.id and r.expira_em > now() and r.pedido_id <> p_pedido), 0) < i.quantidade
     limit 1;
    if falta is not null then
      raise exception 'pago_sem_estoque:%', falta;
    end if;
  end if;

  update public.variacoes v
     set estoque = greatest(v.estoque - i.quantidade, 0)
    from public.pedido_itens i
   where i.pedido_id = p_pedido and i.variacao_id = v.id;

  delete from public.reservas_estoque where pedido_id = p_pedido;

  if ped.cupom_codigo is not null then
    update public.cupons set usos = usos + 1 where codigo = ped.cupom_codigo;
  end if;

  update public.pedidos set status = 'pago' where id = p_pedido;
  insert into public.pedido_historico (pedido_id, status, observacao)
  values (p_pedido, 'pago', coalesce(p_observacao, 'Pagamento aprovado')
                            || case when ped.status = 'cancelado' then ' (pagamento chegou depois do prazo; pedido reativado)' else '' end);
  return true;
end;
$$;
revoke all on function public.confirmar_pagamento(uuid, text) from public, anon, authenticated;
grant execute on function public.confirmar_pagamento(uuid, text) to service_role;

-- Newsletter: só pelo servidor
revoke execute on function public.inscrever_newsletter(text, text) from public, anon, authenticated;
grant execute on function public.inscrever_newsletter(text, text) to service_role;
