-- =============================================================================
-- INSTALAÇÃO COMPLETA — gerado em 2026-10-03 por scripts/gerar-sql-completo.mjs
--
-- Como usar: Supabase Dashboard → SQL Editor → New query → colar tudo → Run.
-- Corre numa transacção só: ou aplica tudo, ou nada.

--
-- Depois, opcionalmente, correr supabase/seed.sql para ter um tenant de
-- demonstração (Lanchonete da Praça).
--
-- Ficheiros incluídos, por ordem:
--   0001_esquema.sql
--   0002_rls.sql
--   0003_storage.sql
--   0004_realtime.sql
--   0005_cadeia_producao.sql
--   0006_arquivos.sql
--   0007_arquivos_storage.sql
--   0008_modulos.sql
--   0009_clientes.sql
--   0010_financeiro.sql
--   0011_cnpj_alfanumerico.sql
--   0012_caixa_pdv.sql
--   0013_cozinha_comandas.sql
--   0014_estoque.sql
--   0015_equipe.sql
--   0016_integracoes_fiscal.sql
--   0017_pix.sql
--   0018_atomicidade_estoque.sql
-- =============================================================================

begin;

-- Registo do que foi aplicado (o mesmo que `pnpm migrar` usa).
create schema if not exists app;
create table if not exists app.migracoes (
  nome text primary key,
  aplicada_em timestamptz not null default now()
);


-- #############################################################################
-- 0001_esquema.sql
-- #############################################################################

-- =============================================================================
-- 0001 — Esquema base (Fase 1, preparado para as fases 2 a 4)
--
-- Regras que este ficheiro garante:
--   • Toda a tabela de negócio tem `tenant_id`. Dois tenants nunca partilham
--     linhas: as chaves estrangeiras compostas (id, tenant_id) impedem que um
--     grupo de opção aponte para um produto de outro tenant, por exemplo.
--   • O campo `canal` existe em todo o pedido desde o primeiro dia (Fase 4).
--   • `insumos` e `fichas` existem já, sem ecrã (Fase 2).
--   • Pedidos guardam um snapshot dos itens: produtos mudam, pedidos não.
-- =============================================================================

create schema if not exists app;
comment on schema app is 'Funções internas (RLS, triggers). Não é exposto pela API.';

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.tenant_status as enum ('onboarding', 'ativo', 'suspenso', 'cancelado');
create type public.papel_membro as enum ('dono', 'funcionario');
create type public.canal_pedido as enum ('cardapio', 'whatsapp', 'balcao', 'ifood', '99food');
create type public.pedido_status as enum ('novo', 'aceite', 'pronto', 'concluido', 'cancelado');
create type public.tipo_entrega as enum ('entrega', 'retirada');
create type public.forma_pagamento as enum ('pix', 'dinheiro', 'cartao');
create type public.etapa_onboarding as enum ('cadastro', 'cardapio', 'fotos', 'pagina', 'google', 'cobranca');

-- -----------------------------------------------------------------------------
-- Utilitários
-- -----------------------------------------------------------------------------
create function app.carimbar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Tenants — o comerciante
-- -----------------------------------------------------------------------------
create table public.tenants (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  nome_fantasia  text not null check (length(nome_fantasia) between 2 and 80),
  razao_social   text,
  cnpj           text check (cnpj is null or cnpj ~ '^[0-9]{14}$'),
  telefone       text,
  whatsapp       text not null check (whatsapp ~ '^[0-9]{10,15}$'),
  logo_url       text,
  cor_marca      text check (cor_marca is null or cor_marca ~ '^#[0-9a-fA-F]{6}$'),
  endereco       jsonb not null default '{}'::jsonb,
  plano          text not null default 'essencial',
  status         public.tenant_status not null default 'onboarding',
  renovacao_em   date,
  publicado_em   timestamptz,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
comment on table public.tenants is 'O comerciante (a conta). Um tenant pode ter várias lojas.';
comment on column public.tenants.whatsapp is 'Só dígitos, com DDI. Ex.: 5569999998888';
comment on column public.tenants.publicado_em is 'Quando a página pública foi considerada pronta pelo operador.';

create trigger tenants_atualizado_em
  before update on public.tenants
  for each row execute function app.carimbar_atualizado_em();

-- -----------------------------------------------------------------------------
-- Lojas — unidade física
-- -----------------------------------------------------------------------------
create table public.lojas (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants (id) on delete cascade,
  nome             text not null default 'Principal',
  endereco         jsonb not null default '{}'::jsonb,
  fuso_horario     text not null default 'America/Sao_Paulo',
  horarios         jsonb not null default '[]'::jsonb,
  aceita_entrega   boolean not null default true,
  aceita_retirada  boolean not null default true,
  raio_entrega_km  numeric(5, 1) check (raio_entrega_km is null or raio_entrega_km >= 0),
  taxa_entrega     numeric(10, 2) not null default 0 check (taxa_entrega >= 0),
  pedido_minimo    numeric(10, 2) not null default 0 check (pedido_minimo >= 0),
  fechada_ate      timestamptz,
  ativo            boolean not null default true,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  unique (id, tenant_id)
);
comment on column public.lojas.horarios is 'Lista de {dia: 0-6 (domingo=0), abre: "HH:MM", fecha: "HH:MM"}. Pode ter mais de um intervalo por dia.';
comment on column public.lojas.fechada_ate is 'Botão "Fechar loja agora": a loja fica fechada até esta hora, independentemente do horário.';

create index lojas_tenant_idx on public.lojas (tenant_id);

create trigger lojas_atualizado_em
  before update on public.lojas
  for each row execute function app.carimbar_atualizado_em();

-- -----------------------------------------------------------------------------
-- Catálogo central — categorias, produtos, grupos de opção, opções
-- -----------------------------------------------------------------------------
create table public.categorias (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  nome       text not null check (length(nome) between 1 and 60),
  ordem      integer not null default 0,
  ativo      boolean not null default true,
  unique (id, tenant_id)
);
create index categorias_tenant_idx on public.categorias (tenant_id, ordem);

create table public.produtos (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants (id) on delete cascade,
  categoria_id       uuid not null,
  nome               text not null check (length(nome) between 1 and 100),
  descricao          text,
  preco              numeric(10, 2) not null check (preco >= 0),
  preco_promocional  numeric(10, 2) check (preco_promocional is null or (preco_promocional >= 0 and preco_promocional < preco)),
  foto_url           text,
  sku                text,
  disponivel         boolean not null default true,
  tempo_preparo_min  integer check (tempo_preparo_min is null or tempo_preparo_min >= 0),
  ordem              integer not null default 0,
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (categoria_id, tenant_id) references public.categorias (id, tenant_id) on delete cascade
);
create index produtos_tenant_categoria_idx on public.produtos (tenant_id, categoria_id, ordem);

create trigger produtos_atualizado_em
  before update on public.produtos
  for each row execute function app.carimbar_atualizado_em();

create table public.grupos_opcao (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  produto_id  uuid not null,
  nome        text not null check (length(nome) between 1 and 60),
  min         integer not null default 0 check (min >= 0),
  max         integer not null default 1 check (max >= 1),
  obrigatorio boolean not null default false,
  ordem       integer not null default 0,
  unique (id, tenant_id),
  check (max >= min),
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id) on delete cascade
);
comment on table public.grupos_opcao is '"Escolha o ponto", "adicionais". min/max de opções por grupo.';
create index grupos_opcao_produto_idx on public.grupos_opcao (tenant_id, produto_id, ordem);

create table public.opcoes (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants (id) on delete cascade,
  grupo_id         uuid not null,
  nome             text not null check (length(nome) between 1 and 60),
  preco_adicional  numeric(10, 2) not null default 0 check (preco_adicional >= 0),
  disponivel       boolean not null default true,
  ordem            integer not null default 0,
  unique (id, tenant_id),
  foreign key (grupo_id, tenant_id) references public.grupos_opcao (id, tenant_id) on delete cascade
);
create index opcoes_grupo_idx on public.opcoes (tenant_id, grupo_id, ordem);

-- -----------------------------------------------------------------------------
-- Pedidos
-- -----------------------------------------------------------------------------
create table public.pedidos (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  loja_id           uuid not null,
  canal             public.canal_pedido not null,
  canal_pedido_id   text,
  numero            integer,
  cliente_nome      text,
  cliente_telefone  text,
  tipo_entrega      public.tipo_entrega not null,
  endereco          jsonb,
  observacoes       text,
  subtotal          numeric(10, 2) not null check (subtotal >= 0),
  taxa_entrega      numeric(10, 2) not null default 0 check (taxa_entrega >= 0),
  total             numeric(10, 2) not null check (total >= 0),
  forma_pagamento   public.forma_pagamento not null,
  troco_para        numeric(10, 2) check (troco_para is null or troco_para >= 0),
  status            public.pedido_status not null default 'novo',
  anonimizado_em    timestamptz,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (loja_id, tenant_id) references public.lojas (id, tenant_id)
);
comment on column public.pedidos.canal is 'Origem do pedido. Fase 1 usa só "cardapio"; o campo existe para a Fase 4.';
comment on column public.pedidos.canal_pedido_id is 'Identificador do pedido no canal externo (iFood, 99Food). Fase 3.';
comment on column public.pedidos.numero is 'Número curto, reiniciado a cada dia por tenant. Atribuído por trigger.';

create index pedidos_tenant_criado_idx on public.pedidos (tenant_id, criado_em desc);
create index pedidos_tenant_status_idx on public.pedidos (tenant_id, status);

create trigger pedidos_atualizado_em
  before update on public.pedidos
  for each row execute function app.carimbar_atualizado_em();

create function app.numerar_pedido()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  fuso text;
  hoje date;
begin
  if new.numero is not null then
    return new;
  end if;

  -- Um pedido de cada vez por tenant, para o número não se repetir.
  perform pg_advisory_xact_lock(hashtext(new.tenant_id::text));

  select l.fuso_horario into fuso from public.lojas l where l.id = new.loja_id;
  fuso := coalesce(fuso, 'America/Sao_Paulo');
  hoje := (now() at time zone fuso)::date;

  select coalesce(max(p.numero), 0) + 1
    into new.numero
    from public.pedidos p
   where p.tenant_id = new.tenant_id
     and (p.criado_em at time zone fuso)::date = hoje;

  return new;
end;
$$;

create trigger pedidos_numero
  before insert on public.pedidos
  for each row execute function app.numerar_pedido();

create table public.itens_pedido (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants (id) on delete cascade,
  pedido_id       uuid not null,
  produto_id      uuid,
  nome            text not null,
  quantidade      integer not null check (quantidade between 1 and 99),
  preco_unitario  numeric(10, 2) not null check (preco_unitario >= 0),
  opcoes          jsonb not null default '[]'::jsonb,
  observacao      text,
  total           numeric(10, 2) not null check (total >= 0),
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id) on delete cascade,
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id) on delete set null
);
comment on table public.itens_pedido is 'Snapshot do item no momento do pedido. `produto_id` liga ao catálogo para a Fase 4.';
comment on column public.itens_pedido.opcoes is 'Lista de {grupo, nome, preco_adicional} escolhidas.';
create index itens_pedido_pedido_idx on public.itens_pedido (pedido_id);
create index itens_pedido_tenant_produto_idx on public.itens_pedido (tenant_id, produto_id);

-- Inserção atómica de pedido + itens. Só o servidor (service_role) pode chamar.
create function public.criar_pedido(p jsonb)
returns public.pedidos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  novo public.pedidos;
  item jsonb;
begin
  if jsonb_typeof(p -> 'itens') <> 'array' or jsonb_array_length(p -> 'itens') = 0 then
    raise exception 'pedido sem itens' using errcode = 'check_violation';
  end if;

  insert into public.pedidos (
    tenant_id, loja_id, canal, cliente_nome, cliente_telefone, tipo_entrega, endereco,
    observacoes, subtotal, taxa_entrega, total, forma_pagamento, troco_para
  ) values (
    (p ->> 'tenant_id')::uuid,
    (p ->> 'loja_id')::uuid,
    coalesce(p ->> 'canal', 'cardapio')::public.canal_pedido,
    p ->> 'cliente_nome',
    p ->> 'cliente_telefone',
    (p ->> 'tipo_entrega')::public.tipo_entrega,
    p -> 'endereco',
    p ->> 'observacoes',
    (p ->> 'subtotal')::numeric,
    coalesce((p ->> 'taxa_entrega')::numeric, 0),
    (p ->> 'total')::numeric,
    (p ->> 'forma_pagamento')::public.forma_pagamento,
    (p ->> 'troco_para')::numeric
  )
  returning * into novo;

  for item in select * from jsonb_array_elements(p -> 'itens') loop
    insert into public.itens_pedido (
      tenant_id, pedido_id, produto_id, nome, quantidade, preco_unitario, opcoes, observacao, total
    ) values (
      novo.tenant_id,
      novo.id,
      (item ->> 'produto_id')::uuid,
      item ->> 'nome',
      (item ->> 'quantidade')::integer,
      (item ->> 'preco_unitario')::numeric,
      coalesce(item -> 'opcoes', '[]'::jsonb),
      item ->> 'observacao',
      (item ->> 'total')::numeric
    );
  end loop;

  return novo;
end;
$$;

-- LGPD: apaga dados pessoais de pedidos antigos. Agendar com pg_cron quando
-- houver volume, por exemplo: select public.anonimizar_pedidos(180);
create function public.anonimizar_pedidos(dias integer)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  n integer;
begin
  update public.pedidos
     set cliente_nome = null,
         cliente_telefone = null,
         endereco = null,
         observacoes = null,
         anonimizado_em = now()
   where anonimizado_em is null
     and criado_em < now() - make_interval(days => dias);
  get diagnostics n = row_count;
  return n;
end;
$$;

-- -----------------------------------------------------------------------------
-- Pessoas — membros do tenant e operadores da plataforma
-- -----------------------------------------------------------------------------
create table public.membros (
  user_id    uuid not null references auth.users (id) on delete cascade,
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  papel      public.papel_membro not null default 'dono',
  criado_em  timestamptz not null default now(),
  primary key (user_id, tenant_id)
);
comment on table public.membros is 'Liga um utilizador autenticado a um tenant. O comerciante nunca é "usuário".';
create index membros_tenant_idx on public.membros (tenant_id);

create table public.operadores (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nome       text not null,
  criado_em  timestamptz not null default now()
);
comment on table public.operadores is 'Equipa interna. Usa o console (/admin) e pode entrar em qualquer painel.';

-- -----------------------------------------------------------------------------
-- Onboarding — o setup é o produto que se vende
-- -----------------------------------------------------------------------------
create table public.tenant_onboarding (
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  etapa         public.etapa_onboarding not null,
  concluida_em  timestamptz,
  nota          text,
  primary key (tenant_id, etapa)
);

-- -----------------------------------------------------------------------------
-- Fase 2 — insumos e fichas técnicas (sem ecrã na Fase 1)
-- -----------------------------------------------------------------------------
create table public.insumos (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants (id) on delete cascade,
  nome               text not null,
  unidade            text not null,
  quantidade_atual   numeric(12, 3) not null default 0,
  quantidade_minima  numeric(12, 3) not null default 0,
  custo_unitario     numeric(10, 4) not null default 0,
  unique (id, tenant_id)
);
create index insumos_tenant_idx on public.insumos (tenant_id);

create table public.fichas (
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  produto_id  uuid not null,
  insumo_id   uuid not null,
  quantidade  numeric(12, 3) not null check (quantidade > 0),
  primary key (produto_id, insumo_id),
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id) on delete cascade,
  foreign key (insumo_id, tenant_id) references public.insumos (id, tenant_id) on delete cascade
);
comment on table public.fichas is 'Quanto de cada insumo sai por produto vendido. Fase 2.';

insert into app.migracoes (nome) values ('0001_esquema.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0002_rls.sql
-- #############################################################################

-- =============================================================================
-- 0002 — Permissões e Row Level Security
--
-- Modelo:
--   anon           lê o que é público (catálogo de tenants não cancelados).
--   authenticated  membro do tenant ou operador: tudo nas tabelas do tenant.
--   service_role   só o servidor. Cria tenants, membros, pedidos.
--
-- As funções em `app` são `security invoker`: correm com as permissões de quem
-- pergunta e lêem `membros`/`operadores` sob as próprias políticas. Não há
-- `security definer` neste ficheiro, de propósito.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Funções de apoio
-- -----------------------------------------------------------------------------
create function app.tenants_do_utilizador()
returns setof uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select m.tenant_id
    from public.membros m
   where m.user_id = (select auth.uid())
$$;
comment on function app.tenants_do_utilizador() is 'Tenants a que o utilizador autenticado pertence.';

create function app.e_operador()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.operadores o where o.user_id = (select auth.uid())
  )
$$;

create function app.tenant_publico(t uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.tenants x where x.id = t and x.status <> 'cancelado'
  )
$$;
comment on function app.tenant_publico(uuid) is 'Suspensão não apaga a página: só "cancelado" desaparece.';

grant usage on schema app to anon, authenticated, service_role;
grant execute on function app.tenants_do_utilizador() to anon, authenticated, service_role;
grant execute on function app.e_operador() to anon, authenticated, service_role;
grant execute on function app.tenant_publico(uuid) to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Grants. Tabelas novas não são expostas por defeito: tudo o que a API vê
-- está aqui, explicitamente.
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

-- anon: leitura do catálogo público. Em `tenants` só as colunas públicas.
grant select (id, slug, nome_fantasia, telefone, whatsapp, logo_url, cor_marca, endereco, status)
  on public.tenants to anon;
grant select on public.lojas, public.categorias, public.produtos, public.grupos_opcao, public.opcoes to anon;

-- authenticated: o comerciante gere o seu tenant; o operador gere todos.
grant select on public.tenants to authenticated;
grant update (nome_fantasia, telefone, whatsapp, logo_url, cor_marca, endereco) on public.tenants to authenticated;
grant select, insert, update, delete on
  public.lojas, public.categorias, public.produtos, public.grupos_opcao, public.opcoes,
  public.pedidos, public.itens_pedido, public.tenant_onboarding, public.insumos, public.fichas
  to authenticated;
grant select on public.membros, public.operadores to authenticated;

-- service_role: tudo (ignora RLS por natureza).
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Funções chamadas pela API: só o servidor cria pedidos e anonimiza.
revoke execute on function public.criar_pedido(jsonb) from public, anon, authenticated;
revoke execute on function public.anonimizar_pedidos(integer) from public, anon, authenticated;
grant execute on function public.criar_pedido(jsonb) to service_role;
grant execute on function public.anonimizar_pedidos(integer) to service_role;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.tenants enable row level security;
alter table public.membros enable row level security;
alter table public.operadores enable row level security;

-- tenants: público lê tenants não cancelados; membros e operadores lêem e alteram.
create policy "tenants: público lê"
  on public.tenants for select
  to anon
  using (status <> 'cancelado');

create policy "tenants: membros e operadores lêem"
  on public.tenants for select
  to authenticated
  using (id in (select app.tenants_do_utilizador()) or (select app.e_operador()));

create policy "tenants: membros e operadores alteram"
  on public.tenants for update
  to authenticated
  using (id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
  with check (id in (select app.tenants_do_utilizador()) or (select app.e_operador()));

-- membros: cada um vê as suas ligações; operadores vêem todas.
create policy "membros: próprio ou operador"
  on public.membros for select
  to authenticated
  using (user_id = (select auth.uid()) or (select app.e_operador()));

-- operadores: cada operador vê a própria linha. (Não pode chamar e_operador aqui: recursão.)
create policy "operadores: próprio"
  on public.operadores for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Tabelas com tenant_id: uma política padrão, gerada em ciclo para não haver
-- divergência entre tabelas. Quem pertence ao tenant, ou é operador, faz tudo.
do $$
declare
  t text;
begin
  foreach t in array array[
    'lojas', 'categorias', 'produtos', 'grupos_opcao', 'opcoes',
    'pedidos', 'itens_pedido', 'tenant_onboarding', 'insumos', 'fichas'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy %I on public.%I
        for all to authenticated
        using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
        with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
    $p$, t || ': membros e operadores', t);
  end loop;
end;
$$;

-- Catálogo público: anon lê lojas, categorias, produtos e opções de tenants não cancelados.
do $$
declare
  t text;
begin
  foreach t in array array['lojas', 'categorias', 'produtos', 'grupos_opcao', 'opcoes'] loop
    execute format($p$
      create policy %I on public.%I
        for select to anon
        using ((select app.tenant_publico(tenant_id)))
    $p$, t || ': público lê', t);
  end loop;
end;
$$;

insert into app.migracoes (nome) values ('0002_rls.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0003_storage.sql
-- #############################################################################

-- =============================================================================
-- 0003 — Storage: bucket `fotos`
--
-- Leitura pública (as fotos aparecem na página do comerciante). Escrita só na
-- pasta do próprio tenant: `{tenant_id}/produtos/{produto_id}.webp`,
-- `{tenant_id}/logo.webp`. As fotos são redimensionadas no browser antes do
-- upload, por isso o limite é generoso mas não enorme.
--
-- Este ficheiro depende do esquema `storage` do Supabase e não corre nos
-- testes locais em PGlite.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 3145728, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- A primeira pasta do caminho tem de ser um tenant do utilizador (ou ele é operador).
create function app.pasta_do_tenant_permitida(nome_objeto text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select app.e_operador())
    or (
      (storage.foldername(nome_objeto))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and ((storage.foldername(nome_objeto))[1])::uuid in (select app.tenants_do_utilizador())
    )
$$;
grant execute on function app.pasta_do_tenant_permitida(text) to authenticated, service_role;

create policy "fotos: leitura pública"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fotos');

create policy "fotos: tenant envia"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos' and app.pasta_do_tenant_permitida(name));

create policy "fotos: tenant substitui"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fotos' and app.pasta_do_tenant_permitida(name))
  with check (bucket_id = 'fotos' and app.pasta_do_tenant_permitida(name));

create policy "fotos: tenant apaga"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos' and app.pasta_do_tenant_permitida(name));

insert into app.migracoes (nome) values ('0003_storage.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0004_realtime.sql
-- #############################################################################

-- =============================================================================
-- 0004 — Tempo real nos pedidos
--
-- O painel subscreve INSERT/UPDATE em `pedidos` filtrados por tenant_id. O
-- Realtime aplica as políticas RLS de `pedidos` a cada subscritor, por isso um
-- tenant nunca recebe pedidos de outro.
--
-- `replica identity full` é necessário para o filtro por coluna funcionar em
-- UPDATE. A publicação só existe no Supabase; em PGlite o bloco é ignorado.
-- =============================================================================

alter table public.pedidos replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.pedidos;
  end if;
end;
$$;

insert into app.migracoes (nome) values ('0004_realtime.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0005_cadeia_producao.sql
-- #############################################################################

-- =============================================================================
-- 0005 — Cadeia de produção, histórico e notas internas
--
-- Cada empresa (tenant) tem uma cadeia de produção: frentes (lançamento,
-- presença digital, canais, operação) com etapas. Cada etapa guarda o estado
-- do diagnóstico ("já tinha", "pendente", "em curso", "concluído"…), notas em
-- Markdown, um link e uma data prevista. Todas as mudanças ficam no histórico.
--
-- O catálogo de frentes e etapas vive no código (`src/lib/cadeia/modelo.ts`)
-- e é materializado por tenant nesta tabela. Etapas criadas à mão pela equipa
-- ficam marcadas como `personalizada`.
--
-- Substitui o checklist fixo `tenant_onboarding` da migração 0001: as linhas
-- existentes passam para a frente "lancamento".
--
-- Tudo aqui é interno: só operadores (e o servidor) lêem ou escrevem. O
-- comerciante nunca vê estas tabelas.
-- =============================================================================

create type public.cadeia_estado as enum (
  'nao_avaliado', 'ja_tinha', 'pendente', 'em_curso', 'concluido', 'nao_aplica'
);

create table public.cadeia_etapas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  frente         text not null check (frente ~ '^[a-z][a-z0-9_]{1,39}$'),
  chave          text not null check (chave ~ '^[a-z][a-z0-9_]{1,39}$'),
  titulo         text not null check (length(titulo) between 1 and 120),
  descricao      text,
  ordem          integer not null default 0,
  estado         public.cadeia_estado not null default 'nao_avaliado',
  notas          text,
  url            text check (url is null or url ~ '^https?://'),
  responsavel    text,
  prevista_em    date,
  concluida_em   timestamptz,
  personalizada  boolean not null default false,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  unique (tenant_id, frente, chave)
);
comment on table public.cadeia_etapas is 'Etapas da cadeia de produção de cada empresa. Interno à equipa.';
comment on column public.cadeia_etapas.notas is 'Markdown livre: acessos, decisões, o que falta.';
create index cadeia_etapas_tenant_idx on public.cadeia_etapas (tenant_id, frente, ordem);

create trigger cadeia_etapas_atualizado_em
  before update on public.cadeia_etapas
  for each row execute function app.carimbar_atualizado_em();

create table public.cadeia_registos (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  etapa_id    uuid not null references public.cadeia_etapas (id) on delete cascade,
  autor_id    uuid references auth.users (id) on delete set null,
  autor_nome  text,
  tipo        text not null check (tipo in ('estado', 'nota', 'criacao')),
  de          text,
  para        text,
  texto       text,
  criado_em   timestamptz not null default now()
);
comment on table public.cadeia_registos is 'Histórico: quem mudou o quê, quando, em cada etapa.';
create index cadeia_registos_tenant_idx on public.cadeia_registos (tenant_id, criado_em desc);
create index cadeia_registos_etapa_idx on public.cadeia_registos (etapa_id, criado_em desc);

create table public.notas_internas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  autor_id       uuid references auth.users (id) on delete set null,
  autor_nome     text,
  titulo         text not null check (length(titulo) between 1 and 120),
  conteudo       text not null default '',
  fixada         boolean not null default false,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
comment on table public.notas_internas is 'Dossiê da empresa em Markdown: briefing, acessos, reuniões. Interno à equipa.';
create index notas_internas_tenant_idx on public.notas_internas (tenant_id, fixada desc, atualizado_em desc);

create trigger notas_internas_atualizado_em
  before update on public.notas_internas
  for each row execute function app.carimbar_atualizado_em();

-- -----------------------------------------------------------------------------
-- Migração do checklist antigo para a frente "lancamento"
-- -----------------------------------------------------------------------------
insert into public.cadeia_etapas (tenant_id, frente, chave, titulo, ordem, estado, concluida_em)
select
  t.tenant_id,
  'lancamento',
  t.etapa::text,
  case t.etapa::text
    when 'cadastro' then 'Cadastro'
    when 'cardapio' then 'Cardápio carregado'
    when 'fotos'    then 'Fotos'
    when 'pagina'   then 'Página publicada'
    when 'google'   then 'Link no Google'
    when 'cobranca' then 'Cobrança ativa'
  end,
  case t.etapa::text
    when 'cadastro' then 1
    when 'cardapio' then 2
    when 'fotos'    then 3
    when 'pagina'   then 4
    when 'google'   then 5
    when 'cobranca' then 6
  end,
  case when t.concluida_em is not null then 'concluido'::public.cadeia_estado else 'pendente'::public.cadeia_estado end,
  t.concluida_em
from public.tenant_onboarding t;

drop table public.tenant_onboarding;
drop type public.etapa_onboarding;

-- -----------------------------------------------------------------------------
-- Permissões e RLS: só operadores
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.cadeia_etapas, public.cadeia_registos, public.notas_internas to authenticated;
grant all on public.cadeia_etapas, public.cadeia_registos, public.notas_internas to service_role;

do $$
declare
  t text;
begin
  foreach t in array array['cadeia_etapas', 'cadeia_registos', 'notas_internas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy %I on public.%I
        for all to authenticated
        using ((select app.e_operador()))
        with check ((select app.e_operador()))
    $p$, t || ': só operadores', t);
  end loop;
end;
$$;

insert into app.migracoes (nome) values ('0005_cadeia_producao.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0006_arquivos.sql
-- #############################################################################

-- =============================================================================
-- 0006 — Arquivos: a biblioteca viva de cada empresa
--
-- Fotos, logos, cardápios de papel, documentos: tudo o que a equipa recolhe
-- de uma empresa fica aqui, por pastas, visível a quem tem acesso ao console
-- em qualquer lugar. Os ficheiros vivem no bucket privado `arquivos` (migração
-- 0007); esta tabela guarda o índice: onde está, o que é, quem enviou.
--
-- Interno à equipa: só operadores lêem ou escrevem.
-- =============================================================================

create table public.arquivos (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  pasta       text not null default 'Geral' check (length(pasta) between 1 and 60),
  nome        text not null check (length(nome) between 1 and 200),
  caminho     text not null unique,
  tipo        text not null,
  tamanho     integer not null check (tamanho >= 0),
  autor_id    uuid references auth.users (id) on delete set null,
  autor_nome  text,
  criado_em   timestamptz not null default now()
);
comment on table public.arquivos is 'Índice dos ficheiros de cada empresa no bucket `arquivos`. Interno à equipa.';
comment on column public.arquivos.caminho is 'Caminho no bucket: {tenant_id}/{pasta}/{ficheiro}.';
create index arquivos_tenant_idx on public.arquivos (tenant_id, pasta, criado_em desc);

grant select, insert, update, delete on public.arquivos to authenticated;
grant all on public.arquivos to service_role;

alter table public.arquivos enable row level security;
create policy "arquivos: só operadores"
  on public.arquivos for all to authenticated
  using ((select app.e_operador()))
  with check ((select app.e_operador()));

insert into app.migracoes (nome) values ('0006_arquivos.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0007_arquivos_storage.sql
-- #############################################################################

-- =============================================================================
-- 0007 — Storage: bucket privado `arquivos`
--
-- Ao contrário de `fotos` (público, para a página do comerciante), este
-- bucket é privado: o console gera links assinados de curta duração para ver
-- e descarregar. Só operadores escrevem e lêem. Até 25 MB por ficheiro.
--
-- Depende do esquema `storage` do Supabase e não corre nos testes em PGlite.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('arquivos', 'arquivos', false, 26214400)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

create policy "arquivos: operadores lêem"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'arquivos' and (select app.e_operador()));

create policy "arquivos: operadores enviam"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'arquivos' and (select app.e_operador()));

create policy "arquivos: operadores substituem"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'arquivos' and (select app.e_operador()))
  with check (bucket_id = 'arquivos' and (select app.e_operador()));

create policy "arquivos: operadores apagam"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'arquivos' and (select app.e_operador()));

insert into app.migracoes (nome) values ('0007_arquivos_storage.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0008_modulos.sql
-- #############################################################################

-- =============================================================================
-- 0008 — Módulos por empresa
--
-- Cada empresa recebe só os módulos que usa: a equipa liga e desliga no
-- console, o painel mostra só os separadores dos módulos ligados. O catálogo
-- (nomes, dependências, maturidade) vive no código, em
-- `src/lib/modulos/catalogo.ts`; aqui fica só o que cada tenant tem.
--
-- Quem pode o quê:
--   operadores     lêem e alteram os módulos de todas as empresas;
--   membros        lêem os módulos do próprio tenant (para o painel);
--   anon           lê só se um módulo está ligado (a página pública precisa de
--                  saber se o cardápio está activo); nunca a configuração.
--
-- `configuracao` é lida pelos membros: nunca guardar segredos aqui.
-- =============================================================================

create table public.tenant_modulos (
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  modulo         text not null check (modulo ~ '^[a-z][a-z0-9_]{1,39}$'),
  ativo          boolean not null default true,
  configuracao   jsonb not null default '{}'::jsonb,
  ativado_em     timestamptz,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  primary key (tenant_id, modulo)
);
comment on table public.tenant_modulos is 'Módulos ligados em cada empresa. O catálogo está em src/lib/modulos/catalogo.ts.';
comment on column public.tenant_modulos.configuracao is 'Parâmetros não secretos do módulo. Os membros lêem esta coluna: nada de credenciais.';
comment on column public.tenant_modulos.ativado_em is 'Última vez que o módulo foi ligado.';

create trigger tenant_modulos_atualizado_em
  before update on public.tenant_modulos
  for each row execute function app.carimbar_atualizado_em();

-- Empresas existentes ficam com o que já tinham no painel. A mesma lista que
-- `modulosPadrao()` devolve no código.
insert into public.tenant_modulos (tenant_id, modulo, ativo, ativado_em)
select t.id, m.modulo, true, now()
  from public.tenants t
 cross join (values ('pedidos'), ('cardapio'), ('resumo')) as m (modulo)
on conflict (tenant_id, modulo) do nothing;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
grant select (tenant_id, modulo, ativo) on public.tenant_modulos to anon;
grant select, insert, update, delete on public.tenant_modulos to authenticated;
grant all on public.tenant_modulos to service_role;

alter table public.tenant_modulos enable row level security;

create policy "tenant_modulos: público lê"
  on public.tenant_modulos for select
  to anon
  using ((select app.tenant_publico(tenant_id)));

create policy "tenant_modulos: membros e operadores lêem"
  on public.tenant_modulos for select
  to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));

-- Ligar e desligar módulos é decisão comercial: só a equipa.
create policy "tenant_modulos: só operadores alteram"
  on public.tenant_modulos for insert
  to authenticated
  with check ((select app.e_operador()));

create policy "tenant_modulos: só operadores actualizam"
  on public.tenant_modulos for update
  to authenticated
  using ((select app.e_operador()))
  with check ((select app.e_operador()));

create policy "tenant_modulos: só operadores apagam"
  on public.tenant_modulos for delete
  to authenticated
  using ((select app.e_operador()));

insert into app.migracoes (nome) values ('0008_modulos.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0009_clientes.sql
-- #############################################################################

-- =============================================================================
-- 0009 — Clientes e fornecedores (módulo `clientes`)
--
-- Um cadastro único de pessoas por tenant, com papéis (cliente, fornecedor).
-- O pedido do cardápio cria ou actualiza o cliente pelo WhatsApp, por isso o
-- histórico começa no primeiro pedido, mesmo antes de o módulo ser ligado.
--
-- Regras:
--   • WhatsApp guardado só com dígitos e DDI; único por tenant entre pessoas
--     não anonimizadas (é a chave do cliente que chega pelo cardápio).
--   • CPF ou CNPJ (numérico ou alfanumérico) sem máscara, único por tenant
--     quando informado.
--   • LGPD: o comerciante é o controlador. O consentimento fica registado com
--     finalidade e data; anonimizar apaga os dados pessoais e mantém os
--     valores dos pedidos.
-- =============================================================================

create type public.tipo_pessoa as enum ('pf', 'pj');

create table public.pessoas (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants (id) on delete cascade,
  tipo            public.tipo_pessoa not null default 'pf',
  nome            text not null check (length(nome) between 1 and 120),
  nome_fantasia   text check (nome_fantasia is null or length(nome_fantasia) <= 120),
  documento       text check (documento is null or documento ~ '^([0-9]{11}|[0-9A-Z]{12}[0-9]{2})$'),
  whatsapp        text check (whatsapp is null or whatsapp ~ '^[0-9]{12,13}$'),
  email           text check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  nascimento      date,
  observacoes     text check (observacoes is null or length(observacoes) <= 2000),
  e_cliente       boolean not null default true,
  e_fornecedor    boolean not null default false,
  etiquetas       text[] not null default '{}',
  origem          text not null default 'manual' check (origem in ('manual', 'pedido', 'importacao')),
  anonimizado_em  timestamptz,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  unique (id, tenant_id),
  check (e_cliente or e_fornecedor),
  check (documento is null or (tipo = 'pf') = (length(documento) = 11))
);
comment on table public.pessoas is 'Cadastro único de clientes e fornecedores do tenant.';
comment on column public.pessoas.whatsapp is 'Só dígitos com DDI. Chave do cliente que chega pelo cardápio.';
comment on column public.pessoas.documento is 'CPF (11 dígitos) ou CNPJ (14, numérico ou alfanumérico), sem máscara, validado na aplicação.';

create unique index pessoas_whatsapp_unico
  on public.pessoas (tenant_id, whatsapp)
  where whatsapp is not null and anonimizado_em is null;
create unique index pessoas_documento_unico
  on public.pessoas (tenant_id, documento)
  where documento is not null and anonimizado_em is null;
create index pessoas_tenant_nome_idx on public.pessoas (tenant_id, lower(nome));

create trigger pessoas_atualizado_em
  before update on public.pessoas
  for each row execute function app.carimbar_atualizado_em();

create table public.pessoa_enderecos (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  pessoa_id    uuid not null,
  rotulo       text not null default 'Principal' check (length(rotulo) between 1 and 40),
  cep          text check (cep is null or cep ~ '^[0-9]{8}$'),
  rua          text,
  numero       text,
  complemento  text,
  bairro       text,
  cidade       text,
  uf           text check (uf is null or uf ~ '^[A-Z]{2}$'),
  referencia   text,
  principal    boolean not null default false,
  criado_em    timestamptz not null default now(),
  foreign key (pessoa_id, tenant_id) references public.pessoas (id, tenant_id) on delete cascade
);
create index pessoa_enderecos_pessoa_idx on public.pessoa_enderecos (tenant_id, pessoa_id);

create table public.consentimentos (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  pessoa_id     uuid not null,
  finalidade    text not null check (finalidade in ('pedidos', 'marketing', 'aniversario')),
  concedido     boolean not null,
  origem        text not null check (origem in ('cardapio', 'balcao', 'painel', 'importacao')),
  registado_em  timestamptz not null default now(),
  foreign key (pessoa_id, tenant_id) references public.pessoas (id, tenant_id) on delete cascade
);
comment on table public.consentimentos is 'LGPD: histórico de consentimentos por finalidade. O último registo vale.';
create index consentimentos_pessoa_idx on public.consentimentos (tenant_id, pessoa_id, finalidade, registado_em desc);

-- Pedido ligado ao cliente.
alter table public.pedidos add column cliente_id uuid;
alter table public.pedidos
  add constraint pedidos_cliente_tenant_fkey
  foreign key (cliente_id, tenant_id) references public.pessoas (id, tenant_id) on delete set null (cliente_id);
create index pedidos_tenant_cliente_idx on public.pedidos (tenant_id, cliente_id, criado_em desc);

-- -----------------------------------------------------------------------------
-- O pedido do cardápio cria ou actualiza o cliente pelo WhatsApp.
-- -----------------------------------------------------------------------------
create function app.cliente_do_pedido()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  numero text;
begin
  if new.cliente_id is not null or new.cliente_telefone is null then
    return new;
  end if;
  numero := regexp_replace(new.cliente_telefone, '\D', '', 'g');
  if length(numero) in (10, 11) then
    numero := '55' || numero;
  end if;
  if numero !~ '^[0-9]{12,13}$' then
    return new;
  end if;

  insert into public.pessoas as p (tenant_id, nome, whatsapp, origem)
  values (new.tenant_id, coalesce(nullif(trim(new.cliente_nome), ''), 'Cliente ' || right(numero, 4)), numero, 'pedido')
  on conflict (tenant_id, whatsapp) where whatsapp is not null and anonimizado_em is null
  do update set e_cliente = true
  returning p.id into new.cliente_id;

  return new;
end;
$$;

create trigger pedidos_cliente
  before insert on public.pedidos
  for each row execute function app.cliente_do_pedido();

-- LGPD: anonimizar uma pessoa a pedido. Mantém pedidos e valores, apaga o pessoal.
create function public.anonimizar_pessoa(p_tenant uuid, p_pessoa uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.pessoas
     set nome = 'Cliente anonimizado', nome_fantasia = null, documento = null, whatsapp = null,
         email = null, nascimento = null, observacoes = null, etiquetas = '{}', anonimizado_em = now()
   where tenant_id = p_tenant and id = p_pessoa;
  delete from public.pessoa_enderecos where tenant_id = p_tenant and pessoa_id = p_pessoa;
  update public.pedidos
     set cliente_nome = null, cliente_telefone = null, endereco = null, anonimizado_em = coalesce(anonimizado_em, now())
   where tenant_id = p_tenant and cliente_id = p_pessoa;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS: o padrão das tabelas do tenant.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.pessoas, public.pessoa_enderecos, public.consentimentos to authenticated;
grant all on public.pessoas, public.pessoa_enderecos, public.consentimentos to service_role;
grant execute on function public.anonimizar_pessoa(uuid, uuid) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['pessoas', 'pessoa_enderecos', 'consentimentos'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy %I on public.%I
        for all to authenticated
        using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
        with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
    $p$, t || ': membros e operadores', t);
  end loop;
end;
$$;

-- Clientes que já pediram pelo cardápio passam a existir no cadastro.
insert into public.pessoas (tenant_id, nome, whatsapp, origem)
select distinct on (p.tenant_id, '55' || p.cliente_telefone)
       p.tenant_id, coalesce(nullif(trim(p.cliente_nome), ''), 'Cliente'), '55' || p.cliente_telefone, 'pedido'
  from public.pedidos p
 where p.cliente_telefone ~ '^[0-9]{10,11}$' and p.anonimizado_em is null
 order by p.tenant_id, '55' || p.cliente_telefone, p.criado_em desc
on conflict do nothing;

update public.pedidos p
   set cliente_id = x.id
  from public.pessoas x
 where x.tenant_id = p.tenant_id and x.whatsapp = '55' || p.cliente_telefone and p.cliente_id is null;

insert into app.migracoes (nome) values ('0009_clientes.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0010_financeiro.sql
-- #############################################################################

-- =============================================================================
-- 0010 — Financeiro simples (módulo `financeiro`)
--
-- Contas a receber e a pagar em parcelas; cada pagamento é uma baixa. Regras:
--   • O estado da parcela (aberta, parcial, paga, cancelada) é calculado das
--     baixas por gatilho; ninguém o escolhe à mão (sem grant de escrita).
--   • Corrigir é estornar, nunca apagar: baixas e títulos não têm delete.
--   • Competência (data do fato) e caixa (data da baixa) ficam separadas.
--   • Categorias com linha de resultado formam a DRE gerencial do mês.
-- =============================================================================

create type public.tipo_titulo as enum ('receber', 'pagar');
create type public.estado_parcela as enum ('aberta', 'parcial', 'paga', 'cancelada');
create type public.tipo_carteira as enum ('caixa', 'banco', 'pix', 'cartao', 'outra');
create type public.linha_resultado as enum (
  'receita_vendas', 'outras_receitas', 'impostos', 'custo_mercadoria',
  'despesa_variavel', 'pessoal', 'despesa_fixa', 'outras_despesas'
);

create table public.carteiras (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  nome           text not null check (length(nome) between 1 and 60),
  tipo           public.tipo_carteira not null,
  saldo_inicial  numeric(12, 2) not null default 0,
  ativa          boolean not null default true,
  criado_em      timestamptz not null default now(),
  unique (id, tenant_id),
  unique (tenant_id, nome)
);
comment on table public.carteiras is 'Onde o dinheiro está: caixa da loja, banco, Pix, cartão a receber.';

create table public.categorias_financeiras (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  nome       text not null check (length(nome) between 1 and 60),
  tipo       public.tipo_titulo not null,
  linha      public.linha_resultado not null,
  ativa      boolean not null default true,
  unique (id, tenant_id),
  unique (tenant_id, tipo, nome),
  check ((tipo = 'receber') = (linha in ('receita_vendas', 'outras_receitas')))
);
comment on table public.categorias_financeiras is 'Receitas (tipo receber) e despesas (tipo pagar), cada uma numa linha da DRE.';

create table public.titulos (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  tipo          public.tipo_titulo not null,
  descricao     text not null check (length(descricao) between 1 and 120),
  pessoa_id     uuid,
  categoria_id  uuid not null,
  origem        text not null default 'manual' check (origem in ('manual', 'pedido', 'compra', 'recorrente')),
  origem_id     uuid,
  competencia   date not null,
  documento     text check (documento is null or length(documento) <= 60),
  observacoes   text check (observacoes is null or length(observacoes) <= 1000),
  cancelado_em  timestamptz,
  criado_em     timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (pessoa_id, tenant_id) references public.pessoas (id, tenant_id) on delete set null (pessoa_id),
  foreign key (categoria_id, tenant_id) references public.categorias_financeiras (id, tenant_id)
);
comment on table public.titulos is 'Uma conta a receber ou a pagar; o valor está nas parcelas.';
create unique index titulos_origem_unica on public.titulos (tenant_id, origem, origem_id) where origem_id is not null;
create index titulos_tenant_idx on public.titulos (tenant_id, tipo, competencia desc);

create table public.parcelas (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  titulo_id   uuid not null,
  numero      integer not null check (numero between 1 and 360),
  vencimento  date not null,
  valor       numeric(12, 2) not null check (valor > 0),
  valor_pago  numeric(12, 2) not null default 0 check (valor_pago >= 0),
  estado      public.estado_parcela not null default 'aberta',
  pago_em     date,
  unique (id, tenant_id),
  unique (titulo_id, numero),
  foreign key (titulo_id, tenant_id) references public.titulos (id, tenant_id) on delete cascade
);
comment on column public.parcelas.estado is 'Calculado pelas baixas (gatilho). Vencida = aberta/parcial com vencimento passado, calculado na leitura.';
create index parcelas_vencimento_idx on public.parcelas (tenant_id, estado, vencimento);

create table public.baixas (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  parcela_id   uuid not null,
  carteira_id  uuid not null,
  data         date not null,
  valor        numeric(12, 2) not null check (valor > 0),
  juros        numeric(12, 2) not null default 0 check (juros >= 0),
  multa        numeric(12, 2) not null default 0 check (multa >= 0),
  desconto     numeric(12, 2) not null default 0 check (desconto >= 0),
  forma        text not null default 'dinheiro' check (forma in ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'boleto', 'transferencia', 'outro')),
  observacao   text check (observacao is null or length(observacao) <= 300),
  estornada_em timestamptz,
  criado_em    timestamptz not null default now(),
  foreign key (parcela_id, tenant_id) references public.parcelas (id, tenant_id) on delete cascade,
  foreign key (carteira_id, tenant_id) references public.carteiras (id, tenant_id)
);
comment on column public.baixas.valor is 'Quanto da parcela foi quitado (principal). O que entrou ou saiu da carteira é valor + juros + multa - desconto.';
create index baixas_parcela_idx on public.baixas (tenant_id, parcela_id);
create index baixas_data_idx on public.baixas (tenant_id, data desc);

-- -----------------------------------------------------------------------------
-- Estado da parcela a partir das baixas não estornadas.
-- -----------------------------------------------------------------------------
create function app.recalcular_parcela(p_parcela uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  total numeric(12, 2);
  ultima date;
  p public.parcelas;
  cancelado boolean;
begin
  select * into p from public.parcelas where id = p_parcela;
  if not found then return; end if;
  select t.cancelado_em is not null into cancelado from public.titulos t where t.id = p.titulo_id;
  select coalesce(sum(b.valor), 0), max(b.data) into total, ultima
    from public.baixas b where b.parcela_id = p_parcela and b.estornada_em is null;

  update public.parcelas
     set valor_pago = total,
         pago_em = case when total >= p.valor then ultima end,
         estado = case
           when cancelado then 'cancelada'
           when total >= p.valor then 'paga'
           when total > 0 then 'parcial'
           else 'aberta'
         end::public.estado_parcela
   where id = p_parcela;
end;
$$;
comment on function app.recalcular_parcela(uuid) is 'Security definer só para escrever as colunas calculadas, que os utilizadores não podem alterar.';

create function app.baixa_alterada()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform app.recalcular_parcela(coalesce(new.parcela_id, old.parcela_id));
  return null;
end;
$$;

-- Parcela nasce sempre aberta: o estado só muda pelas baixas.
create function app.parcela_nova()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.valor_pago := 0;
  new.pago_em := null;
  new.estado := 'aberta';
  return new;
end;
$$;

create trigger parcelas_nova
  before insert on public.parcelas
  for each row execute function app.parcela_nova();

create trigger baixas_recalcular
  after insert or update on public.baixas
  for each row execute function app.baixa_alterada();

-- Uma baixa não pode quitar mais do que falta na parcela.
create function app.validar_baixa()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  p public.parcelas;
  outras numeric(12, 2);
begin
  if new.estornada_em is not null then return new; end if;
  select * into p from public.parcelas where id = new.parcela_id;
  if p.estado = 'cancelada' then
    raise exception 'parcela cancelada não recebe baixas' using errcode = 'check_violation';
  end if;
  select coalesce(sum(valor), 0) into outras from public.baixas
   where parcela_id = new.parcela_id and estornada_em is null and id <> new.id;
  if outras + new.valor > p.valor then
    raise exception 'a baixa passa do saldo da parcela (saldo %)', p.valor - outras using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger baixas_validar
  before insert on public.baixas
  for each row execute function app.validar_baixa();

-- Só o estorno muda uma baixa, e uma vez.
create function app.so_estorno()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.estornada_em is not null then
    raise exception 'baixa já estornada' using errcode = 'check_violation';
  end if;
  if (to_jsonb(new) - 'estornada_em') <> (to_jsonb(old) - 'estornada_em') or new.estornada_em is null then
    raise exception 'uma baixa só pode ser estornada' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger baixas_so_estorno
  before update on public.baixas
  for each row execute function app.so_estorno();

-- Cancelar o título cancela as parcelas em aberto (as pagas ficam como estão).
create function app.titulo_cancelado()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  p uuid;
begin
  if new.cancelado_em is not null and old.cancelado_em is null then
    for p in select id from public.parcelas where titulo_id = new.id loop
      perform app.recalcular_parcela(p);
    end loop;
  end if;
  return new;
end;
$$;

create trigger titulos_cancelar
  after update of cancelado_em on public.titulos
  for each row execute function app.titulo_cancelado();

-- -----------------------------------------------------------------------------
-- Carteiras e categorias de partida (idempotente).
-- -----------------------------------------------------------------------------
create function public.financeiro_padrao(p_tenant uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.carteiras (tenant_id, nome, tipo) values
    (p_tenant, 'Caixa da loja', 'caixa'),
    (p_tenant, 'Pix', 'pix'),
    (p_tenant, 'Cartão a receber', 'cartao'),
    (p_tenant, 'Banco', 'banco')
  on conflict (tenant_id, nome) do nothing;

  insert into public.categorias_financeiras (tenant_id, nome, tipo, linha) values
    (p_tenant, 'Vendas', 'receber', 'receita_vendas'),
    (p_tenant, 'Outras receitas', 'receber', 'outras_receitas'),
    (p_tenant, 'Impostos sobre vendas', 'pagar', 'impostos'),
    (p_tenant, 'Mercadorias e insumos', 'pagar', 'custo_mercadoria'),
    (p_tenant, 'Embalagens', 'pagar', 'custo_mercadoria'),
    (p_tenant, 'Taxas de cartão e apps', 'pagar', 'despesa_variavel'),
    (p_tenant, 'Entregas', 'pagar', 'despesa_variavel'),
    (p_tenant, 'Marketing', 'pagar', 'despesa_variavel'),
    (p_tenant, 'Salários e encargos', 'pagar', 'pessoal'),
    (p_tenant, 'Pró-labore', 'pagar', 'pessoal'),
    (p_tenant, 'Aluguel', 'pagar', 'despesa_fixa'),
    (p_tenant, 'Energia e água', 'pagar', 'despesa_fixa'),
    (p_tenant, 'Internet e telefone', 'pagar', 'despesa_fixa'),
    (p_tenant, 'Contador e sistemas', 'pagar', 'despesa_fixa'),
    (p_tenant, 'Manutenção', 'pagar', 'outras_despesas'),
    (p_tenant, 'Outras despesas', 'pagar', 'outras_despesas')
  on conflict (tenant_id, tipo, nome) do nothing;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
grant select, insert, update on public.carteiras, public.categorias_financeiras to authenticated;
grant select, insert on public.titulos, public.parcelas, public.baixas to authenticated;
grant update (descricao, pessoa_id, categoria_id, competencia, documento, observacoes, cancelado_em) on public.titulos to authenticated;
grant update (vencimento) on public.parcelas to authenticated;
grant update (estornada_em) on public.baixas to authenticated;
grant all on public.carteiras, public.categorias_financeiras, public.titulos, public.parcelas, public.baixas to service_role;
grant execute on function public.financeiro_padrao(uuid) to authenticated, service_role;
revoke execute on function app.recalcular_parcela(uuid) from public, anon;
grant execute on function app.recalcular_parcela(uuid) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['carteiras', 'categorias_financeiras', 'titulos', 'parcelas', 'baixas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy %I on public.%I
        for all to authenticated
        using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
        with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
    $p$, t || ': membros e operadores', t);
  end loop;
end;
$$;

insert into app.migracoes (nome) values ('0010_financeiro.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0011_cnpj_alfanumerico.sql
-- #############################################################################

-- =============================================================================
-- 0011 — CNPJ alfanumérico
--
-- Desde julho de 2026 a Receita Federal emite CNPJ com letras: 12 posições
-- alfanuméricas e 2 dígitos verificadores numéricos (ex.: 12ABC34501DE35).
-- O cadastro de empresas recusava-os. Os dígitos verificadores são conferidos
-- na aplicação (src/lib/dominio/documento.ts).
-- =============================================================================

alter table public.tenants drop constraint if exists tenants_cnpj_check;
alter table public.tenants
  add constraint tenants_cnpj_check check (cnpj is null or cnpj ~ '^[0-9A-Z]{12}[0-9]{2}$');
comment on column public.tenants.cnpj is 'CNPJ sem máscara, numérico ou alfanumérico (maiúsculas).';

insert into app.migracoes (nome) values ('0011_cnpj_alfanumerico.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0012_caixa_pdv.sql
-- #############################################################################

-- =============================================================================
-- 0012 — Caixa e PDV (módulos `caixa` e `pdv`)
--
-- A venda do balcão é um pedido com canal `balcao`, já concluído, com um ou
-- mais pagamentos. Só se vende com o caixa da loja aberto. O caixa guarda cada
-- movimento (venda, suprimento, sangria, estorno) e fecha às cegas: o operador
-- conta por forma de pagamento sem ver o esperado; a diferença fica registada
-- e nunca some.
-- =============================================================================

-- Catálogo: código de barras e venda por peso.
alter table public.produtos add column codigo_barras text check (codigo_barras is null or codigo_barras ~ '^[0-9A-Za-z-]{3,30}$');
alter table public.produtos add column vendido_por_peso boolean not null default false;
create unique index produtos_codigo_barras_unico on public.produtos (tenant_id, codigo_barras) where codigo_barras is not null;

-- Pedidos: quantidades fraccionadas (quilos), desconto e motivo de cancelamento.
alter table public.itens_pedido drop constraint if exists itens_pedido_quantidade_check;
alter table public.itens_pedido alter column quantidade type numeric(10, 3);
alter table public.itens_pedido add constraint itens_pedido_quantidade_check check (quantidade > 0 and quantidade <= 9999);
alter table public.itens_pedido add column desconto numeric(10, 2) not null default 0 check (desconto >= 0);
alter table public.pedidos add column desconto numeric(10, 2) not null default 0 check (desconto >= 0);
alter table public.pedidos add column cancelado_motivo text check (cancelado_motivo is null or length(cancelado_motivo) <= 200);
alter table public.pedidos add column caixa_sessao_id uuid;

create type public.forma_recebimento as enum ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'outro');
create type public.estado_caixa as enum ('aberta', 'fechada', 'conferida');
create type public.tipo_movimento_caixa as enum ('venda', 'suprimento', 'sangria', 'estorno');

create table public.caixa_sessoes (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants (id) on delete cascade,
  loja_id          uuid not null,
  operador_id      uuid references auth.users (id) on delete set null,
  operador_nome    text not null,
  fundo_troco      numeric(12, 2) not null default 0 check (fundo_troco >= 0),
  estado           public.estado_caixa not null default 'aberta',
  aberta_em        timestamptz not null default now(),
  fechada_em       timestamptz,
  justificativa    text check (justificativa is null or length(justificativa) <= 500),
  conferida_por    text,
  conferida_em     timestamptz,
  unique (id, tenant_id),
  foreign key (loja_id, tenant_id) references public.lojas (id, tenant_id)
);
comment on table public.caixa_sessoes is 'Uma abertura de caixa: do fundo de troco ao fechamento cego.';
create unique index caixa_uma_aberta_por_loja on public.caixa_sessoes (tenant_id, loja_id) where estado = 'aberta';
create index caixa_sessoes_tenant_idx on public.caixa_sessoes (tenant_id, aberta_em desc);

alter table public.pedidos
  add constraint pedidos_caixa_sessao_fkey foreign key (caixa_sessao_id, tenant_id)
  references public.caixa_sessoes (id, tenant_id);

create table public.caixa_movimentos (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  sessao_id  uuid not null,
  tipo       public.tipo_movimento_caixa not null,
  forma      public.forma_recebimento not null default 'dinheiro',
  valor      numeric(12, 2) not null check (valor > 0),
  motivo     text check (motivo is null or length(motivo) <= 200),
  pedido_id  uuid,
  autor_nome text,
  criado_em  timestamptz not null default now(),
  foreign key (sessao_id, tenant_id) references public.caixa_sessoes (id, tenant_id) on delete cascade,
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id),
  check (tipo not in ('suprimento', 'sangria') or (forma = 'dinheiro' and motivo is not null))
);
comment on column public.caixa_movimentos.valor is 'Sempre positivo; o tipo diz se entra (venda, suprimento) ou sai (sangria, estorno).';
create index caixa_movimentos_sessao_idx on public.caixa_movimentos (tenant_id, sessao_id, criado_em);

create table public.caixa_conferencias (
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  sessao_id  uuid not null,
  forma      public.forma_recebimento not null,
  esperado   numeric(12, 2) not null,
  informado  numeric(12, 2) not null check (informado >= 0),
  diferenca  numeric(12, 2) generated always as (informado - esperado) stored,
  primary key (sessao_id, forma),
  foreign key (sessao_id, tenant_id) references public.caixa_sessoes (id, tenant_id) on delete cascade
);
comment on table public.caixa_conferencias is 'Fechamento cego: o contado por forma de pagamento contra o esperado.';

create table public.pagamentos_pedido (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  pedido_id  uuid not null,
  forma      public.forma_recebimento not null,
  valor      numeric(12, 2) not null check (valor > 0),
  troco      numeric(12, 2) not null default 0 check (troco >= 0),
  criado_em  timestamptz not null default now(),
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id) on delete cascade,
  check (troco = 0 or forma = 'dinheiro')
);
comment on column public.pagamentos_pedido.valor is 'Valor entregue pelo cliente nesta forma; o troco só existe em dinheiro.';

-- O fecho do caixa lança as vendas no financeiro (uma conta por sessão).
alter table public.titulos drop constraint if exists titulos_origem_check;
alter table public.titulos
  add constraint titulos_origem_check check (origem in ('manual', 'pedido', 'compra', 'recorrente', 'caixa'));

-- -----------------------------------------------------------------------------
-- Venda de balcão atómica. Corre com as permissões de quem vende (membro do
-- tenant, sob RLS). Os preços chegam já recalculados pelo servidor a partir do
-- catálogo; aqui confere-se a soma dos pagamentos e o caixa aberto.
-- -----------------------------------------------------------------------------
create function public.registar_venda_balcao(p jsonb)
returns public.pedidos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sessao public.caixa_sessoes;
  novo public.pedidos;
  item jsonb;
  pag jsonb;
  pago numeric(12, 2) := 0;
  troco numeric(12, 2) := 0;
  forma_principal text;
begin
  select * into sessao from public.caixa_sessoes
   where tenant_id = (p ->> 'tenant_id')::uuid and loja_id = (p ->> 'loja_id')::uuid and estado = 'aberta';
  if not found then
    raise exception 'abra o caixa antes de vender' using errcode = 'check_violation';
  end if;
  if jsonb_typeof(p -> 'itens') <> 'array' or jsonb_array_length(p -> 'itens') = 0 then
    raise exception 'venda sem itens' using errcode = 'check_violation';
  end if;
  if jsonb_typeof(p -> 'pagamentos') <> 'array' or jsonb_array_length(p -> 'pagamentos') = 0 then
    raise exception 'venda sem pagamento' using errcode = 'check_violation';
  end if;

  for pag in select * from jsonb_array_elements(p -> 'pagamentos') loop
    pago := pago + (pag ->> 'valor')::numeric;
    troco := troco + coalesce((pag ->> 'troco')::numeric, 0);
  end loop;
  if pago - troco <> (p ->> 'total')::numeric then
    raise exception 'pagamentos (%) não fecham com o total (%)', pago - troco, p ->> 'total' using errcode = 'check_violation';
  end if;

  select e ->> 'forma' into forma_principal
    from jsonb_array_elements(p -> 'pagamentos') as e
   order by (e ->> 'valor')::numeric desc limit 1;

  insert into public.pedidos (
    tenant_id, loja_id, canal, cliente_id, cliente_nome, cliente_telefone, tipo_entrega, observacoes,
    subtotal, desconto, taxa_entrega, total, forma_pagamento, troco_para, status, caixa_sessao_id
  ) values (
    sessao.tenant_id, sessao.loja_id, 'balcao',
    (p ->> 'cliente_id')::uuid, p ->> 'cliente_nome', p ->> 'cliente_telefone', 'retirada', p ->> 'observacoes',
    (p ->> 'subtotal')::numeric, coalesce((p ->> 'desconto')::numeric, 0), 0, (p ->> 'total')::numeric,
    case when forma_principal in ('cartao_debito', 'cartao_credito') then 'cartao'
         when forma_principal = 'pix' then 'pix' else 'dinheiro' end::public.forma_pagamento,
    null, 'concluido', sessao.id
  )
  returning * into novo;

  for item in select * from jsonb_array_elements(p -> 'itens') loop
    insert into public.itens_pedido (tenant_id, pedido_id, produto_id, nome, quantidade, preco_unitario, desconto, opcoes, observacao, total)
    values (
      novo.tenant_id, novo.id, (item ->> 'produto_id')::uuid, item ->> 'nome',
      (item ->> 'quantidade')::numeric, (item ->> 'preco_unitario')::numeric,
      coalesce((item ->> 'desconto')::numeric, 0), coalesce(item -> 'opcoes', '[]'::jsonb),
      item ->> 'observacao', (item ->> 'total')::numeric
    );
  end loop;

  for pag in select * from jsonb_array_elements(p -> 'pagamentos') loop
    insert into public.pagamentos_pedido (tenant_id, pedido_id, forma, valor, troco)
    values (novo.tenant_id, novo.id, (pag ->> 'forma')::public.forma_recebimento, (pag ->> 'valor')::numeric, coalesce((pag ->> 'troco')::numeric, 0));
    -- No caixa entra o que fica: o entregue menos o troco.
    if (pag ->> 'valor')::numeric - coalesce((pag ->> 'troco')::numeric, 0) > 0 then
      insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor, pedido_id, autor_nome)
      values (novo.tenant_id, sessao.id, 'venda', (pag ->> 'forma')::public.forma_recebimento,
              (pag ->> 'valor')::numeric - coalesce((pag ->> 'troco')::numeric, 0), novo.id, p ->> 'autor_nome');
    end if;
  end loop;

  return novo;
end;
$$;

-- Cancelar uma venda de balcão: estorna no caixa (se ainda aberto) e guarda o motivo.
create function public.cancelar_venda_balcao(p_tenant uuid, p_pedido uuid, p_motivo text, p_autor text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  ped public.pedidos;
  sessao public.caixa_sessoes;
  mov record;
begin
  if coalesce(trim(p_motivo), '') = '' then
    raise exception 'informe o motivo do cancelamento' using errcode = 'check_violation';
  end if;
  select * into ped from public.pedidos where tenant_id = p_tenant and id = p_pedido and canal = 'balcao';
  if not found then raise exception 'venda não encontrada' using errcode = 'no_data_found'; end if;
  if ped.status = 'cancelado' then raise exception 'venda já cancelada' using errcode = 'check_violation'; end if;
  select * into sessao from public.caixa_sessoes where id = ped.caixa_sessao_id;
  if sessao.estado <> 'aberta' then
    raise exception 'o caixa desta venda já foi fechado' using errcode = 'check_violation';
  end if;

  update public.pedidos set status = 'cancelado', cancelado_motivo = p_motivo where id = p_pedido;
  for mov in select forma, sum(valor) as valor from public.caixa_movimentos
              where pedido_id = p_pedido and tipo = 'venda' group by forma loop
    insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor, motivo, pedido_id, autor_nome)
    values (p_tenant, sessao.id, 'estorno', mov.forma, mov.valor, p_motivo, p_pedido, p_autor);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
grant select, insert on public.caixa_sessoes, public.caixa_movimentos, public.caixa_conferencias, public.pagamentos_pedido to authenticated;
grant update (estado, fechada_em, justificativa, conferida_por, conferida_em) on public.caixa_sessoes to authenticated;
grant all on public.caixa_sessoes, public.caixa_movimentos, public.caixa_conferencias, public.pagamentos_pedido to service_role;
grant execute on function public.registar_venda_balcao(jsonb) to authenticated, service_role;
grant execute on function public.cancelar_venda_balcao(uuid, uuid, text, text) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['caixa_sessoes', 'caixa_movimentos', 'caixa_conferencias', 'pagamentos_pedido'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy %I on public.%I
        for all to authenticated
        using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
        with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
    $p$, t || ': membros e operadores', t);
  end loop;
end;
$$;

-- Movimentos só entram com o caixa aberto, e uma sessão fechada não volta atrás.
create function app.caixa_aberto()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from public.caixa_sessoes s where s.id = new.sessao_id and s.estado = 'aberta') then
    raise exception 'o caixa está fechado' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger caixa_movimentos_aberto
  before insert on public.caixa_movimentos
  for each row execute function app.caixa_aberto();

create function app.caixa_transicao()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (
    (old.estado = 'aberta' and new.estado = 'fechada') or
    (old.estado = 'fechada' and new.estado = 'conferida') or
    (old.estado = new.estado)
  ) then
    raise exception 'o caixa não pode passar de % para %', old.estado, new.estado using errcode = 'check_violation';
  end if;
  if old.estado <> 'aberta' and new.justificativa is distinct from old.justificativa then
    raise exception 'a justificativa de um caixa fechado não muda' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger caixa_sessoes_transicao
  before update on public.caixa_sessoes
  for each row execute function app.caixa_transicao();

insert into app.migracoes (nome) values ('0012_caixa_pdv.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0013_cozinha_comandas.sql
-- #############################################################################

-- =============================================================================
-- 0013 — Cozinha (módulo `cozinha`) e mesas/comandas (módulo `comandas`)
--
-- Cozinha: cada categoria pode ir para uma estação (cozinha, bar, chapa). Os
-- itens dessas categorias entram na tela da estação, de qualquer canal, com
-- estado de preparo próprio. Quando todos os itens de preparo de um pedido
-- ficam prontos, o pedido passa a `pronto`.
--
-- Comandas: a comanda é um pedido do canal `mesa` aberto na hora; os itens
-- entram aos poucos (e vão logo para a cozinha); o total recalcula-se sozinho;
-- fecha no caixa aberto, com taxa de serviço opcional e pagamento dividido.
-- Item já em preparo não se apaga: cancela-se com motivo.
-- =============================================================================

alter type public.canal_pedido add value if not exists 'mesa';

create type public.estado_preparo as enum ('aguardando', 'em_preparo', 'pronto', 'entregue', 'cancelado');
create type public.estado_comanda as enum ('aberta', 'conta', 'fechada', 'cancelada');

-- -----------------------------------------------------------------------------
-- Estações de preparo
-- -----------------------------------------------------------------------------
create table public.estacoes (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  nome       text not null check (length(nome) between 1 and 40),
  ordem      integer not null default 0,
  alerta_min integer not null default 15 check (alerta_min between 1 and 240),
  ativa      boolean not null default true,
  unique (id, tenant_id),
  unique (tenant_id, nome)
);
comment on column public.estacoes.alerta_min is 'Minutos de espera a partir dos quais o cartão fica em alerta.';

create table public.estacao_categorias (
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  categoria_id  uuid not null,
  estacao_id    uuid not null,
  primary key (categoria_id),
  foreign key (categoria_id, tenant_id) references public.categorias (id, tenant_id) on delete cascade,
  foreign key (estacao_id, tenant_id) references public.estacoes (id, tenant_id) on delete cascade
);
comment on table public.estacao_categorias is 'Para que estação vai cada categoria. Categoria sem estação não passa pela cozinha.';

alter table public.itens_pedido add column estacao_id uuid;
alter table public.itens_pedido add column preparo public.estado_preparo;
alter table public.itens_pedido add column preparo_iniciado_em timestamptz;
alter table public.itens_pedido add column pronto_em timestamptz;
alter table public.itens_pedido add column entregue_em timestamptz;
alter table public.itens_pedido add column cancelado_motivo text check (cancelado_motivo is null or length(cancelado_motivo) <= 200);
alter table public.itens_pedido add column criado_em timestamptz not null default now();
alter table public.itens_pedido
  add constraint itens_pedido_estacao_fkey foreign key (estacao_id, tenant_id) references public.estacoes (id, tenant_id);
create index itens_pedido_cozinha_idx on public.itens_pedido (tenant_id, estacao_id, preparo) where preparo in ('aguardando', 'em_preparo', 'pronto');
comment on column public.itens_pedido.preparo is 'Null = item que não passa pela cozinha.';

alter table public.itens_pedido replica identity full;
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.itens_pedido;
  end if;
end;
$$;

-- O item vai para a estação da sua categoria.
create function app.item_para_estacao()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.estacao_id is null and new.produto_id is not null then
    select ec.estacao_id into new.estacao_id
      from public.produtos p
      join public.estacao_categorias ec on ec.categoria_id = p.categoria_id
      join public.estacoes e on e.id = ec.estacao_id and e.ativa
     where p.id = new.produto_id;
  end if;
  if new.estacao_id is not null and new.preparo is null then
    new.preparo := 'aguardando';
  end if;
  return new;
end;
$$;

create trigger itens_pedido_estacao
  before insert on public.itens_pedido
  for each row execute function app.item_para_estacao();

-- Transições de preparo, carimbos de hora e cancelamento com motivo.
create function app.item_preparo_transicao()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.preparo is not distinct from old.preparo then
    return new;
  end if;
  if old.preparo is null then
    raise exception 'este item não passa pela cozinha' using errcode = 'check_violation';
  end if;
  if not (
    (old.preparo = 'aguardando' and new.preparo in ('em_preparo', 'pronto', 'cancelado')) or
    (old.preparo = 'em_preparo' and new.preparo in ('pronto', 'aguardando', 'cancelado')) or
    (old.preparo = 'pronto' and new.preparo in ('entregue', 'em_preparo', 'cancelado'))
  ) then
    raise exception 'o item não pode passar de % para %', old.preparo, new.preparo using errcode = 'check_violation';
  end if;
  if new.preparo = 'cancelado' and coalesce(trim(new.cancelado_motivo), '') = '' then
    raise exception 'informe o motivo do cancelamento do item' using errcode = 'check_violation';
  end if;
  if new.preparo = 'em_preparo' then new.preparo_iniciado_em := coalesce(new.preparo_iniciado_em, now()); end if;
  if new.preparo = 'pronto' then new.pronto_em := now(); end if;
  if new.preparo = 'entregue' then new.entregue_em := now(); end if;
  return new;
end;
$$;

create trigger itens_pedido_preparo
  before update of preparo on public.itens_pedido
  for each row execute function app.item_preparo_transicao();

-- Pedido pronto quando todos os itens de preparo estão prontos (ou entregues/cancelados).
create function app.pedido_pronto_pela_cozinha()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.preparo in ('pronto', 'entregue', 'cancelado') and not exists (
    select 1 from public.itens_pedido i
     where i.pedido_id = new.pedido_id and i.preparo in ('aguardando', 'em_preparo')
  ) then
    update public.pedidos set status = 'pronto'
     where id = new.pedido_id and status in ('novo', 'aceite') and canal <> 'mesa';
  end if;
  return null;
end;
$$;

create trigger itens_pedido_pedido_pronto
  after update of preparo on public.itens_pedido
  for each row execute function app.pedido_pronto_pela_cozinha();

-- -----------------------------------------------------------------------------
-- Mesas e comandas
-- -----------------------------------------------------------------------------
create table public.mesas (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  loja_id     uuid not null,
  numero      integer not null check (numero between 1 and 9999),
  area        text check (area is null or length(area) <= 40),
  lugares     integer not null default 4 check (lugares between 1 and 99),
  ativa       boolean not null default true,
  unique (id, tenant_id),
  unique (tenant_id, loja_id, numero),
  foreign key (loja_id, tenant_id) references public.lojas (id, tenant_id) on delete cascade
);

alter table public.pedidos add column taxa_servico numeric(10, 2) not null default 0 check (taxa_servico >= 0);

create table public.comandas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  loja_id        uuid not null,
  mesa_id        uuid,
  pedido_id      uuid not null,
  identificador  text check (identificador is null or length(identificador) <= 30),
  pessoas        integer not null default 1 check (pessoas between 1 and 99),
  garcom_nome    text,
  estado         public.estado_comanda not null default 'aberta',
  aberta_em      timestamptz not null default now(),
  fechada_em     timestamptz,
  unique (id, tenant_id),
  unique (pedido_id),
  foreign key (loja_id, tenant_id) references public.lojas (id, tenant_id),
  foreign key (mesa_id, tenant_id) references public.mesas (id, tenant_id),
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id) on delete cascade,
  check (mesa_id is not null or identificador is not null)
);
comment on column public.comandas.identificador is 'Comanda individual (cartão ou pulseira) quando não há mesa.';
create unique index comandas_uma_aberta_por_mesa on public.comandas (tenant_id, mesa_id) where estado in ('aberta', 'conta') and mesa_id is not null;
create index comandas_abertas_idx on public.comandas (tenant_id, estado);

alter table public.comandas replica identity full;
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.comandas;
  end if;
end;
$$;

-- Abrir: cria o pedido do canal `mesa` e a comanda.
create function public.abrir_comanda(p_tenant uuid, p_loja uuid, p_mesa uuid, p_identificador text, p_pessoas integer, p_garcom text)
returns public.comandas
language plpgsql
security invoker
set search_path = ''
as $$
declare
  ped public.pedidos;
  nova public.comandas;
begin
  insert into public.pedidos (tenant_id, loja_id, canal, tipo_entrega, subtotal, total, forma_pagamento, status, cliente_nome)
  values (p_tenant, p_loja, 'mesa', 'retirada', 0, 0, 'dinheiro', 'aceite',
          coalesce((select 'Mesa ' || m.numero from public.mesas m where m.id = p_mesa), 'Comanda ' || p_identificador))
  returning * into ped;

  insert into public.comandas (tenant_id, loja_id, mesa_id, pedido_id, identificador, pessoas, garcom_nome)
  values (p_tenant, p_loja, p_mesa, ped.id, nullif(trim(p_identificador), ''), coalesce(p_pessoas, 1), p_garcom)
  returning * into nova;
  return nova;
end;
$$;

-- Total da comanda: soma dos itens não cancelados.
create function app.recalcular_comanda()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pid uuid := coalesce(new.pedido_id, old.pedido_id);
  soma numeric(10, 2);
begin
  if not exists (select 1 from public.pedidos where id = pid and canal = 'mesa' and status <> 'concluido') then
    return null;
  end if;
  select coalesce(sum(total), 0) into soma from public.itens_pedido
   where pedido_id = pid and preparo is distinct from 'cancelado';
  update public.pedidos set subtotal = soma, total = greatest(soma - desconto, 0) + taxa_servico where id = pid;
  return null;
end;
$$;

create trigger itens_pedido_comanda
  after insert or update or delete on public.itens_pedido
  for each row execute function app.recalcular_comanda();

-- Itens de uma comanda aberta: não entram em comanda fechada; já em preparo não se apagam.
create function app.itens_da_comanda()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  est public.estado_comanda;
begin
  select c.estado into est from public.comandas c where c.pedido_id = coalesce(new.pedido_id, old.pedido_id);
  if est is null then
    return coalesce(new, old);
  end if;
  if est not in ('aberta', 'conta') then
    raise exception 'a comanda já foi fechada' using errcode = 'check_violation';
  end if;
  if tg_op = 'DELETE' and old.preparo in ('em_preparo', 'pronto', 'entregue') then
    raise exception 'item já na cozinha: cancele com motivo' using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger itens_pedido_da_comanda
  before insert or delete on public.itens_pedido
  for each row execute function app.itens_da_comanda();

-- Fechar a conta no caixa aberto: taxa de serviço, desconto, pagamentos (dividido).
create function public.fechar_comanda(p jsonb)
returns public.pedidos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  com public.comandas;
  ped public.pedidos;
  sessao public.caixa_sessoes;
  pag jsonb;
  pago numeric(12, 2) := 0;
  troco numeric(12, 2) := 0;
  v_total numeric(12, 2);
  forma_principal text;
begin
  select * into com from public.comandas where tenant_id = (p ->> 'tenant_id')::uuid and id = (p ->> 'comanda_id')::uuid;
  if not found then raise exception 'comanda não encontrada' using errcode = 'no_data_found'; end if;
  if com.estado not in ('aberta', 'conta') then raise exception 'a comanda já foi fechada' using errcode = 'check_violation'; end if;
  select * into sessao from public.caixa_sessoes where tenant_id = com.tenant_id and loja_id = com.loja_id and estado = 'aberta';
  if not found then raise exception 'abra o caixa antes de fechar a conta' using errcode = 'check_violation'; end if;
  if exists (select 1 from public.itens_pedido where pedido_id = com.pedido_id and preparo in ('aguardando', 'em_preparo')) then
    raise exception 'há itens ainda na cozinha' using errcode = 'check_violation';
  end if;

  update public.pedidos
     set taxa_servico = coalesce((p ->> 'taxa_servico')::numeric, 0),
         desconto = coalesce((p ->> 'desconto')::numeric, 0)
   where id = com.pedido_id;
  select * into ped from public.pedidos where id = com.pedido_id;
  v_total := greatest(ped.subtotal - ped.desconto, 0) + ped.taxa_servico;
  if v_total <= 0 then raise exception 'comanda sem itens' using errcode = 'check_violation'; end if;

  for pag in select * from jsonb_array_elements(p -> 'pagamentos') loop
    pago := pago + (pag ->> 'valor')::numeric;
    troco := troco + coalesce((pag ->> 'troco')::numeric, 0);
  end loop;
  if pago - troco <> v_total then
    raise exception 'pagamentos (%) não fecham com o total (%)', pago - troco, v_total using errcode = 'check_violation';
  end if;

  select e ->> 'forma' into forma_principal from jsonb_array_elements(p -> 'pagamentos') as e
   order by (e ->> 'valor')::numeric desc limit 1;

  for pag in select * from jsonb_array_elements(p -> 'pagamentos') loop
    insert into public.pagamentos_pedido (tenant_id, pedido_id, forma, valor, troco)
    values (com.tenant_id, com.pedido_id, (pag ->> 'forma')::public.forma_recebimento, (pag ->> 'valor')::numeric, coalesce((pag ->> 'troco')::numeric, 0));
    if (pag ->> 'valor')::numeric - coalesce((pag ->> 'troco')::numeric, 0) > 0 then
      insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor, pedido_id, autor_nome)
      values (com.tenant_id, sessao.id, 'venda', (pag ->> 'forma')::public.forma_recebimento,
              (pag ->> 'valor')::numeric - coalesce((pag ->> 'troco')::numeric, 0), com.pedido_id, p ->> 'autor_nome');
    end if;
  end loop;

  update public.itens_pedido set preparo = 'entregue' where pedido_id = com.pedido_id and preparo = 'pronto';
  update public.pedidos
     set status = 'concluido', total = v_total, caixa_sessao_id = sessao.id,
         forma_pagamento = case when forma_principal in ('cartao_debito', 'cartao_credito') then 'cartao'
                                when forma_principal = 'pix' then 'pix' else 'dinheiro' end::public.forma_pagamento
   where id = com.pedido_id
  returning * into ped;
  update public.comandas set estado = 'fechada', fechada_em = now() where id = com.id;
  return ped;
end;
$$;

-- Juntar a comanda B na A (mesas juntas): os itens passam para A e B é cancelada.
create function public.juntar_comandas(p_tenant uuid, p_destino uuid, p_origem uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a public.comandas;
  b public.comandas;
begin
  select * into a from public.comandas where tenant_id = p_tenant and id = p_destino;
  select * into b from public.comandas where tenant_id = p_tenant and id = p_origem;
  if a.id is null or b.id is null or a.id = b.id then raise exception 'comandas inválidas' using errcode = 'check_violation'; end if;
  if a.estado not in ('aberta', 'conta') or b.estado not in ('aberta', 'conta') then
    raise exception 'só se juntam comandas abertas' using errcode = 'check_violation';
  end if;
  update public.itens_pedido set pedido_id = a.pedido_id where pedido_id = b.pedido_id;
  update public.comandas set pessoas = a.pessoas + b.pessoas where id = a.id;
  update public.comandas set estado = 'cancelada', fechada_em = now() where id = b.id;
  update public.pedidos set status = 'cancelado', cancelado_motivo = 'Juntada à comanda ' || coalesce(a.identificador, a.id::text) where id = b.pedido_id;
  -- Recalcula os dois totais.
  update public.pedidos set subtotal = (select coalesce(sum(total), 0) from public.itens_pedido where pedido_id = a.pedido_id and preparo is distinct from 'cancelado') where id = a.pedido_id;
  update public.pedidos set total = greatest(subtotal - desconto, 0) + taxa_servico where id = a.pedido_id;
  update public.pedidos set subtotal = 0, total = 0 where id = b.pedido_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Estação de partida (idempotente)
-- -----------------------------------------------------------------------------
create function public.cozinha_padrao(p_tenant uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.estacoes (tenant_id, nome, ordem) values (p_tenant, 'Cozinha', 1), (p_tenant, 'Bar', 2)
  on conflict (tenant_id, nome) do nothing;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.estacoes, public.estacao_categorias, public.mesas to authenticated;
grant select, insert on public.comandas to authenticated;
grant update (mesa_id, pessoas, garcom_nome, estado, fechada_em) on public.comandas to authenticated;
grant all on public.estacoes, public.estacao_categorias, public.mesas, public.comandas to service_role;
grant execute on function public.abrir_comanda(uuid, uuid, uuid, text, integer, text) to authenticated, service_role;
grant execute on function public.fechar_comanda(jsonb) to authenticated, service_role;
grant execute on function public.juntar_comandas(uuid, uuid, uuid) to authenticated, service_role;
grant execute on function public.cozinha_padrao(uuid) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['estacoes', 'estacao_categorias', 'mesas', 'comandas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy %I on public.%I
        for all to authenticated
        using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
        with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
    $p$, t || ': membros e operadores', t);
  end loop;
end;
$$;

-- A comanda só muda de estado pelo caminho certo; fechada não volta.
create function app.comanda_transicao()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.estado is distinct from old.estado and not (
    (old.estado = 'aberta' and new.estado in ('conta', 'fechada', 'cancelada')) or
    (old.estado = 'conta' and new.estado in ('aberta', 'fechada', 'cancelada'))
  ) then
    raise exception 'a comanda não pode passar de % para %', old.estado, new.estado using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger comandas_transicao
  before update on public.comandas
  for each row execute function app.comanda_transicao();

insert into app.migracoes (nome) values ('0013_cozinha_comandas.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0014_estoque.sql
-- #############################################################################

-- =============================================================================
-- 0014 — Estoque (módulo `estoque`) e fichas técnicas (módulo `producao`)
--
-- Itens de estoque: produtos com `controla_estoque` e insumos. O saldo e o
-- custo médio vivem no item e só mudam por movimentos. Um movimento nunca se
-- edita nem se apaga: corrige-se com um estorno. Cada movimento guarda o saldo
-- antes e depois.
--
-- Baixa automática: quando um pedido fica `concluido` (de qualquer canal), os
-- itens baixam o produto (se controla estoque) e os insumos da ficha técnica.
-- Pedido concluído que é cancelado estorna a baixa. Só com o módulo ligado.
-- =============================================================================

alter table public.produtos add column controla_estoque boolean not null default false;
alter table public.produtos add column unidade text not null default 'un' check (unidade in ('un', 'kg', 'g', 'l', 'ml', 'cx', 'pct', 'dz'));
alter table public.produtos add column estoque_atual numeric(12, 3) not null default 0;
alter table public.produtos add column estoque_minimo numeric(12, 3) not null default 0 check (estoque_minimo >= 0);
alter table public.produtos add column custo_medio numeric(12, 4) not null default 0 check (custo_medio >= 0);

alter table public.insumos add column codigo_barras text;
alter table public.insumos add column ativo boolean not null default true;
alter table public.insumos add constraint insumos_unidade_check check (unidade in ('un', 'kg', 'g', 'l', 'ml', 'cx', 'pct', 'dz'));
alter table public.insumos add constraint insumos_tenant_nome_unico unique (tenant_id, nome);
comment on column public.insumos.quantidade_atual is 'Saldo actual; só muda por estoque_movimentos.';
comment on column public.insumos.custo_unitario is 'Custo médio por unidade; recalculado em cada entrada.';

alter table public.itens_pedido add column estoque_baixado boolean not null default false;

create type public.tipo_movimento_estoque as enum ('entrada', 'saida', 'venda', 'ajuste', 'estorno', 'producao');

create table public.estoque_movimentos (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  produto_id     uuid,
  insumo_id      uuid,
  tipo           public.tipo_movimento_estoque not null,
  motivo         text not null check (length(motivo) between 2 and 120),
  quantidade     numeric(12, 3) not null check (quantidade <> 0),
  custo_unitario numeric(12, 4),
  saldo_antes    numeric(12, 3) not null,
  saldo_depois   numeric(12, 3) not null,
  origem         text check (origem in ('entrada', 'pedido', 'inventario', 'manual', 'estorno')),
  origem_id      uuid,
  estorno_de     uuid references public.estoque_movimentos (id),
  autor_nome     text,
  criado_em      timestamptz not null default now(),
  check ((produto_id is null) <> (insumo_id is null)),
  check (tipo not in ('entrada', 'producao') or quantidade > 0),
  check (tipo not in ('saida', 'venda') or quantidade < 0),
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id) on delete cascade,
  foreign key (insumo_id, tenant_id) references public.insumos (id, tenant_id) on delete cascade
);
comment on column public.estoque_movimentos.quantidade is 'Positiva entra, negativa sai.';
create index estoque_movimentos_item_idx on public.estoque_movimentos (tenant_id, coalesce(produto_id, insumo_id), criado_em desc);
create unique index estoque_um_estorno on public.estoque_movimentos (estorno_de) where estorno_de is not null;

-- Saldo, custo médio e carimbo de antes/depois.
create function app.aplicar_movimento_estoque()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  saldo numeric(12, 3);
  custo numeric(12, 4);
begin
  if new.produto_id is not null then
    select estoque_atual, custo_medio into saldo, custo from public.produtos where id = new.produto_id for update;
  else
    select quantidade_atual, custo_unitario into saldo, custo from public.insumos where id = new.insumo_id for update;
  end if;
  new.saldo_antes := saldo;
  new.saldo_depois := saldo + new.quantidade;

  -- Custo médio ponderado só nas entradas com custo e saldo positivo.
  if new.tipo in ('entrada', 'producao') and new.custo_unitario is not null then
    if saldo > 0 then
      custo := ((saldo * custo) + (new.quantidade * new.custo_unitario)) / (saldo + new.quantidade);
    else
      custo := new.custo_unitario;
    end if;
  end if;

  if new.produto_id is not null then
    update public.produtos set estoque_atual = new.saldo_depois, custo_medio = custo where id = new.produto_id;
  else
    update public.insumos set quantidade_atual = new.saldo_depois, custo_unitario = custo where id = new.insumo_id;
  end if;
  return new;
end;
$$;
comment on function app.aplicar_movimento_estoque() is 'Security definer só para escrever saldo e custo, que os utilizadores não alteram à mão.';

create trigger estoque_movimentos_aplicar
  before insert on public.estoque_movimentos
  for each row execute function app.aplicar_movimento_estoque();

-- Estorno: movimento simétrico, ligado ao original.
create function public.estornar_movimento_estoque(p_tenant uuid, p_movimento uuid, p_autor text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  m public.estoque_movimentos;
begin
  select * into m from public.estoque_movimentos where tenant_id = p_tenant and id = p_movimento;
  if not found then raise exception 'movimento não encontrado' using errcode = 'no_data_found'; end if;
  if m.tipo = 'estorno' then raise exception 'um estorno não se estorna' using errcode = 'check_violation'; end if;
  insert into public.estoque_movimentos (tenant_id, produto_id, insumo_id, tipo, motivo, quantidade, origem, origem_id, estorno_de, autor_nome, saldo_antes, saldo_depois)
  values (m.tenant_id, m.produto_id, m.insumo_id, 'estorno', 'Estorno: ' || m.motivo, -m.quantidade, 'estorno', m.id, m.id, p_autor, 0, 0);
exception
  when unique_violation then raise exception 'este movimento já foi estornado' using errcode = 'check_violation';
end;
$$;

-- -----------------------------------------------------------------------------
-- Baixa automática pela venda
-- -----------------------------------------------------------------------------
create function app.estoque_ligado(p_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.tenant_modulos where tenant_id = p_tenant and modulo = 'estoque' and ativo);
$$;

create function app.baixar_item_pedido(i public.itens_pedido)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  f record;
  controla boolean;
begin
  if i.produto_id is null or i.estoque_baixado or i.preparo is not distinct from 'cancelado' then return; end if;
  select p.controla_estoque into controla from public.produtos p where p.id = i.produto_id;
  if controla then
    insert into public.estoque_movimentos (tenant_id, produto_id, tipo, motivo, quantidade, origem, origem_id, saldo_antes, saldo_depois)
    values (i.tenant_id, i.produto_id, 'venda', 'Venda', -i.quantidade, 'pedido', i.pedido_id, 0, 0);
  end if;
  for f in select fi.insumo_id, fi.quantidade from public.fichas fi where fi.produto_id = i.produto_id loop
    insert into public.estoque_movimentos (tenant_id, insumo_id, tipo, motivo, quantidade, origem, origem_id, saldo_antes, saldo_depois)
    values (i.tenant_id, f.insumo_id, 'venda', 'Venda (ficha técnica)', -(f.quantidade * i.quantidade), 'pedido', i.pedido_id, 0, 0);
  end loop;
  update public.itens_pedido set estoque_baixado = true where id = i.id;
end;
$$;

-- Pedido concluído baixa; concluído que é cancelado estorna.
create function app.estoque_pelo_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  i public.itens_pedido;
  m public.estoque_movimentos;
begin
  if not app.estoque_ligado(new.tenant_id) then return null; end if;
  if new.status = 'concluido' and old.status is distinct from 'concluido' then
    for i in select * from public.itens_pedido where pedido_id = new.id loop
      perform app.baixar_item_pedido(i);
    end loop;
  elsif new.status = 'cancelado' and old.status = 'concluido' then
    for m in select * from public.estoque_movimentos
              where origem = 'pedido' and origem_id = new.id and tipo = 'venda'
                and not exists (select 1 from public.estoque_movimentos e where e.estorno_de = estoque_movimentos.id) loop
      insert into public.estoque_movimentos (tenant_id, produto_id, insumo_id, tipo, motivo, quantidade, origem, origem_id, estorno_de, saldo_antes, saldo_depois)
      values (m.tenant_id, m.produto_id, m.insumo_id, 'estorno', 'Venda cancelada', -m.quantidade, 'estorno', m.id, m.id, 0, 0);
    end loop;
    update public.itens_pedido set estoque_baixado = false where pedido_id = new.id;
  end if;
  return null;
end;
$$;

create trigger pedidos_estoque
  after update of status on public.pedidos
  for each row execute function app.estoque_pelo_pedido();

-- Venda de balcão: o pedido nasce concluído e os itens chegam depois.
create function app.estoque_pelo_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if app.estoque_ligado(new.tenant_id)
     and exists (select 1 from public.pedidos p where p.id = new.pedido_id and p.status = 'concluido') then
    perform app.baixar_item_pedido(new);
  end if;
  return null;
end;
$$;

create trigger itens_pedido_estoque
  after insert on public.itens_pedido
  for each row execute function app.estoque_pelo_item();

-- -----------------------------------------------------------------------------
-- Entradas (manual ou XML da NF-e)
-- -----------------------------------------------------------------------------
create type public.estado_entrada as enum ('pendente', 'concluida', 'cancelada');

create table public.estoque_entradas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  fornecedor_id  uuid,
  fornecedor_nome text,
  fornecedor_documento text,
  numero_nota    text,
  serie          text,
  chave_acesso   text check (chave_acesso is null or chave_acesso ~ '^[0-9]{44}$'),
  emitida_em     date,
  valor_total    numeric(12, 2) not null default 0,
  estado         public.estado_entrada not null default 'pendente',
  observacoes    text,
  duplicatas     jsonb not null default '[]'::jsonb,
  autor_nome     text,
  criado_em      timestamptz not null default now(),
  concluida_em   timestamptz,
  unique (id, tenant_id),
  foreign key (fornecedor_id, tenant_id) references public.pessoas (id, tenant_id) on delete set null (fornecedor_id)
);
comment on column public.estoque_entradas.duplicatas is 'Parcelas da nota [{numero, vencimento, valor}], viram contas a pagar.';
create unique index estoque_entradas_chave_unica on public.estoque_entradas (tenant_id, chave_acesso) where chave_acesso is not null and estado <> 'cancelada';

create table public.estoque_entrada_itens (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  entrada_id        uuid not null,
  produto_id        uuid,
  insumo_id         uuid,
  descricao         text not null,
  codigo_fornecedor text,
  ean               text,
  unidade_nota      text,
  quantidade_nota   numeric(12, 4) not null check (quantidade_nota > 0),
  fator             numeric(12, 4) not null default 1 check (fator > 0),
  valor_total       numeric(12, 2) not null check (valor_total >= 0),
  foreign key (entrada_id, tenant_id) references public.estoque_entradas (id, tenant_id) on delete cascade,
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id),
  foreign key (insumo_id, tenant_id) references public.insumos (id, tenant_id),
  check (produto_id is null or insumo_id is null)
);
comment on column public.estoque_entrada_itens.fator is 'Conversão da unidade da nota para a do estoque (caixa com 12 → 12).';

-- O vínculo item do fornecedor → produto/insumo é lembrado para a próxima nota.
create table public.estoque_vinculos (
  tenant_id            uuid not null references public.tenants (id) on delete cascade,
  fornecedor_documento text not null,
  codigo_fornecedor    text not null,
  produto_id           uuid,
  insumo_id            uuid,
  fator                numeric(12, 4) not null default 1,
  primary key (tenant_id, fornecedor_documento, codigo_fornecedor),
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id) on delete cascade,
  foreign key (insumo_id, tenant_id) references public.insumos (id, tenant_id) on delete cascade,
  check ((produto_id is null) <> (insumo_id is null))
);

-- Concluir a entrada: um movimento por item ligado, com custo; lembra os vínculos.
create function public.concluir_entrada_estoque(p_tenant uuid, p_entrada uuid, p_autor text)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  e public.estoque_entradas;
  it public.estoque_entrada_itens;
  n integer := 0;
  qtd numeric(12, 3);
begin
  select * into e from public.estoque_entradas where tenant_id = p_tenant and id = p_entrada for update;
  if not found then raise exception 'entrada não encontrada' using errcode = 'no_data_found'; end if;
  if e.estado <> 'pendente' then raise exception 'esta entrada já foi %', e.estado using errcode = 'check_violation'; end if;
  if exists (select 1 from public.estoque_entrada_itens where entrada_id = p_entrada and produto_id is null and insumo_id is null) then
    raise exception 'ligue todos os itens a um produto ou insumo antes de concluir' using errcode = 'check_violation';
  end if;

  for it in select * from public.estoque_entrada_itens where entrada_id = p_entrada loop
    qtd := round(it.quantidade_nota * it.fator, 3);
    insert into public.estoque_movimentos (tenant_id, produto_id, insumo_id, tipo, motivo, quantidade, custo_unitario, origem, origem_id, autor_nome, saldo_antes, saldo_depois)
    values (p_tenant, it.produto_id, it.insumo_id, 'entrada',
            coalesce('Compra NF ' || e.numero_nota, 'Entrada manual'), qtd,
            case when qtd > 0 then it.valor_total / qtd end, 'entrada', p_entrada, p_autor, 0, 0);
    if e.fornecedor_documento is not null and it.codigo_fornecedor is not null then
      insert into public.estoque_vinculos (tenant_id, fornecedor_documento, codigo_fornecedor, produto_id, insumo_id, fator)
      values (p_tenant, e.fornecedor_documento, it.codigo_fornecedor, it.produto_id, it.insumo_id, it.fator)
      on conflict (tenant_id, fornecedor_documento, codigo_fornecedor)
      do update set produto_id = excluded.produto_id, insumo_id = excluded.insumo_id, fator = excluded.fator;
    end if;
    n := n + 1;
  end loop;

  update public.estoque_entradas set estado = 'concluida', concluida_em = now() where id = p_entrada;
  return n;
end;
$$;

-- -----------------------------------------------------------------------------
-- Inventário: contagem → ajustes
-- -----------------------------------------------------------------------------
create table public.inventarios (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  descricao    text not null default 'Inventário',
  autor_nome   text,
  itens        jsonb not null default '[]'::jsonb,
  ajustes      integer not null default 0,
  criado_em    timestamptz not null default now()
);
comment on column public.inventarios.itens is 'Contagem registada [{produto_id|insumo_id, nome, sistema, contado, diferenca}].';

create function public.aplicar_inventario(p_tenant uuid, p_descricao text, p_contagem jsonb, p_autor text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  c jsonb;
  sistema numeric(12, 3);
  contado numeric(12, 3);
  inv uuid;
  registo jsonb := '[]'::jsonb;
  n integer := 0;
  nome text;
begin
  insert into public.inventarios (tenant_id, descricao, autor_nome) values (p_tenant, coalesce(nullif(trim(p_descricao), ''), 'Inventário'), p_autor)
  returning id into inv;
  for c in select * from jsonb_array_elements(p_contagem) loop
    contado := (c ->> 'contado')::numeric;
    if contado < 0 then raise exception 'contagem negativa' using errcode = 'check_violation'; end if;
    if c ? 'produto_id' then
      select estoque_atual, p.nome into sistema, nome from public.produtos p where p.tenant_id = p_tenant and p.id = (c ->> 'produto_id')::uuid;
    else
      select quantidade_atual, x.nome into sistema, nome from public.insumos x where x.tenant_id = p_tenant and x.id = (c ->> 'insumo_id')::uuid;
    end if;
    if sistema is null then raise exception 'item do inventário não encontrado' using errcode = 'no_data_found'; end if;
    registo := registo || jsonb_build_object('produto_id', c ->> 'produto_id', 'insumo_id', c ->> 'insumo_id', 'nome', nome,
                                              'sistema', sistema, 'contado', contado, 'diferenca', contado - sistema);
    if contado <> sistema then
      insert into public.estoque_movimentos (tenant_id, produto_id, insumo_id, tipo, motivo, quantidade, origem, origem_id, autor_nome, saldo_antes, saldo_depois)
      values (p_tenant, (c ->> 'produto_id')::uuid, (c ->> 'insumo_id')::uuid, 'ajuste', 'Inventário', contado - sistema, 'inventario', inv, p_autor, 0, 0);
      n := n + 1;
    end if;
  end loop;
  update public.inventarios set itens = registo, ajustes = n where id = inv;
  return inv;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
-- Saldo e custo só mudam por movimentos: o update passa a ser por colunas.
revoke update on public.produtos from authenticated;
grant update (
  categoria_id, nome, descricao, preco, preco_promocional, foto_url, sku, disponivel, tempo_preparo_min, ordem,
  codigo_barras, vendido_por_peso, controla_estoque, unidade, estoque_minimo
) on public.produtos to authenticated;
revoke update on public.insumos from authenticated;
grant update (nome, unidade, quantidade_minima, codigo_barras, ativo) on public.insumos to authenticated;
grant select, insert on public.estoque_movimentos, public.inventarios to authenticated;
grant update (itens, ajustes) on public.inventarios to authenticated;
grant select, insert, update, delete on public.estoque_entradas, public.estoque_entrada_itens, public.estoque_vinculos to authenticated;
grant all on public.estoque_movimentos, public.inventarios, public.estoque_entradas, public.estoque_entrada_itens, public.estoque_vinculos to service_role;
grant execute on function public.estornar_movimento_estoque(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.concluir_entrada_estoque(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.aplicar_inventario(uuid, text, jsonb, text) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['estoque_movimentos', 'inventarios', 'estoque_entradas', 'estoque_entrada_itens', 'estoque_vinculos'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy %I on public.%I
        for all to authenticated
        using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
        with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
    $p$, t || ': membros e operadores', t);
  end loop;
end;
$$;

insert into app.migracoes (nome) values ('0014_estoque.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0015_equipe.sql
-- #############################################################################

-- =============================================================================
-- 0015 — Equipe, PIN e auditoria (módulo `equipe`)
--
-- O tablet fica com a conta da loja; cada pessoa da equipe opera com o seu PIN
-- (guardado só como hash scrypt). O papel decide o que vê e o que faz sem a
-- aprovação do gerente. Cinco PINs errados bloqueiam a pessoa por 5 minutos.
-- A auditoria regista, em português, quem fez o quê.
-- =============================================================================

create type public.papel_equipe as enum ('gerente', 'caixa', 'garcom', 'cozinha', 'atendente');

create table public.equipe_membros (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  nome              text not null check (length(nome) between 1 and 60),
  papel             public.papel_equipe not null,
  pin_hash          text not null check (pin_hash like 'scrypt$%'),
  ativo             boolean not null default true,
  tentativas_falhas integer not null default 0,
  bloqueado_ate     timestamptz,
  criado_em         timestamptz not null default now(),
  unique (id, tenant_id),
  unique (tenant_id, nome)
);
comment on column public.equipe_membros.pin_hash is 'scrypt$sal$hash. Nunca exposto ao browser: o select do authenticated não inclui esta coluna.';

create table public.auditoria (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  quem        text not null,
  papel       text,
  aprovado_por text,
  acao        text not null check (length(acao) between 2 and 60),
  descricao   text not null check (length(descricao) between 2 and 300),
  alvo_id     uuid,
  detalhe     jsonb not null default '{}'::jsonb,
  criado_em   timestamptz not null default now()
);
comment on table public.auditoria is 'Quem fez o quê, em frase legível. Só se acrescenta.';
create index auditoria_tenant_idx on public.auditoria (tenant_id, criado_em desc);

-- Permissões: o hash do PIN não se lê pela API do browser; a auditoria só se acrescenta.
grant select (id, tenant_id, nome, papel, ativo, tentativas_falhas, bloqueado_ate, criado_em) on public.equipe_membros to authenticated;
grant insert (tenant_id, nome, papel, pin_hash, ativo) on public.equipe_membros to authenticated;
grant update (nome, papel, pin_hash, ativo) on public.equipe_membros to authenticated;
grant select, insert on public.auditoria to authenticated;
grant all on public.equipe_membros, public.auditoria to service_role;

do $$
declare
  t text;
begin
  foreach t in array array['equipe_membros', 'auditoria'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy %I on public.%I
        for all to authenticated
        using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
        with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
    $p$, t || ': membros e operadores', t);
  end loop;
end;
$$;

insert into app.migracoes (nome) values ('0015_equipe.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0016_integracoes_fiscal.sql
-- #############################################################################

-- =============================================================================
-- 0016 — Integrações (base comum) e nota fiscal (módulo `fiscal`, pré-funcional)
--
-- Padrão de todas as integrações (docs/pesquisa/integracoes.md §0):
--   • `integracoes`: estado por tenant e domínio, legível pelo painel e pelo
--     console, SEM segredos. Só operadores alteram (a ativação é da equipa).
--   • `integracoes_segredos`: tokens e senhas cifrados pela aplicação
--     (AES-256-GCM); nenhum acesso para `authenticated`, só o servidor.
--   • `webhooks_recebidos`: caixa de entrada deduplicada por (provedor, evento).
-- Nota fiscal: o emissor é um parceiro (Focus NFe); aqui fica o documento com
-- a nossa chave de idempotência (`ref`), o estado e os links do DANFE/XML.
-- =============================================================================

create type public.estado_integracao as enum ('aguardando_credenciais', 'em_homologacao', 'em_producao', 'com_erro', 'suspensa');
create type public.ambiente_integracao as enum ('homologacao', 'producao');

create table public.integracoes (
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  dominio        text not null check (dominio in ('fiscal', 'pix', 'whatsapp', 'delivery')),
  provedor       text not null check (provedor ~ '^[a-z0-9_]{2,30}$'),
  ambiente       public.ambiente_integracao not null default 'homologacao',
  estado         public.estado_integracao not null default 'aguardando_credenciais',
  configuracao   jsonb not null default '{}'::jsonb,
  ultimo_erro    text,
  verificado_em  timestamptz,
  atualizado_em  timestamptz not null default now(),
  primary key (tenant_id, dominio)
);
comment on column public.integracoes.configuracao is 'Parâmetros NÃO secretos (CNPJ, IE, série, regime). Membros lêem: nada de tokens aqui.';

create trigger integracoes_atualizado_em
  before update on public.integracoes
  for each row execute function app.carimbar_atualizado_em();

create table public.integracoes_segredos (
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  dominio        text not null,
  nome           text not null check (nome ~ '^[a-z0-9_]{2,40}$'),
  valor_cifrado  text not null check (valor_cifrado like 'v1:%'),
  atualizado_em  timestamptz not null default now(),
  primary key (tenant_id, dominio, nome)
);
comment on table public.integracoes_segredos is 'Só service_role. Valores cifrados com AES-256-GCM pela aplicação (src/lib/integracoes/segredos.ts).';

create table public.webhooks_recebidos (
  id             uuid primary key default gen_random_uuid(),
  provedor       text not null,
  evento_id      text not null,
  tenant_id      uuid references public.tenants (id) on delete cascade,
  payload        jsonb not null,
  assinatura_ok  boolean not null default false,
  recebido_em    timestamptz not null default now(),
  processado_em  timestamptz,
  erro           text,
  unique (provedor, evento_id)
);

-- Cadastro fiscal do produto (revisar com o contador na implantação).
alter table public.produtos add column ncm text check (ncm is null or ncm ~ '^[0-9]{8}$');
alter table public.produtos add column cfop text not null default '5102' check (cfop ~ '^[0-9]{4}$');
alter table public.produtos add column csosn text not null default '102' check (csosn ~ '^[0-9]{2,3}$');
alter table public.produtos add column origem_mercadoria smallint not null default 0 check (origem_mercadoria between 0 and 8);
alter table public.produtos add column cest text check (cest is null or cest ~ '^[0-9]{7}$');
grant update (ncm, cfop, csosn, origem_mercadoria, cest) on public.produtos to authenticated;

create type public.tipo_documento_fiscal as enum ('nfce', 'nfe', 'nfse');
create type public.estado_documento_fiscal as enum ('enfileirado', 'processando', 'autorizado', 'rejeitado', 'denegado', 'cancelado', 'contingencia', 'erro');

create table public.documentos_fiscais (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants (id) on delete cascade,
  pedido_id       uuid,
  tipo            public.tipo_documento_fiscal not null,
  ref             text not null,
  provedor        text not null,
  ambiente        public.ambiente_integracao not null,
  estado          public.estado_documento_fiscal not null default 'enfileirado',
  numero          text,
  serie           text,
  chave           text check (chave is null or chave ~ '^[0-9]{44}$'),
  protocolo       text,
  url_danfe       text,
  url_xml         text,
  mensagem        text,
  cpf_cnpj_destinatario text,
  valor_total     numeric(12, 2) not null default 0,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  unique (tenant_id, ref),
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id) on delete set null (pedido_id)
);
comment on column public.documentos_fiscais.ref is 'Chave de idempotência enviada ao emissor (id do pedido): reenviar nunca duplica a nota.';
create index documentos_fiscais_tenant_idx on public.documentos_fiscais (tenant_id, criado_em desc);
create unique index documentos_fiscais_um_por_pedido on public.documentos_fiscais (tenant_id, pedido_id, tipo) where pedido_id is not null and estado <> 'cancelado';

create trigger documentos_fiscais_atualizado_em
  before update on public.documentos_fiscais
  for each row execute function app.carimbar_atualizado_em();

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
grant select on public.integracoes to authenticated;
grant insert, update on public.integracoes to authenticated;
grant select, insert on public.documentos_fiscais to authenticated;
grant all on public.integracoes, public.integracoes_segredos, public.webhooks_recebidos, public.documentos_fiscais to service_role;

alter table public.integracoes enable row level security;
alter table public.integracoes_segredos enable row level security;
alter table public.webhooks_recebidos enable row level security;
alter table public.documentos_fiscais enable row level security;

create policy "integracoes: membros e operadores lêem"
  on public.integracoes for select to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));
create policy "integracoes: só operadores criam"
  on public.integracoes for insert to authenticated
  with check ((select app.e_operador()));
create policy "integracoes: só operadores alteram"
  on public.integracoes for update to authenticated
  using ((select app.e_operador())) with check ((select app.e_operador()));

create policy "documentos_fiscais: membros e operadores"
  on public.documentos_fiscais for all to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
  with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));
-- integracoes_segredos e webhooks_recebidos: sem políticas para authenticated = sem acesso.

insert into app.migracoes (nome) values ('0016_integracoes_fiscal.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0017_pix.sql
-- #############################################################################

-- =============================================================================
-- 0017 — Pix (módulo `bancos`, pré-funcional)
--
-- Cobrança Pix dinâmica (QR + copia-e-cola) pelo PSP do cliente, com o nosso
-- `txid` como chave de idempotência. A confirmação vem por webhook (assinado)
-- ou por consulta; paga, a cobrança de uma parcela dá baixa sozinha no
-- financeiro (carteira Pix). O PDV usa a cobrança para mostrar o QR e só
-- conclui a venda quando o Pix cai.
-- =============================================================================

create type public.estado_cobranca_pix as enum ('pendente', 'pago', 'expirado', 'cancelado', 'devolvido', 'erro');

create table public.cobrancas_pix (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  txid          text not null check (txid ~ '^[A-Za-z0-9]{26,35}$'),
  provedor      text not null,
  provedor_id   text,
  valor         numeric(12, 2) not null check (valor > 0),
  descricao     text not null check (length(descricao) between 1 and 140),
  origem        text not null check (origem in ('pdv', 'parcela', 'comanda', 'manual')),
  origem_id     uuid,
  estado        public.estado_cobranca_pix not null default 'pendente',
  copia_cola    text,
  qr_base64     text,
  expira_em     timestamptz,
  pago_em       timestamptz,
  mensagem      text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (tenant_id, txid)
);
comment on column public.cobrancas_pix.txid is 'Nosso identificador (idempotência no PSP e na conciliação).';
create index cobrancas_pix_tenant_idx on public.cobrancas_pix (tenant_id, criado_em desc);
create index cobrancas_pix_origem_idx on public.cobrancas_pix (tenant_id, origem, origem_id);

create trigger cobrancas_pix_atualizado_em
  before update on public.cobrancas_pix
  for each row execute function app.carimbar_atualizado_em();

-- O estado "pago" só chega pelo servidor (webhook ou consulta ao PSP): os
-- membros criam e cancelam, mas não marcam como pago.
grant select, insert on public.cobrancas_pix to authenticated;
grant update (estado) on public.cobrancas_pix to authenticated;
grant all on public.cobrancas_pix to service_role;

alter table public.cobrancas_pix enable row level security;
create policy "cobrancas_pix: membros e operadores"
  on public.cobrancas_pix for all to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
  with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));

create function app.cobranca_pix_so_cancela()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Quem não é o servidor só pode cancelar uma cobrança pendente.
  if current_user = 'authenticated' and not (old.estado = 'pendente' and new.estado = 'cancelado') then
    raise exception 'só se cancela uma cobrança pendente' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger cobrancas_pix_so_cancela
  before update of estado on public.cobrancas_pix
  for each row execute function app.cobranca_pix_so_cancela();

insert into app.migracoes (nome) values ('0017_pix.sql') on conflict (nome) do nothing;


-- #############################################################################
-- 0018_atomicidade_estoque.sql
-- #############################################################################

-- =============================================================================
-- 0018 — Estoque: operações compostas numa só transacção
--
-- 1. salvar_ficha: troca a ficha técnica inteira de uma vez (antes eram duas
--    chamadas; se a segunda falhasse, o produto ficava sem ficha).
-- 2. concluir_entrada: conclui a entrada e, se vier uma categoria, lança a
--    nota como UMA conta a pagar com uma parcela por duplicata, tudo junto.
--    Origem 'compra' + id da entrada: o índice titulos_origem_unica impede
--    lançar a mesma nota duas vezes.
-- Ambas security invoker: a RLS de quem chama continua a valer.
-- =============================================================================

create function public.salvar_ficha(p_tenant uuid, p_produto uuid, p_linhas jsonb)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  n integer;
begin
  if jsonb_typeof(p_linhas) <> 'array' then
    raise exception 'ficha inválida' using errcode = 'check_violation';
  end if;
  delete from public.fichas where tenant_id = p_tenant and produto_id = p_produto;
  insert into public.fichas (tenant_id, produto_id, insumo_id, quantidade)
  select p_tenant, p_produto, (l ->> 'insumo_id')::uuid, (l ->> 'quantidade')::numeric
  from jsonb_array_elements(p_linhas) l;
  get diagnostics n = row_count;
  return n;
end;
$$;

create function public.concluir_entrada(p_tenant uuid, p_entrada uuid, p_autor text, p_categoria uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  itens integer;
  e public.estoque_entradas;
  v_titulo uuid;
  parcelas integer := 0;
  hoje date := (now() at time zone 'America/Porto_Velho')::date;
begin
  itens := public.concluir_entrada_estoque(p_tenant, p_entrada, p_autor);
  if p_categoria is null then
    return jsonb_build_object('itens', itens, 'parcelas', 0);
  end if;

  select * into e from public.estoque_entradas where tenant_id = p_tenant and id = p_entrada;
  if not exists (
    select 1 from jsonb_array_elements(e.duplicatas) d
    where (d ->> 'valor')::numeric > 0 and (d ->> 'vencimento') ~ '^\d{4}-\d{2}-\d{2}$'
  ) then
    return jsonb_build_object('itens', itens, 'parcelas', 0);
  end if;

  insert into public.titulos (tenant_id, tipo, descricao, pessoa_id, categoria_id, origem, origem_id, competencia, documento)
  values (
    p_tenant, 'pagar',
    left('NF ' || coalesce(e.numero_nota, 's/n') || ' · ' || coalesce(e.fornecedor_nome, 'Fornecedor'), 120),
    e.fornecedor_id, p_categoria, 'compra', p_entrada,
    coalesce(e.emitida_em, hoje), left(e.numero_nota, 60)
  )
  on conflict (tenant_id, origem, origem_id) where origem_id is not null do nothing
  returning id into v_titulo;
  if v_titulo is null then
    return jsonb_build_object('itens', itens, 'parcelas', 0);
  end if;

  insert into public.parcelas (tenant_id, titulo_id, numero, vencimento, valor)
  select p_tenant, v_titulo, row_number() over (order by (d ->> 'vencimento')::date, ord), (d ->> 'vencimento')::date, round((d ->> 'valor')::numeric, 2)
  from jsonb_array_elements(e.duplicatas) with ordinality as x(d, ord)
  where (d ->> 'valor')::numeric > 0 and (d ->> 'vencimento') ~ '^\d{4}-\d{2}-\d{2}$';
  get diagnostics parcelas = row_count;

  return jsonb_build_object('itens', itens, 'parcelas', parcelas, 'titulo_id', v_titulo);
end;
$$;

revoke execute on function public.salvar_ficha(uuid, uuid, jsonb) from public, anon;
revoke execute on function public.concluir_entrada(uuid, uuid, text, uuid) from public, anon;
grant execute on function public.salvar_ficha(uuid, uuid, jsonb) to authenticated, service_role;
grant execute on function public.concluir_entrada(uuid, uuid, text, uuid) to authenticated, service_role;

insert into app.migracoes (nome) values ('0018_atomicidade_estoque.sql') on conflict (nome) do nothing;

commit;
