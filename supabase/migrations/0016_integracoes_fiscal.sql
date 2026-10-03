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
