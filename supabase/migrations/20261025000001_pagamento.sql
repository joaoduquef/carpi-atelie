-- ============================================================
-- Fase 4: pagamento
-- ============================================================
-- Rode este arquivo no SQL Editor do Supabase depois do 20261024000001_checkout.sql.
-- Todas as funções são chamadas só pelo servidor do site (chave secreta).

-- Pagamento aprovado: o pedido passa a "pago", o estoque é baixado, a reserva sai e o cupom
-- conta um uso. Pode ser chamada mais de uma vez (aviso repetido do PagBank): só vale na primeira.
create or replace function public.confirmar_pagamento(p_pedido uuid, p_observacao text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  ped public.pedidos;
begin
  select * into ped from public.pedidos where id = p_pedido for update;
  if not found or ped.status <> 'aguardando_pagamento' then
    return false;
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
  values (p_pedido, 'pago', coalesce(p_observacao, 'Pagamento aprovado'));
  return true;
end;
$$;

-- Cancela um pedido que ainda não foi pago (devolve a reserva de estoque).
create or replace function public.cancelar_pedido(p_pedido uuid, p_observacao text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.pedidos set status = 'cancelado'
   where id = p_pedido and status = 'aguardando_pagamento';
  if not found then
    return false;
  end if;
  delete from public.reservas_estoque where pedido_id = p_pedido;
  insert into public.pedido_historico (pedido_id, status, observacao)
  values (p_pedido, 'cancelado', coalesce(p_observacao, 'Pagamento não concluído'));
  return true;
end;
$$;

-- Cancela os pedidos sem pagamento há mais de p_minutos (o Pix vale 30 minutos).
create or replace function public.cancelar_pedidos_vencidos(p_minutos int default 60)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  total int := 0;
  p record;
begin
  for p in select id from public.pedidos
            where status = 'aguardando_pagamento' and criado_em < now() - make_interval(mins => p_minutos)
  loop
    if public.cancelar_pedido(p.id, 'Prazo de pagamento esgotado') then
      total := total + 1;
    end if;
  end loop;
  return total;
end;
$$;

revoke all on function public.confirmar_pagamento(uuid, text) from public, anon, authenticated;
revoke all on function public.cancelar_pedido(uuid, text) from public, anon, authenticated;
revoke all on function public.cancelar_pedidos_vencidos(int) from public, anon, authenticated;
grant execute on function public.confirmar_pagamento(uuid, text) to service_role;
grant execute on function public.cancelar_pedido(uuid, text) to service_role;
grant execute on function public.cancelar_pedidos_vencidos(int) to service_role;
