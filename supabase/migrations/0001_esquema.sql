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
