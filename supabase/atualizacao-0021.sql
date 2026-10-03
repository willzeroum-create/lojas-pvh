-- =============================================================================
-- ACTUALIZAÇÃO 0021 — 0021_fidelidade.sql
-- Para projectos com as migrações anteriores aplicadas. SQL Editor → colar → Run.
-- =============================================================================

begin;

-- =============================================================================
-- 0021 — Fidelidade: cashback
--
-- Cada compra concluída de um cliente identificado (no balcão com cliente, ou
-- no cardápio pelo WhatsApp) devolve uma % em crédito, que vence após N dias.
-- O livro de movimentos é só de acrescentar: crédito, resgate, estorno (a
-- compra foi cancelada), devolução (o cashback usado numa venda cancelada
-- volta) e ajuste manual com motivo. O saldo corre os movimentos pela ordem
-- do tempo e gasta primeiro o crédito que vence antes, como
-- `src/lib/dominio/fidelidade.ts`.
--
-- O resgate entra na mesma transacção da venda (registar_venda_com_cashback):
-- ou ficam os dois, ou nenhum.
-- =============================================================================

create table public.fidelidade_config (
  tenant_id          uuid primary key references public.tenants (id) on delete cascade,
  ativo              boolean not null default false,
  percentual         numeric(5, 2) not null default 5 check (percentual > 0 and percentual <= 50),
  validade_dias      integer not null default 90 check (validade_dias between 7 and 730),
  resgate_minimo     numeric(12, 2) not null default 5 check (resgate_minimo >= 0),
  limite_resgate_pct numeric(5, 2) not null default 50 check (limite_resgate_pct > 0 and limite_resgate_pct <= 100),
  atualizado_em      timestamptz not null default now()
);

create table public.fidelidade_movimentos (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  pessoa_id  uuid not null,
  tipo       text not null check (tipo in ('credito', 'devolucao', 'resgate', 'estorno', 'ajuste')),
  valor      numeric(12, 2) not null check (valor <> 0),
  pedido_id  uuid,
  expira_em  date,
  autor      text,
  motivo     text check (motivo is null or length(motivo) <= 200),
  criado_em  timestamptz not null default now(),
  foreign key (pessoa_id, tenant_id) references public.pessoas (id, tenant_id) on delete cascade,
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id) on delete set null (pedido_id),
  check ((tipo in ('credito', 'devolucao')) = (expira_em is not null)),
  check ((tipo in ('credito', 'devolucao') and valor > 0) or (tipo in ('resgate', 'estorno') and valor < 0) or tipo = 'ajuste'),
  check (tipo <> 'ajuste' or motivo is not null)
);
comment on table public.fidelidade_movimentos is 'Livro do cashback (só acrescenta). Saldo: public.saldo_cashback.';
create unique index fidelidade_um_por_pedido on public.fidelidade_movimentos (tenant_id, pedido_id, tipo) where pedido_id is not null;
create index fidelidade_pessoa_idx on public.fidelidade_movimentos (tenant_id, pessoa_id, criado_em);

-- -----------------------------------------------------------------------------
-- Saldo (FIFO por vencimento, pela ordem do tempo)
-- -----------------------------------------------------------------------------
create function public.saldo_cashback(p_tenant uuid, p_pessoa uuid, p_dia date default null, p_sem_pedido uuid default null)
returns numeric
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  dia date := coalesce(p_dia, (now() at time zone 'America/Porto_Velho')::date);
  restante numeric[] := '{}';
  expira date[] := '{}';
  m record;
  i bigint;
  falta numeric;
  usado numeric;
  total numeric := 0;
begin
  for m in
    select f.valor, f.expira_em, (f.criado_em at time zone 'America/Porto_Velho')::date as em,
           (f.tipo in ('credito', 'devolucao') or (f.tipo = 'ajuste' and f.valor > 0)) as credita
      from public.fidelidade_movimentos f
     where f.tenant_id = p_tenant and f.pessoa_id = p_pessoa
       and (p_sem_pedido is null or f.pedido_id is distinct from p_sem_pedido)
     order by em, credita desc, f.criado_em
  loop
    if m.credita then
      restante := restante || abs(m.valor);
      expira := expira || coalesce(m.expira_em, '9999-12-31'::date);
    else
      falta := abs(m.valor);
      for i in select u.idx from unnest(expira) with ordinality as u(e, idx) order by u.e, u.idx loop
        exit when falta <= 0;
        continue when expira[i] < m.em or restante[i] <= 0;
        usado := least(restante[i], falta);
        restante[i] := restante[i] - usado;
        falta := falta - usado;
      end loop;
    end if;
  end loop;
  for i in 1 .. coalesce(array_length(restante, 1), 0) loop
    if expira[i] >= dia then
      total := total + restante[i];
    end if;
  end loop;
  return round(total, 2);
end;
$$;

-- Programa em vigor: configuração ligada e módulo ligado no console.
create function app.cashback_em_vigor(p_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.fidelidade_config c where c.tenant_id = p_tenant and c.ativo)
     and exists (select 1 from public.tenant_modulos m where m.tenant_id = p_tenant and m.modulo = 'fidelidade' and m.ativo)
$$;

-- -----------------------------------------------------------------------------
-- Crédito ao concluir; estorno e devolução ao cancelar
-- -----------------------------------------------------------------------------
create function app.cashback_do_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cfg public.fidelidade_config;
  hoje date := (now() at time zone 'America/Porto_Velho')::date;
  v numeric;
begin
  if new.cliente_id is null then
    return null;
  end if;
  select * into cfg from public.fidelidade_config where tenant_id = new.tenant_id;

  if new.status = 'concluido' and (tg_op = 'INSERT' or old.status is distinct from 'concluido') then
    if app.cashback_em_vigor(new.tenant_id) then
      v := floor((new.total - new.taxa_entrega) * cfg.percentual) / 100;
      if v > 0 then
        insert into public.fidelidade_movimentos (tenant_id, pessoa_id, tipo, valor, pedido_id, expira_em)
        values (new.tenant_id, new.cliente_id, 'credito', v, new.id, hoje + cfg.validade_dias)
        on conflict do nothing;
      end if;
    end if;
  elsif tg_op = 'UPDATE' and new.status = 'cancelado' and old.status = 'concluido' then
    select valor into v from public.fidelidade_movimentos where tenant_id = new.tenant_id and pedido_id = new.id and tipo = 'credito';
    if v is not null then
      insert into public.fidelidade_movimentos (tenant_id, pessoa_id, tipo, valor, pedido_id, motivo)
      values (new.tenant_id, new.cliente_id, 'estorno', -v, new.id, 'Compra cancelada')
      on conflict do nothing;
    end if;
    select -valor into v from public.fidelidade_movimentos where tenant_id = new.tenant_id and pedido_id = new.id and tipo = 'resgate';
    if v is not null then
      insert into public.fidelidade_movimentos (tenant_id, pessoa_id, tipo, valor, pedido_id, expira_em, motivo)
      values (new.tenant_id, new.cliente_id, 'devolucao', v, new.id, hoje + coalesce(cfg.validade_dias, 90), 'Compra cancelada')
      on conflict do nothing;
    end if;
  end if;
  return null;
end;
$$;

create trigger pedidos_cashback
  after insert or update of status on public.pedidos
  for each row execute function app.cashback_do_pedido();

-- -----------------------------------------------------------------------------
-- Resgate (dentro da venda)
-- -----------------------------------------------------------------------------
create function app.lancar_resgate_cashback(p_tenant uuid, p_pessoa uuid, p_valor numeric, p_pedido uuid, p_compra numeric, p_autor text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cfg public.fidelidade_config;
  saldo numeric;
begin
  -- Numa função security definer, current_user é o dono: o papel de quem chama está em `role`.
  if not (coalesce(current_setting('role', true), 'none') in ('service_role', 'none')
          or p_tenant in (select app.tenants_do_utilizador()) or (select app.e_operador())) then
    raise exception 'sem acesso' using errcode = 'insufficient_privilege';
  end if;
  select * into cfg from public.fidelidade_config where tenant_id = p_tenant;
  if not app.cashback_em_vigor(p_tenant) then
    raise exception 'o cashback não está ligado' using errcode = 'check_violation';
  end if;
  -- Um resgate de cada vez por cliente (dois caixas ao mesmo tempo).
  perform pg_advisory_xact_lock(hashtextextended(p_pessoa::text, 0));
  -- O crédito que esta mesma compra acabou de dar não conta para pagá-la.
  saldo := public.saldo_cashback(p_tenant, p_pessoa, null, p_pedido);
  if saldo < cfg.resgate_minimo then
    raise exception 'saldo de cashback abaixo do mínimo para usar' using errcode = 'check_violation';
  end if;
  if p_valor > saldo then
    raise exception 'cashback maior que o saldo (%)', saldo using errcode = 'check_violation';
  end if;
  if p_valor > round(p_compra * cfg.limite_resgate_pct / 100, 2) then
    raise exception 'cashback acima do limite de % %% da compra', cfg.limite_resgate_pct using errcode = 'check_violation';
  end if;
  insert into public.fidelidade_movimentos (tenant_id, pessoa_id, tipo, valor, pedido_id, autor)
  values (p_tenant, p_pessoa, 'resgate', -p_valor, p_pedido, p_autor);
end;
$$;

-- Venda de balcão com parte paga em cashback (que entra como desconto).
create function public.registar_venda_com_cashback(p jsonb)
returns public.pedidos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v numeric := round(coalesce((p ->> 'cashback')::numeric, 0), 2);
  novo public.pedidos;
begin
  if v < 0 then
    raise exception 'cashback inválido' using errcode = 'check_violation';
  end if;
  if v > 0 and coalesce((p ->> 'desconto')::numeric, 0) < v then
    raise exception 'o cashback entra no desconto da venda' using errcode = 'check_violation';
  end if;
  novo := public.registar_venda_balcao(p);
  if v > 0 then
    if novo.cliente_id is null then
      raise exception 'identifique o cliente para usar o cashback' using errcode = 'check_violation';
    end if;
    perform app.lancar_resgate_cashback(novo.tenant_id, novo.cliente_id, v, novo.id, novo.total + v, p ->> 'autor');
  end if;
  return novo;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões
-- -----------------------------------------------------------------------------
grant select, insert, update (ativo, percentual, validade_dias, resgate_minimo, limite_resgate_pct, atualizado_em) on public.fidelidade_config to authenticated;
grant select on public.fidelidade_movimentos to authenticated;
grant all on public.fidelidade_config to service_role;
-- O livro não se altera nem se apaga, nem pelo servidor.
grant select, insert on public.fidelidade_movimentos to service_role;

revoke execute on function app.lancar_resgate_cashback(uuid, uuid, numeric, uuid, numeric, text) from public, anon;
grant execute on function app.lancar_resgate_cashback(uuid, uuid, numeric, uuid, numeric, text) to authenticated, service_role;
revoke execute on function public.saldo_cashback(uuid, uuid, date, uuid) from public, anon;
grant execute on function public.saldo_cashback(uuid, uuid, date, uuid) to authenticated, service_role;
revoke execute on function public.registar_venda_com_cashback(jsonb) from public, anon;
grant execute on function public.registar_venda_com_cashback(jsonb) to authenticated, service_role;

alter table public.fidelidade_config enable row level security;
alter table public.fidelidade_movimentos enable row level security;
create policy "fidelidade_config: membros e operadores"
  on public.fidelidade_config for all to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
  with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));
create policy "fidelidade_movimentos: membros e operadores lêem"
  on public.fidelidade_movimentos for select to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));

insert into app.migracoes (nome) values ('0021_fidelidade.sql') on conflict (nome) do nothing;

commit;
