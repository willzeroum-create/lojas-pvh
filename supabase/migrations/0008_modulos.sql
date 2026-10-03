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
