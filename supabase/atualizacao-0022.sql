-- =============================================================================
-- ACTUALIZAÇÃO 0022 — 0022_delivery.sql
-- Para projectos com as migrações anteriores aplicadas. SQL Editor → colar → Run.
-- =============================================================================

begin;

-- =============================================================================
-- 0022 — Delivery próprio
--
-- Zonas por bairro (taxa e tempo; lidas pela página pública), entregadores
-- (cada um com um link secreto para marcar as entregas no celular, sem conta),
-- e uma entrega por pedido de entrega, criada sozinha quando o módulo está
-- ligado. Entregue → o pedido fica concluído. O código da entrega dá ao
-- cliente um link de acompanhamento sem dados pessoais.
-- =============================================================================

create type public.estado_entrega as enum ('aguardando', 'em_rota', 'entregue', 'nao_entregue');

create table public.delivery_zonas (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  nome       text not null check (length(nome) between 1 and 80),
  chave      text not null check (chave ~ '^[a-z0-9 ]{1,80}$'),
  taxa       numeric(10, 2) not null default 0 check (taxa >= 0 and taxa <= 500),
  tempo_min  integer not null default 40 check (tempo_min between 5 and 240),
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now(),
  unique (tenant_id, chave)
);
comment on column public.delivery_zonas.chave is 'Bairro normalizado (sem acentos, minúsculas): src/lib/dominio/delivery.ts chaveBairro.';

create table public.entregadores (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  nome          text not null check (length(nome) between 1 and 60),
  whatsapp      text check (whatsapp is null or whatsapp ~ '^[0-9]{12,13}$'),
  repasse       numeric(10, 2) not null default 0 check (repasse >= 0 and repasse <= 500),
  ativo         boolean not null default true,
  token_acesso  text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  criado_em     timestamptz not null default now(),
  unique (id, tenant_id),
  unique (tenant_id, nome)
);
comment on column public.entregadores.token_acesso is 'Link secreto do entregador (/entregador/{token}). Nunca exposto ao authenticated; trocar = revogar o link.';

create table public.entregas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  pedido_id      uuid not null,
  entregador_id  uuid,
  estado         public.estado_entrega not null default 'aguardando',
  codigo         text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  repasse        numeric(10, 2) not null default 0 check (repasse >= 0),
  saiu_em        timestamptz,
  entregue_em    timestamptz,
  ocorrencia     text check (ocorrencia is null or length(ocorrencia) <= 200),
  acertado_em    timestamptz,
  criado_em      timestamptz not null default now(),
  unique (id, tenant_id),
  unique (tenant_id, pedido_id),
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id) on delete cascade,
  foreign key (entregador_id, tenant_id) references public.entregadores (id, tenant_id) on delete set null (entregador_id)
);
create index entregas_estado_idx on public.entregas (tenant_id, estado, criado_em desc);
create index entregas_entregador_idx on public.entregas (tenant_id, entregador_id, entregue_em);

-- Pedido de entrega com o módulo ligado → entrega aguardando entregador.
create function app.entrega_do_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.tipo_entrega = 'entrega'
     and exists (select 1 from public.tenant_modulos m where m.tenant_id = new.tenant_id and m.modulo = 'delivery' and m.ativo) then
    insert into public.entregas (tenant_id, pedido_id) values (new.tenant_id, new.id) on conflict do nothing;
  end if;
  return null;
end;
$$;

create trigger pedidos_entrega
  after insert on public.pedidos
  for each row execute function app.entrega_do_pedido();

-- Estados só andam pelas transições válidas; entregue é final.
create function app.entrega_transicao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.estado is distinct from old.estado and not (
       (old.estado = 'aguardando' and new.estado = 'em_rota')
    or (old.estado = 'em_rota' and new.estado in ('entregue', 'nao_entregue', 'aguardando'))
    or (old.estado = 'nao_entregue' and new.estado in ('em_rota', 'aguardando'))
  ) then
    raise exception 'entrega não pode passar de % para %', old.estado, new.estado using errcode = 'check_violation';
  end if;
  if new.acertado_em is not null and new.estado <> 'entregue' then
    raise exception 'só se acerta entrega concluída' using errcode = 'check_violation';
  end if;
  if old.acertado_em is not null and (new.repasse <> old.repasse or new.acertado_em is distinct from old.acertado_em) then
    raise exception 'entrega já acertada' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger entregas_transicao
  before update on public.entregas
  for each row execute function app.entrega_transicao();

-- Despachar: escolhe o entregador e marca a saída (repasse do entregador).
create function public.despachar_entrega(p_tenant uuid, p_entrega uuid, p_entregador uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_repasse numeric;
  st public.pedido_status;
begin
  -- Só as colunas que o painel pode ler (o token do entregador não).
  select repasse into v_repasse from public.entregadores where tenant_id = p_tenant and id = p_entregador and ativo;
  if not found then raise exception 'entregador não encontrado' using errcode = 'no_data_found'; end if;
  select p.status into st from public.entregas e join public.pedidos p on p.id = e.pedido_id where e.tenant_id = p_tenant and e.id = p_entrega;
  if not found then raise exception 'entrega não encontrada' using errcode = 'no_data_found'; end if;
  if st = 'cancelado' then raise exception 'o pedido foi cancelado' using errcode = 'check_violation'; end if;
  update public.entregas
     set entregador_id = p_entregador, estado = 'em_rota', saiu_em = now(), repasse = v_repasse, ocorrencia = null
   where tenant_id = p_tenant and id = p_entrega;
end;
$$;

-- Concluir: entregue (o pedido fica concluído) ou não entregue (com ocorrência).
create function public.concluir_entrega(p_tenant uuid, p_entrega uuid, p_entregue boolean, p_ocorrencia text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  e public.entregas;
begin
  select * into e from public.entregas where tenant_id = p_tenant and id = p_entrega for update;
  if not found then raise exception 'entrega não encontrada' using errcode = 'no_data_found'; end if;
  if not p_entregue and coalesce(trim(p_ocorrencia), '') = '' then
    raise exception 'diga o que aconteceu' using errcode = 'check_violation';
  end if;
  update public.entregas
     set estado = case when p_entregue then 'entregue' else 'nao_entregue' end::public.estado_entrega,
         entregue_em = case when p_entregue then now() end,
         ocorrencia = nullif(trim(p_ocorrencia), '')
   where id = e.id;
  if p_entregue then
    update public.pedidos set status = 'concluido'
     where tenant_id = p_tenant and id = e.pedido_id and status in ('novo', 'aceite', 'pronto');
  end if;
end;
$$;

-- Acerto: fecha o que se deve ao entregador até agora. Devolve quantidade e valor.
create function public.acertar_entregador(p_tenant uuid, p_entregador uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  n integer;
  v numeric;
begin
  with acertadas as (
    update public.entregas set acertado_em = now()
     where tenant_id = p_tenant and entregador_id = p_entregador and estado = 'entregue' and acertado_em is null
    returning repasse
  )
  select count(*), coalesce(sum(repasse), 0) into n, v from acertadas;
  return jsonb_build_object('quantidade', n, 'valor', v);
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões
-- -----------------------------------------------------------------------------
grant select, insert, update (nome, chave, taxa, tempo_min, ativo), delete on public.delivery_zonas to authenticated;
-- A página pública lê as zonas activas (nome, taxa, tempo) para calcular a entrega.
grant select (id, tenant_id, nome, chave, taxa, tempo_min, ativo) on public.delivery_zonas to anon;
grant select (id, tenant_id, nome, whatsapp, repasse, ativo, criado_em), insert (tenant_id, nome, whatsapp, repasse, ativo),
      update (nome, whatsapp, repasse, ativo) on public.entregadores to authenticated;
grant select, update (entregador_id, estado, saiu_em, entregue_em, ocorrencia, repasse, acertado_em) on public.entregas to authenticated;
grant all on public.delivery_zonas, public.entregadores to service_role;
grant select, insert, update on public.entregas to service_role;

revoke execute on function public.despachar_entrega(uuid, uuid, uuid) from public, anon;
revoke execute on function public.concluir_entrega(uuid, uuid, boolean, text) from public, anon;
revoke execute on function public.acertar_entregador(uuid, uuid) from public, anon;
grant execute on function public.despachar_entrega(uuid, uuid, uuid) to authenticated, service_role;
grant execute on function public.concluir_entrega(uuid, uuid, boolean, text) to authenticated, service_role;
grant execute on function public.acertar_entregador(uuid, uuid) to authenticated, service_role;

alter table public.delivery_zonas enable row level security;
alter table public.entregadores enable row level security;
alter table public.entregas enable row level security;

create policy "delivery_zonas: membros e operadores"
  on public.delivery_zonas for all to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
  with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));
create policy "delivery_zonas: público lê as activas"
  on public.delivery_zonas for select to anon
  using (ativo);
create policy "entregadores: membros e operadores"
  on public.entregadores for all to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
  with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));
create policy "entregas: membros e operadores"
  on public.entregas for all to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
  with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));

insert into app.migracoes (nome) values ('0022_delivery.sql') on conflict (nome) do nothing;

commit;
