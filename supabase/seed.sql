-- Dados iniciais do catálogo. Pode rodar de novo sem duplicar (usa "on conflict").

insert into public.cores (slug, nome, hex, fundo, ordem) values
  ('mare', 'Maré', '#7FB4D2', 'bloco-mare', 1),
  ('damasco', 'Damasco', '#F29A4E', 'bloco-damasco', 2),
  ('roma', 'Romã', '#E8708B', 'bloco-rosa', 3)
on conflict (slug) do update set nome = excluded.nome, hex = excluded.hex, fundo = excluded.fundo, ordem = excluded.ordem;

insert into public.modelos (slug, nome, descricao, preco_centavos, status, especificacoes, prazo_producao_dias, peso_kg, largura_cm, altura_cm, comprimento_cm, ordem) values
  ('babi', 'Babi',
   'Um abajur de saia ondulada em PETG translúcido. Apagado, é uma peça de cor; aceso, espalha uma luz quente e macia pelo ambiente.',
   29900, 'ativo',
   '[{"rotulo":"Altura","valor":"30,6 cm"},
     {"rotulo":"Largura","valor":"20,7 cm (saia ondulada); base com Ø 12 cm"},
     {"rotulo":"Material","valor":"PETG translúcido"},
     {"rotulo":"Lâmpada","valor":"LED 6 W, 3000 K (luz quente), bivolt, inclusa"},
     {"rotulo":"Peso","valor":"Aproximadamente 550 a 700 g"},
     {"rotulo":"Produção","valor":"Feito sob encomenda em 2 dias úteis"}]'::jsonb,
   2, 0.7, 25, 35, 25, 1),
  ('isa', 'Isa', 'Novo modelo da CARPI, nas cores Maré, Damasco e Romã.', null, 'em_breve', '[]'::jsonb, 2, 0.7, 25, 35, 25, 2),
  ('manu', 'Manu', 'Novo modelo da CARPI, nas cores Maré, Damasco e Romã.', null, 'em_breve', '[]'::jsonb, 2, 0.7, 25, 35, 25, 3)
on conflict (slug) do nothing;

insert into public.variacoes (id, modelo_slug, cor_slug, sku, estoque, ativo)
select m.slug || '-' || c.slug, m.slug, c.slug, upper(m.slug || '-' || c.slug),
       case when m.status = 'ativo' then 10 else 0 end, m.status = 'ativo'
  from public.modelos m cross join public.cores c
on conflict (id) do nothing;

insert into public.imagens (modelo_slug, cor_slug, tipo, url, alt, ordem)
select 'babi', c.slug, t.tipo::public.tipo_imagem, '/products/babi/' || c.slug || '-' || t.tipo || '.png',
       'Abajur Babi ' || c.nome || ' ' || t.tipo, c.ordem
  from public.cores c cross join (values ('apagado'), ('aceso')) as t (tipo)
 where not exists (select 1 from public.imagens i where i.modelo_slug = 'babi' and i.cor_slug = c.slug and i.tipo = t.tipo::public.tipo_imagem);

insert into public.imagens (modelo_slug, cor_slug, tipo, url, alt, ordem)
select 'babi', null, x.tipo::public.tipo_imagem, x.url, x.alt, x.ordem
  from (values ('ambiente', '/products/babi/ambiente-1.jpg', 'Abajur Babi rosa sobre uma escrivaninha de madeira', 10),
               ('desenho_tecnico', '/products/babi/desenho-tecnico.png', 'Desenho técnico do abajur Babi com medidas', 20)) as x (tipo, url, alt, ordem)
 where not exists (select 1 from public.imagens i where i.modelo_slug = 'babi' and i.tipo = x.tipo::public.tipo_imagem);
