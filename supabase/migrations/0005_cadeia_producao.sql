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
