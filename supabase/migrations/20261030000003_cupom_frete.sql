-- Cupom de frete: novo campo "aplica_em" ('produtos' ou 'frete') e o cupom FRETEQUINZE (R$ 15,00 no frete).
alter table public.cupons add column if not exists aplica_em text not null default 'produtos';
alter table public.cupons drop constraint if exists cupons_aplica_em_check;
alter table public.cupons add constraint cupons_aplica_em_check check (aplica_em in ('produtos', 'frete'));

insert into public.cupons (codigo, tipo, valor, aplica_em)
values ('FRETEQUINZE', 'fixo', 1500, 'frete')
on conflict (codigo) do update set tipo = excluded.tipo, valor = excluded.valor, aplica_em = excluded.aplica_em, ativo = true;

-- Babi: lâmpada de 4,5 W
update public.modelos
set especificacoes = (
  select jsonb_agg(
    case when e->>'rotulo' = 'Lâmpada' then jsonb_set(e, '{valor}', '"LED 4,5 W, 3000 K (luz quente), bivolt, inclusa"') else e end
    order by n
  )
  from jsonb_array_elements(especificacoes) with ordinality as t(e, n)
)
where slug = 'babi';
