-- =============================================================================
-- ACTUALIZAÇÃO 0015 — 0015_equipe.sql
-- Para projectos com as migrações anteriores aplicadas. SQL Editor → colar → Run.
-- =============================================================================

begin;

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

commit;
