-- CARPI Ateliê · estrutura inicial do banco (Fase 2)
-- Valores em dinheiro sempre em centavos (integer).
-- Todas as tabelas têm Row Level Security (RLS) ligado.

-- ============================================================
-- Tipos
-- ============================================================
create type public.papel_usuario as enum ('cliente', 'admin');
create type public.status_modelo as enum ('ativo', 'em_breve', 'inativo');
create type public.tipo_imagem as enum ('apagado', 'aceso', 'ambiente', 'desenho_tecnico');
create type public.status_pedido as enum ('aguardando_pagamento', 'pago', 'em_producao', 'enviado', 'entregue', 'cancelado');
create type public.tipo_cupom as enum ('percentual', 'fixo');
create type public.forma_pagamento as enum ('pix', 'cartao');

-- ============================================================
-- Perfis (1 por usuário do Supabase Auth)
-- ============================================================
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text not null default '',
  cpf text,
  telefone text,
  papel public.papel_usuario not null default 'cliente',
  aceita_newsletter boolean not null default false,
  exclusao_solicitada_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Quem é admin? Usada nas regras de segurança. "security definer" evita recursão no RLS.
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.perfis where id = auth.uid() and papel = 'admin');
$$;

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, email, nome, cpf, telefone, aceita_newsletter)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    nullif(new.raw_user_meta_data ->> 'cpf', ''),
    nullif(new.raw_user_meta_data ->> 'telefone', ''),
    coalesce((new.raw_user_meta_data ->> 'aceita_newsletter')::boolean, false)
  );
  if coalesce((new.raw_user_meta_data ->> 'aceita_newsletter')::boolean, false) then
    insert into public.newsletter (email, origem) values (lower(new.email), 'cadastro')
    on conflict (email) do update set cancelado_em = null, consentimento_em = now();
  end if;
  return new;
end;
$$;

-- ============================================================
-- Endereços
-- ============================================================
create table public.enderecos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  apelido text not null default 'Casa',
  destinatario text not null,
  cep text not null check (cep ~ '^[0-9]{8}$'),
  rua text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  cidade text not null,
  uf char(2) not null check (uf ~ '^[A-Z]{2}$'),
  padrao boolean not null default false,
  criado_em timestamptz not null default now()
);
create index on public.enderecos (perfil_id);

-- ============================================================
-- Catálogo
-- ============================================================
create table public.cores (
  slug text primary key,
  nome text not null,
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  fundo text not null, -- classe de fundo do card: bloco-mare, bloco-damasco, bloco-rosa
  ordem int not null default 0
);

create table public.modelos (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  descricao text not null default '',
  preco_centavos int check (preco_centavos is null or preco_centavos > 0),
  status public.status_modelo not null default 'em_breve',
  especificacoes jsonb not null default '[]'::jsonb, -- [{ "rotulo": "Altura", "valor": "30,6 cm" }]
  prazo_producao_dias int not null default 2 check (prazo_producao_dias >= 0),
  peso_kg numeric(6, 3) not null default 0.7,
  largura_cm numeric(6, 1) not null default 25,
  altura_cm numeric(6, 1) not null default 35,
  comprimento_cm numeric(6, 1) not null default 25,
  ordem int not null default 0,
  criado_em timestamptz not null default now(),
  constraint ativo_tem_preco check (status <> 'ativo' or preco_centavos is not null)
);

create table public.variacoes (
  id text primary key, -- ex.: babi-mare
  modelo_slug text not null references public.modelos (slug) on update cascade on delete cascade,
  cor_slug text not null references public.cores (slug) on update cascade,
  sku text not null unique,
  estoque int not null default 0 check (estoque >= 0),
  ativo boolean not null default true,
  unique (modelo_slug, cor_slug)
);

create table public.imagens (
  id uuid primary key default gen_random_uuid(),
  modelo_slug text not null references public.modelos (slug) on update cascade on delete cascade,
  cor_slug text references public.cores (slug) on update cascade, -- null = vale para todas as cores
  tipo public.tipo_imagem not null,
  url text not null,
  alt text not null default '',
  ordem int not null default 0
);
create index on public.imagens (modelo_slug);

-- ============================================================
-- Favoritos e sacola (de clientes com conta)
-- ============================================================
create table public.favoritos (
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  variacao_id text not null references public.variacoes (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (perfil_id, variacao_id)
);

create table public.sacola_itens (
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  variacao_id text not null references public.variacoes (id) on delete cascade,
  quantidade int not null check (quantidade between 1 and 9),
  atualizado_em timestamptz not null default now(),
  primary key (perfil_id, variacao_id)
);

-- ============================================================
-- Cupons, pedidos e pagamentos (usados a partir das Fases 3 e 4)
-- ============================================================
create table public.cupons (
  codigo text primary key check (codigo = upper(codigo)),
  tipo public.tipo_cupom not null,
  valor int not null check (valor > 0), -- percentual (1 a 100) ou centavos
  valido_de timestamptz,
  valido_ate timestamptz,
  limite_usos int,
  usos int not null default 0,
  valor_minimo_centavos int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  constraint percentual_valido check (tipo <> 'percentual' or valor <= 100)
);

create sequence public.numero_pedido start 1001;

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero int not null unique default nextval('public.numero_pedido'),
  perfil_id uuid references public.perfis (id) on delete set null,
  status public.status_pedido not null default 'aguardando_pagamento',
  subtotal_centavos int not null,
  desconto_cupom_centavos int not null default 0,
  desconto_pix_centavos int not null default 0,
  frete_cobrado_centavos int not null default 0,
  frete_custo_centavos int not null default 0, -- quanto a loja paga (no Sudeste, o cliente vê "Grátis")
  juros_centavos int not null default 0,
  total_centavos int not null,
  forma_pagamento public.forma_pagamento,
  parcelas int not null default 1,
  cupom_codigo text references public.cupons (codigo),
  cliente jsonb not null, -- cópia de nome, e-mail, CPF e telefone no momento da compra
  endereco jsonb not null, -- cópia do endereço de entrega
  transportadora text,
  servico_frete text,
  prazo_dias_min int,
  prazo_dias_max int,
  codigo_rastreio text,
  url_rastreio text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index on public.pedidos (perfil_id, criado_em desc);
create index on public.pedidos (status);

create table public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  variacao_id text references public.variacoes (id) on delete set null,
  nome text not null,
  preco_unitario_centavos int not null,
  quantidade int not null check (quantidade > 0)
);
create index on public.pedido_itens (pedido_id);

create table public.pedido_historico (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  status public.status_pedido not null,
  observacao text,
  criado_por uuid references public.perfis (id) on delete set null,
  criado_em timestamptz not null default now()
);
create index on public.pedido_historico (pedido_id);

create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  provedor text not null, -- pagarme | pagbank
  id_externo text,
  metodo public.forma_pagamento not null,
  status text not null,
  valor_centavos int not null,
  pix_qr_code text,
  pix_copia_e_cola text,
  expira_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index on public.pagamentos (pedido_id);
create unique index on public.pagamentos (provedor, id_externo);

create table public.reservas_estoque (
  id uuid primary key default gen_random_uuid(),
  variacao_id text not null references public.variacoes (id) on delete cascade,
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  quantidade int not null check (quantidade > 0),
  expira_em timestamptz not null
);
create index on public.reservas_estoque (variacao_id, expira_em);

create table public.webhook_eventos (
  provedor text not null,
  id_evento text not null,
  recebido_em timestamptz not null default now(),
  processado_em timestamptz,
  primary key (provedor, id_evento)
);

-- ============================================================
-- Newsletter
-- ============================================================
create table public.newsletter (
  email text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  origem text not null default 'site',
  consentimento_em timestamptz not null default now(),
  cancelado_em timestamptz
);

-- Inscrição pública. Usa função para não expor a lista (ninguém de fora consegue ler).
create or replace function public.inscrever_newsletter(p_email text, p_origem text default 'site')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.newsletter (email, origem) values (lower(trim(p_email)), coalesce(p_origem, 'site'))
  on conflict (email) do update set cancelado_em = null, consentimento_em = now();
end;
$$;

-- ============================================================
-- Limite de tentativas (login, cadastro, pagamento)
-- ============================================================
create table public.tentativas (
  chave text not null,
  criado_em timestamptz not null default now()
);
create index on public.tentativas (chave, criado_em);

-- Registra uma tentativa e diz se ainda está dentro do limite.
create or replace function public.registrar_tentativa(p_chave text, p_limite int, p_janela_segundos int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  total int;
begin
  delete from public.tentativas where criado_em < now() - interval '1 day';
  select count(*) into total from public.tentativas
   where chave = p_chave and criado_em > now() - make_interval(secs => p_janela_segundos);
  if total >= p_limite then
    return false;
  end if;
  insert into public.tentativas (chave) values (p_chave);
  return true;
end;
$$;

-- ============================================================
-- Estoque disponível = estoque − reservas ainda válidas
-- ============================================================
-- "security definer" para enxergar as reservas, que o público não pode ler.
create or replace function public.estoque_disponivel()
returns table (variacao_id text, disponivel int)
language sql
stable
security definer
set search_path = ''
as $$
  select v.id,
         greatest(v.estoque - coalesce((select sum(r.quantidade) from public.reservas_estoque r
                                         where r.variacao_id = v.id and r.expira_em > now()), 0), 0)::int
    from public.variacoes v
    join public.modelos m on m.slug = v.modelo_slug
   where v.ativo and m.status = 'ativo';
$$;

-- ============================================================
-- Gatilhos
-- ============================================================
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger perfis_atualizado before update on public.perfis for each row execute function public.tocar_atualizado_em();
create trigger pedidos_atualizado before update on public.pedidos for each row execute function public.tocar_atualizado_em();
create trigger pagamentos_atualizado before update on public.pagamentos for each row execute function public.tocar_atualizado_em();

-- Só um endereço padrão por cliente
create or replace function public.unico_endereco_padrao()
returns trigger
language plpgsql
as $$
begin
  if new.padrao then
    update public.enderecos set padrao = false where perfil_id = new.perfil_id and id <> new.id and padrao;
  end if;
  return new;
end;
$$;
create trigger enderecos_padrao after insert or update of padrao on public.enderecos
  for each row when (new.padrao) execute function public.unico_endereco_padrao();

-- Cliente não pode se promover a admin nem mexer no próprio e-mail de cadastro
create or replace function public.proteger_perfil()
returns trigger
language plpgsql
as $$
begin
  -- vale para clientes logados; o painel SQL do Supabase e o servidor (chave de serviço) podem alterar
  if current_user in ('authenticated', 'anon') and not public.eh_admin() and (new.papel is distinct from old.papel or new.email is distinct from old.email) then
    raise exception 'Alteração não permitida';
  end if;
  return new;
end;
$$;
create trigger perfis_protegidos before update on public.perfis for each row execute function public.proteger_perfil();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.perfis enable row level security;
alter table public.enderecos enable row level security;
alter table public.cores enable row level security;
alter table public.modelos enable row level security;
alter table public.variacoes enable row level security;
alter table public.imagens enable row level security;
alter table public.favoritos enable row level security;
alter table public.sacola_itens enable row level security;
alter table public.cupons enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;
alter table public.pedido_historico enable row level security;
alter table public.pagamentos enable row level security;
alter table public.reservas_estoque enable row level security;
alter table public.webhook_eventos enable row level security;
alter table public.newsletter enable row level security;
alter table public.tentativas enable row level security;

-- Perfis: cada um vê e edita o seu; admin vê e edita todos
create policy "perfil: ler o próprio" on public.perfis for select to authenticated using (id = auth.uid() or public.eh_admin());
create policy "perfil: editar o próprio" on public.perfis for update to authenticated
  using (id = auth.uid() or public.eh_admin()) with check (id = auth.uid() or public.eh_admin());

-- Endereços: só o dono (admin lê para ver pedidos)
create policy "endereço: ler" on public.enderecos for select to authenticated using (perfil_id = auth.uid() or public.eh_admin());
create policy "endereço: criar" on public.enderecos for insert to authenticated with check (perfil_id = auth.uid());
create policy "endereço: editar" on public.enderecos for update to authenticated using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());
create policy "endereço: apagar" on public.enderecos for delete to authenticated using (perfil_id = auth.uid());

-- Catálogo: todos leem o que não está inativo; só admin escreve
create policy "cores: ler" on public.cores for select to anon, authenticated using (true);
create policy "cores: admin" on public.cores for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

create policy "modelos: ler" on public.modelos for select to anon, authenticated using (status <> 'inativo' or public.eh_admin());
create policy "modelos: admin" on public.modelos for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

create policy "variações: ler" on public.variacoes for select to anon, authenticated
  using (public.eh_admin() or exists (select 1 from public.modelos m where m.slug = modelo_slug and m.status <> 'inativo'));
create policy "variações: admin" on public.variacoes for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

create policy "imagens: ler" on public.imagens for select to anon, authenticated
  using (public.eh_admin() or exists (select 1 from public.modelos m where m.slug = modelo_slug and m.status <> 'inativo'));
create policy "imagens: admin" on public.imagens for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- Favoritos e sacola: só o dono
create policy "favoritos: dono" on public.favoritos for all to authenticated using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());
create policy "sacola: dono" on public.sacola_itens for all to authenticated using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());

-- Cupons: só admin (o checkout valida no servidor com a chave de serviço)
create policy "cupons: admin" on public.cupons for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- Pedidos: o cliente só LÊ os seus; criar e alterar é feito pelo servidor (chave de serviço) ou por admin
create policy "pedidos: ler" on public.pedidos for select to authenticated using (perfil_id = auth.uid() or public.eh_admin());
create policy "pedidos: admin" on public.pedidos for update to authenticated using (public.eh_admin()) with check (public.eh_admin());

create policy "itens: ler" on public.pedido_itens for select to authenticated
  using (public.eh_admin() or exists (select 1 from public.pedidos p where p.id = pedido_id and p.perfil_id = auth.uid()));

create policy "histórico: ler" on public.pedido_historico for select to authenticated
  using (public.eh_admin() or exists (select 1 from public.pedidos p where p.id = pedido_id and p.perfil_id = auth.uid()));
create policy "histórico: admin" on public.pedido_historico for insert to authenticated with check (public.eh_admin());

-- Pagamento: o cliente vê o próprio (para mostrar o QR do Pix); só servidor grava
create policy "pagamentos: ler" on public.pagamentos for select to authenticated
  using (public.eh_admin() or exists (select 1 from public.pedidos p where p.id = pedido_id and p.perfil_id = auth.uid()));

-- Reservas, webhooks e tentativas: nenhuma política = só o servidor (chave de serviço) acessa
-- Newsletter: só admin lê; inscrição é pela função inscrever_newsletter
create policy "newsletter: admin" on public.newsletter for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- Permissões das funções
revoke all on function public.registrar_tentativa(text, int, int) from public, anon, authenticated;
grant execute on function public.registrar_tentativa(text, int, int) to service_role;
grant execute on function public.inscrever_newsletter(text, text) to anon, authenticated;
grant execute on function public.eh_admin() to anon, authenticated;
grant execute on function public.estoque_disponivel() to anon, authenticated;
