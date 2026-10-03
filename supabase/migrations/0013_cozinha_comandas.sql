-- =============================================================================
-- 0013 — Cozinha (módulo `cozinha`) e mesas/comandas (módulo `comandas`)
--
-- Cozinha: cada categoria pode ir para uma estação (cozinha, bar, chapa). Os
-- itens dessas categorias entram na tela da estação, de qualquer canal, com
-- estado de preparo próprio. Quando todos os itens de preparo de um pedido
-- ficam prontos, o pedido passa a `pronto`.
--
-- Comandas: a comanda é um pedido do canal `mesa` aberto na hora; os itens
-- entram aos poucos (e vão logo para a cozinha); o total recalcula-se sozinho;
-- fecha no caixa aberto, com taxa de serviço opcional e pagamento dividido.
-- Item já em preparo não se apaga: cancela-se com motivo.
-- =============================================================================

alter type public.canal_pedido add value if not exists 'mesa';

create type public.estado_preparo as enum ('aguardando', 'em_preparo', 'pronto', 'entregue', 'cancelado');
create type public.estado_comanda as enum ('aberta', 'conta', 'fechada', 'cancelada');

-- -----------------------------------------------------------------------------
-- Estações de preparo
-- -----------------------------------------------------------------------------
create table public.estacoes (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  nome       text not null check (length(nome) between 1 and 40),
  ordem      integer not null default 0,
  alerta_min integer not null default 15 check (alerta_min between 1 and 240),
  ativa      boolean not null default true,
  unique (id, tenant_id),
  unique (tenant_id, nome)
);
comment on column public.estacoes.alerta_min is 'Minutos de espera a partir dos quais o cartão fica em alerta.';

create table public.estacao_categorias (
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  categoria_id  uuid not null,
  estacao_id    uuid not null,
  primary key (categoria_id),
  foreign key (categoria_id, tenant_id) references public.categorias (id, tenant_id) on delete cascade,
  foreign key (estacao_id, tenant_id) references public.estacoes (id, tenant_id) on delete cascade
);
comment on table public.estacao_categorias is 'Para que estação vai cada categoria. Categoria sem estação não passa pela cozinha.';

alter table public.itens_pedido add column estacao_id uuid;
alter table public.itens_pedido add column preparo public.estado_preparo;
alter table public.itens_pedido add column preparo_iniciado_em timestamptz;
alter table public.itens_pedido add column pronto_em timestamptz;
alter table public.itens_pedido add column entregue_em timestamptz;
alter table public.itens_pedido add column cancelado_motivo text check (cancelado_motivo is null or length(cancelado_motivo) <= 200);
alter table public.itens_pedido add column criado_em timestamptz not null default now();
alter table public.itens_pedido
  add constraint itens_pedido_estacao_fkey foreign key (estacao_id, tenant_id) references public.estacoes (id, tenant_id);
create index itens_pedido_cozinha_idx on public.itens_pedido (tenant_id, estacao_id, preparo) where preparo in ('aguardando', 'em_preparo', 'pronto');
comment on column public.itens_pedido.preparo is 'Null = item que não passa pela cozinha.';

alter table public.itens_pedido replica identity full;
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.itens_pedido;
  end if;
end;
$$;

-- O item vai para a estação da sua categoria.
create function app.item_para_estacao()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.estacao_id is null and new.produto_id is not null then
    select ec.estacao_id into new.estacao_id
      from public.produtos p
      join public.estacao_categorias ec on ec.categoria_id = p.categoria_id
      join public.estacoes e on e.id = ec.estacao_id and e.ativa
     where p.id = new.produto_id;
  end if;
  if new.estacao_id is not null and new.preparo is null then
    new.preparo := 'aguardando';
  end if;
  return new;
end;
$$;

create trigger itens_pedido_estacao
  before insert on public.itens_pedido
  for each row execute function app.item_para_estacao();

-- Transições de preparo, carimbos de hora e cancelamento com motivo.
create function app.item_preparo_transicao()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.preparo is not distinct from old.preparo then
    return new;
  end if;
  if old.preparo is null then
    raise exception 'este item não passa pela cozinha' using errcode = 'check_violation';
  end if;
  if not (
    (old.preparo = 'aguardando' and new.preparo in ('em_preparo', 'pronto', 'cancelado')) or
    (old.preparo = 'em_preparo' and new.preparo in ('pronto', 'aguardando', 'cancelado')) or
    (old.preparo = 'pronto' and new.preparo in ('entregue', 'em_preparo', 'cancelado'))
  ) then
    raise exception 'o item não pode passar de % para %', old.preparo, new.preparo using errcode = 'check_violation';
  end if;
  if new.preparo = 'cancelado' and coalesce(trim(new.cancelado_motivo), '') = '' then
    raise exception 'informe o motivo do cancelamento do item' using errcode = 'check_violation';
  end if;
  if new.preparo = 'em_preparo' then new.preparo_iniciado_em := coalesce(new.preparo_iniciado_em, now()); end if;
  if new.preparo = 'pronto' then new.pronto_em := now(); end if;
  if new.preparo = 'entregue' then new.entregue_em := now(); end if;
  return new;
end;
$$;

create trigger itens_pedido_preparo
  before update of preparo on public.itens_pedido
  for each row execute function app.item_preparo_transicao();

-- Pedido pronto quando todos os itens de preparo estão prontos (ou entregues/cancelados).
create function app.pedido_pronto_pela_cozinha()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.preparo in ('pronto', 'entregue', 'cancelado') and not exists (
    select 1 from public.itens_pedido i
     where i.pedido_id = new.pedido_id and i.preparo in ('aguardando', 'em_preparo')
  ) then
    update public.pedidos set status = 'pronto'
     where id = new.pedido_id and status in ('novo', 'aceite') and canal <> 'mesa';
  end if;
  return null;
end;
$$;

create trigger itens_pedido_pedido_pronto
  after update of preparo on public.itens_pedido
  for each row execute function app.pedido_pronto_pela_cozinha();

-- -----------------------------------------------------------------------------
-- Mesas e comandas
-- -----------------------------------------------------------------------------
create table public.mesas (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  loja_id     uuid not null,
  numero      integer not null check (numero between 1 and 9999),
  area        text check (area is null or length(area) <= 40),
  lugares     integer not null default 4 check (lugares between 1 and 99),
  ativa       boolean not null default true,
  unique (id, tenant_id),
  unique (tenant_id, loja_id, numero),
  foreign key (loja_id, tenant_id) references public.lojas (id, tenant_id) on delete cascade
);

alter table public.pedidos add column taxa_servico numeric(10, 2) not null default 0 check (taxa_servico >= 0);

create table public.comandas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  loja_id        uuid not null,
  mesa_id        uuid,
  pedido_id      uuid not null,
  identificador  text check (identificador is null or length(identificador) <= 30),
  pessoas        integer not null default 1 check (pessoas between 1 and 99),
  garcom_nome    text,
  estado         public.estado_comanda not null default 'aberta',
  aberta_em      timestamptz not null default now(),
  fechada_em     timestamptz,
  unique (id, tenant_id),
  unique (pedido_id),
  foreign key (loja_id, tenant_id) references public.lojas (id, tenant_id),
  foreign key (mesa_id, tenant_id) references public.mesas (id, tenant_id),
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id) on delete cascade,
  check (mesa_id is not null or identificador is not null)
);
comment on column public.comandas.identificador is 'Comanda individual (cartão ou pulseira) quando não há mesa.';
create unique index comandas_uma_aberta_por_mesa on public.comandas (tenant_id, mesa_id) where estado in ('aberta', 'conta') and mesa_id is not null;
create index comandas_abertas_idx on public.comandas (tenant_id, estado);

alter table public.comandas replica identity full;
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.comandas;
  end if;
end;
$$;

-- Abrir: cria o pedido do canal `mesa` e a comanda.
create function public.abrir_comanda(p_tenant uuid, p_loja uuid, p_mesa uuid, p_identificador text, p_pessoas integer, p_garcom text)
returns public.comandas
language plpgsql
security invoker
set search_path = ''
as $$
declare
  ped public.pedidos;
  nova public.comandas;
begin
  insert into public.pedidos (tenant_id, loja_id, canal, tipo_entrega, subtotal, total, forma_pagamento, status, cliente_nome)
  values (p_tenant, p_loja, 'mesa', 'retirada', 0, 0, 'dinheiro', 'aceite',
          coalesce((select 'Mesa ' || m.numero from public.mesas m where m.id = p_mesa), 'Comanda ' || p_identificador))
  returning * into ped;

  insert into public.comandas (tenant_id, loja_id, mesa_id, pedido_id, identificador, pessoas, garcom_nome)
  values (p_tenant, p_loja, p_mesa, ped.id, nullif(trim(p_identificador), ''), coalesce(p_pessoas, 1), p_garcom)
  returning * into nova;
  return nova;
end;
$$;

-- Total da comanda: soma dos itens não cancelados.
create function app.recalcular_comanda()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pid uuid := coalesce(new.pedido_id, old.pedido_id);
  soma numeric(10, 2);
begin
  if not exists (select 1 from public.pedidos where id = pid and canal = 'mesa' and status <> 'concluido') then
    return null;
  end if;
  select coalesce(sum(total), 0) into soma from public.itens_pedido
   where pedido_id = pid and preparo is distinct from 'cancelado';
  update public.pedidos set subtotal = soma, total = greatest(soma - desconto, 0) + taxa_servico where id = pid;
  return null;
end;
$$;

create trigger itens_pedido_comanda
  after insert or update or delete on public.itens_pedido
  for each row execute function app.recalcular_comanda();

-- Itens de uma comanda aberta: não entram em comanda fechada; já em preparo não se apagam.
create function app.itens_da_comanda()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  est public.estado_comanda;
begin
  select c.estado into est from public.comandas c where c.pedido_id = coalesce(new.pedido_id, old.pedido_id);
  if est is null then
    return coalesce(new, old);
  end if;
  if est not in ('aberta', 'conta') then
    raise exception 'a comanda já foi fechada' using errcode = 'check_violation';
  end if;
  if tg_op = 'DELETE' and old.preparo in ('em_preparo', 'pronto', 'entregue') then
    raise exception 'item já na cozinha: cancele com motivo' using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger itens_pedido_da_comanda
  before insert or delete on public.itens_pedido
  for each row execute function app.itens_da_comanda();

-- Fechar a conta no caixa aberto: taxa de serviço, desconto, pagamentos (dividido).
create function public.fechar_comanda(p jsonb)
returns public.pedidos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  com public.comandas;
  ped public.pedidos;
  sessao public.caixa_sessoes;
  pag jsonb;
  pago numeric(12, 2) := 0;
  troco numeric(12, 2) := 0;
  v_total numeric(12, 2);
  forma_principal text;
begin
  select * into com from public.comandas where tenant_id = (p ->> 'tenant_id')::uuid and id = (p ->> 'comanda_id')::uuid;
  if not found then raise exception 'comanda não encontrada' using errcode = 'no_data_found'; end if;
  if com.estado not in ('aberta', 'conta') then raise exception 'a comanda já foi fechada' using errcode = 'check_violation'; end if;
  select * into sessao from public.caixa_sessoes where tenant_id = com.tenant_id and loja_id = com.loja_id and estado = 'aberta';
  if not found then raise exception 'abra o caixa antes de fechar a conta' using errcode = 'check_violation'; end if;
  if exists (select 1 from public.itens_pedido where pedido_id = com.pedido_id and preparo in ('aguardando', 'em_preparo')) then
    raise exception 'há itens ainda na cozinha' using errcode = 'check_violation';
  end if;

  update public.pedidos
     set taxa_servico = coalesce((p ->> 'taxa_servico')::numeric, 0),
         desconto = coalesce((p ->> 'desconto')::numeric, 0)
   where id = com.pedido_id;
  select * into ped from public.pedidos where id = com.pedido_id;
  v_total := greatest(ped.subtotal - ped.desconto, 0) + ped.taxa_servico;
  if v_total <= 0 then raise exception 'comanda sem itens' using errcode = 'check_violation'; end if;

  for pag in select * from jsonb_array_elements(p -> 'pagamentos') loop
    pago := pago + (pag ->> 'valor')::numeric;
    troco := troco + coalesce((pag ->> 'troco')::numeric, 0);
  end loop;
  if pago - troco <> v_total then
    raise exception 'pagamentos (%) não fecham com o total (%)', pago - troco, v_total using errcode = 'check_violation';
  end if;

  select e ->> 'forma' into forma_principal from jsonb_array_elements(p -> 'pagamentos') as e
   order by (e ->> 'valor')::numeric desc limit 1;

  for pag in select * from jsonb_array_elements(p -> 'pagamentos') loop
    insert into public.pagamentos_pedido (tenant_id, pedido_id, forma, valor, troco)
    values (com.tenant_id, com.pedido_id, (pag ->> 'forma')::public.forma_recebimento, (pag ->> 'valor')::numeric, coalesce((pag ->> 'troco')::numeric, 0));
    if (pag ->> 'valor')::numeric - coalesce((pag ->> 'troco')::numeric, 0) > 0 then
      insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor, pedido_id, autor_nome)
      values (com.tenant_id, sessao.id, 'venda', (pag ->> 'forma')::public.forma_recebimento,
              (pag ->> 'valor')::numeric - coalesce((pag ->> 'troco')::numeric, 0), com.pedido_id, p ->> 'autor_nome');
    end if;
  end loop;

  update public.itens_pedido set preparo = 'entregue' where pedido_id = com.pedido_id and preparo = 'pronto';
  update public.pedidos
     set status = 'concluido', total = v_total, caixa_sessao_id = sessao.id,
         forma_pagamento = case when forma_principal in ('cartao_debito', 'cartao_credito') then 'cartao'
                                when forma_principal = 'pix' then 'pix' else 'dinheiro' end::public.forma_pagamento
   where id = com.pedido_id
  returning * into ped;
  update public.comandas set estado = 'fechada', fechada_em = now() where id = com.id;
  return ped;
end;
$$;

-- Juntar a comanda B na A (mesas juntas): os itens passam para A e B é cancelada.
create function public.juntar_comandas(p_tenant uuid, p_destino uuid, p_origem uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a public.comandas;
  b public.comandas;
begin
  select * into a from public.comandas where tenant_id = p_tenant and id = p_destino;
  select * into b from public.comandas where tenant_id = p_tenant and id = p_origem;
  if a.id is null or b.id is null or a.id = b.id then raise exception 'comandas inválidas' using errcode = 'check_violation'; end if;
  if a.estado not in ('aberta', 'conta') or b.estado not in ('aberta', 'conta') then
    raise exception 'só se juntam comandas abertas' using errcode = 'check_violation';
  end if;
  update public.itens_pedido set pedido_id = a.pedido_id where pedido_id = b.pedido_id;
  update public.comandas set pessoas = a.pessoas + b.pessoas where id = a.id;
  update public.comandas set estado = 'cancelada', fechada_em = now() where id = b.id;
  update public.pedidos set status = 'cancelado', cancelado_motivo = 'Juntada à comanda ' || coalesce(a.identificador, a.id::text) where id = b.pedido_id;
  -- Recalcula os dois totais.
  update public.pedidos set subtotal = (select coalesce(sum(total), 0) from public.itens_pedido where pedido_id = a.pedido_id and preparo is distinct from 'cancelado') where id = a.pedido_id;
  update public.pedidos set total = greatest(subtotal - desconto, 0) + taxa_servico where id = a.pedido_id;
  update public.pedidos set subtotal = 0, total = 0 where id = b.pedido_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Estação de partida (idempotente)
-- -----------------------------------------------------------------------------
create function public.cozinha_padrao(p_tenant uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.estacoes (tenant_id, nome, ordem) values (p_tenant, 'Cozinha', 1), (p_tenant, 'Bar', 2)
  on conflict (tenant_id, nome) do nothing;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.estacoes, public.estacao_categorias, public.mesas to authenticated;
grant select, insert on public.comandas to authenticated;
grant update (mesa_id, pessoas, garcom_nome, estado, fechada_em) on public.comandas to authenticated;
grant all on public.estacoes, public.estacao_categorias, public.mesas, public.comandas to service_role;
grant execute on function public.abrir_comanda(uuid, uuid, uuid, text, integer, text) to authenticated, service_role;
grant execute on function public.fechar_comanda(jsonb) to authenticated, service_role;
grant execute on function public.juntar_comandas(uuid, uuid, uuid) to authenticated, service_role;
grant execute on function public.cozinha_padrao(uuid) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['estacoes', 'estacao_categorias', 'mesas', 'comandas'] loop
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

-- A comanda só muda de estado pelo caminho certo; fechada não volta.
create function app.comanda_transicao()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.estado is distinct from old.estado and not (
    (old.estado = 'aberta' and new.estado in ('conta', 'fechada', 'cancelada')) or
    (old.estado = 'conta' and new.estado in ('aberta', 'fechada', 'cancelada'))
  ) then
    raise exception 'a comanda não pode passar de % para %', old.estado, new.estado using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger comandas_transicao
  before update on public.comandas
  for each row execute function app.comanda_transicao();
