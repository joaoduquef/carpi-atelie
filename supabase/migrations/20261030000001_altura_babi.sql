-- Altura da Babi corrigida para 28,6 cm (desenho de conjunto CARPI-04: 286 mm).
update public.modelos
set especificacoes = (
  select jsonb_agg(
    case when e->>'rotulo' = 'Altura' then jsonb_set(e, '{valor}', '"28,6 cm"') else e end
    order by n
  )
  from jsonb_array_elements(especificacoes) with ordinality as t(e, n)
)
where slug = 'babi';
