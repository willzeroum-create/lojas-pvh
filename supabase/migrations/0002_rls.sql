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
