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
