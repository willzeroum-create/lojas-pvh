-- =============================================================================
-- REINSTALAÇÃO DO ZERO — gerado em 2026-10-03 por scripts/gerar-sql-completo.mjs
--
-- Como usar: Supabase Dashboard → SQL Editor → New query → colar tudo → Run.
-- Corre numa transacção só: ou aplica tudo, ou nada.
--
-- ATENÇÃO: apaga todas as tabelas da plataforma antes de instalar. Usar só num
-- projecto novo ou numa instalação que ficou a meio. Nunca com dados reais.
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
-- =============================================================================

begin;

-- =============================================================================
-- LIMPEZA: apaga tudo o que é da plataforma. Não toca em auth.users nem em
-- objectos do Supabase; só nas nossas tabelas, tipos, funções e políticas.
-- Usado por reinstalar-do-zero.sql e por `pnpm migrar --do-zero`.
-- =============================================================================
drop policy if exists "arquivos: operadores lêem" on storage.objects;
drop policy if exists "arquivos: operadores enviam" on storage.objects;
drop policy if exists "arquivos: operadores substituem" on storage.objects;
drop policy if exists "arquivos: operadores apagam" on storage.objects;
drop policy if exists "fotos: leitura pública" on storage.objects;
drop policy if exists "fotos: tenant envia" on storage.objects;
drop policy if exists "fotos: tenant substitui" on storage.objects;
drop policy if exists "fotos: tenant apaga" on storage.objects;

drop table if exists
  public.consentimentos, public.pessoa_enderecos, public.pessoas,
  public.tenant_modulos,
  public.arquivos, public.notas_internas, public.cadeia_registos, public.cadeia_etapas,
  public.fichas, public.insumos, public.tenant_onboarding,
  public.itens_pedido, public.pedidos, public.opcoes, public.grupos_opcao,
  public.produtos, public.categorias, public.lojas,
  public.membros, public.operadores, public.tenants
  cascade;

drop function if exists public.criar_pedido(jsonb);
drop function if exists public.anonimizar_pedidos(integer);
drop function if exists public.anonimizar_pessoa(uuid, uuid);

drop type if exists public.tipo_pessoa;
drop type if exists public.cadeia_estado;
drop type if exists public.etapa_onboarding;
drop type if exists public.forma_pagamento;
drop type if exists public.tipo_entrega;
drop type if exists public.pedido_status;
drop type if exists public.canal_pedido;
drop type if exists public.papel_membro;
drop type if exists public.tenant_status;

drop schema if exists app cascade;

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
--   • CPF ou CNPJ só com dígitos, único por tenant quando informado.
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
  documento       text check (documento is null or documento ~ '^([0-9]{11}|[0-9]{14})$'),
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
comment on column public.pessoas.documento is 'CPF (11) ou CNPJ (14), só dígitos, validado na aplicação.';

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

commit;
