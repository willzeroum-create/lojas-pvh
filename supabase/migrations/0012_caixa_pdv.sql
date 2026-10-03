-- =============================================================================
-- 0012 — Caixa e PDV (módulos `caixa` e `pdv`)
--
-- A venda do balcão é um pedido com canal `balcao`, já concluído, com um ou
-- mais pagamentos. Só se vende com o caixa da loja aberto. O caixa guarda cada
-- movimento (venda, suprimento, sangria, estorno) e fecha às cegas: o operador
-- conta por forma de pagamento sem ver o esperado; a diferença fica registada
-- e nunca some.
-- =============================================================================

-- Catálogo: código de barras e venda por peso.
alter table public.produtos add column codigo_barras text check (codigo_barras is null or codigo_barras ~ '^[0-9A-Za-z-]{3,30}$');
alter table public.produtos add column vendido_por_peso boolean not null default false;
create unique index produtos_codigo_barras_unico on public.produtos (tenant_id, codigo_barras) where codigo_barras is not null;

-- Pedidos: quantidades fraccionadas (quilos), desconto e motivo de cancelamento.
alter table public.itens_pedido drop constraint if exists itens_pedido_quantidade_check;
alter table public.itens_pedido alter column quantidade type numeric(10, 3);
alter table public.itens_pedido add constraint itens_pedido_quantidade_check check (quantidade > 0 and quantidade <= 9999);
alter table public.itens_pedido add column desconto numeric(10, 2) not null default 0 check (desconto >= 0);
alter table public.pedidos add column desconto numeric(10, 2) not null default 0 check (desconto >= 0);
alter table public.pedidos add column cancelado_motivo text check (cancelado_motivo is null or length(cancelado_motivo) <= 200);
alter table public.pedidos add column caixa_sessao_id uuid;

create type public.forma_recebimento as enum ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'outro');
create type public.estado_caixa as enum ('aberta', 'fechada', 'conferida');
create type public.tipo_movimento_caixa as enum ('venda', 'suprimento', 'sangria', 'estorno');

create table public.caixa_sessoes (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants (id) on delete cascade,
  loja_id          uuid not null,
  operador_id      uuid references auth.users (id) on delete set null,
  operador_nome    text not null,
  fundo_troco      numeric(12, 2) not null default 0 check (fundo_troco >= 0),
  estado           public.estado_caixa not null default 'aberta',
  aberta_em        timestamptz not null default now(),
  fechada_em       timestamptz,
  justificativa    text check (justificativa is null or length(justificativa) <= 500),
  conferida_por    text,
  conferida_em     timestamptz,
  unique (id, tenant_id),
  foreign key (loja_id, tenant_id) references public.lojas (id, tenant_id)
);
comment on table public.caixa_sessoes is 'Uma abertura de caixa: do fundo de troco ao fechamento cego.';
create unique index caixa_uma_aberta_por_loja on public.caixa_sessoes (tenant_id, loja_id) where estado = 'aberta';
create index caixa_sessoes_tenant_idx on public.caixa_sessoes (tenant_id, aberta_em desc);

alter table public.pedidos
  add constraint pedidos_caixa_sessao_fkey foreign key (caixa_sessao_id, tenant_id)
  references public.caixa_sessoes (id, tenant_id);

create table public.caixa_movimentos (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  sessao_id  uuid not null,
  tipo       public.tipo_movimento_caixa not null,
  forma      public.forma_recebimento not null default 'dinheiro',
  valor      numeric(12, 2) not null check (valor > 0),
  motivo     text check (motivo is null or length(motivo) <= 200),
  pedido_id  uuid,
  autor_nome text,
  criado_em  timestamptz not null default now(),
  foreign key (sessao_id, tenant_id) references public.caixa_sessoes (id, tenant_id) on delete cascade,
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id),
  check (tipo not in ('suprimento', 'sangria') or (forma = 'dinheiro' and motivo is not null))
);
comment on column public.caixa_movimentos.valor is 'Sempre positivo; o tipo diz se entra (venda, suprimento) ou sai (sangria, estorno).';
create index caixa_movimentos_sessao_idx on public.caixa_movimentos (tenant_id, sessao_id, criado_em);

create table public.caixa_conferencias (
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  sessao_id  uuid not null,
  forma      public.forma_recebimento not null,
  esperado   numeric(12, 2) not null,
  informado  numeric(12, 2) not null check (informado >= 0),
  diferenca  numeric(12, 2) generated always as (informado - esperado) stored,
  primary key (sessao_id, forma),
  foreign key (sessao_id, tenant_id) references public.caixa_sessoes (id, tenant_id) on delete cascade
);
comment on table public.caixa_conferencias is 'Fechamento cego: o contado por forma de pagamento contra o esperado.';

create table public.pagamentos_pedido (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  pedido_id  uuid not null,
  forma      public.forma_recebimento not null,
  valor      numeric(12, 2) not null check (valor > 0),
  troco      numeric(12, 2) not null default 0 check (troco >= 0),
  criado_em  timestamptz not null default now(),
  foreign key (pedido_id, tenant_id) references public.pedidos (id, tenant_id) on delete cascade,
  check (troco = 0 or forma = 'dinheiro')
);
comment on column public.pagamentos_pedido.valor is 'Valor entregue pelo cliente nesta forma; o troco só existe em dinheiro.';

-- O fecho do caixa lança as vendas no financeiro (uma conta por sessão).
alter table public.titulos drop constraint if exists titulos_origem_check;
alter table public.titulos
  add constraint titulos_origem_check check (origem in ('manual', 'pedido', 'compra', 'recorrente', 'caixa'));

-- -----------------------------------------------------------------------------
-- Venda de balcão atómica. Corre com as permissões de quem vende (membro do
-- tenant, sob RLS). Os preços chegam já recalculados pelo servidor a partir do
-- catálogo; aqui confere-se a soma dos pagamentos e o caixa aberto.
-- -----------------------------------------------------------------------------
create function public.registar_venda_balcao(p jsonb)
returns public.pedidos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sessao public.caixa_sessoes;
  novo public.pedidos;
  item jsonb;
  pag jsonb;
  pago numeric(12, 2) := 0;
  troco numeric(12, 2) := 0;
  forma_principal text;
begin
  select * into sessao from public.caixa_sessoes
   where tenant_id = (p ->> 'tenant_id')::uuid and loja_id = (p ->> 'loja_id')::uuid and estado = 'aberta';
  if not found then
    raise exception 'abra o caixa antes de vender' using errcode = 'check_violation';
  end if;
  if jsonb_typeof(p -> 'itens') <> 'array' or jsonb_array_length(p -> 'itens') = 0 then
    raise exception 'venda sem itens' using errcode = 'check_violation';
  end if;
  if jsonb_typeof(p -> 'pagamentos') <> 'array' or jsonb_array_length(p -> 'pagamentos') = 0 then
    raise exception 'venda sem pagamento' using errcode = 'check_violation';
  end if;

  for pag in select * from jsonb_array_elements(p -> 'pagamentos') loop
    pago := pago + (pag ->> 'valor')::numeric;
    troco := troco + coalesce((pag ->> 'troco')::numeric, 0);
  end loop;
  if pago - troco <> (p ->> 'total')::numeric then
    raise exception 'pagamentos (%) não fecham com o total (%)', pago - troco, p ->> 'total' using errcode = 'check_violation';
  end if;

  select e ->> 'forma' into forma_principal
    from jsonb_array_elements(p -> 'pagamentos') as e
   order by (e ->> 'valor')::numeric desc limit 1;

  insert into public.pedidos (
    tenant_id, loja_id, canal, cliente_id, cliente_nome, cliente_telefone, tipo_entrega, observacoes,
    subtotal, desconto, taxa_entrega, total, forma_pagamento, troco_para, status, caixa_sessao_id
  ) values (
    sessao.tenant_id, sessao.loja_id, 'balcao',
    (p ->> 'cliente_id')::uuid, p ->> 'cliente_nome', p ->> 'cliente_telefone', 'retirada', p ->> 'observacoes',
    (p ->> 'subtotal')::numeric, coalesce((p ->> 'desconto')::numeric, 0), 0, (p ->> 'total')::numeric,
    case when forma_principal in ('cartao_debito', 'cartao_credito') then 'cartao'
         when forma_principal = 'pix' then 'pix' else 'dinheiro' end::public.forma_pagamento,
    null, 'concluido', sessao.id
  )
  returning * into novo;

  for item in select * from jsonb_array_elements(p -> 'itens') loop
    insert into public.itens_pedido (tenant_id, pedido_id, produto_id, nome, quantidade, preco_unitario, desconto, opcoes, observacao, total)
    values (
      novo.tenant_id, novo.id, (item ->> 'produto_id')::uuid, item ->> 'nome',
      (item ->> 'quantidade')::numeric, (item ->> 'preco_unitario')::numeric,
      coalesce((item ->> 'desconto')::numeric, 0), coalesce(item -> 'opcoes', '[]'::jsonb),
      item ->> 'observacao', (item ->> 'total')::numeric
    );
  end loop;

  for pag in select * from jsonb_array_elements(p -> 'pagamentos') loop
    insert into public.pagamentos_pedido (tenant_id, pedido_id, forma, valor, troco)
    values (novo.tenant_id, novo.id, (pag ->> 'forma')::public.forma_recebimento, (pag ->> 'valor')::numeric, coalesce((pag ->> 'troco')::numeric, 0));
    -- No caixa entra o que fica: o entregue menos o troco.
    if (pag ->> 'valor')::numeric - coalesce((pag ->> 'troco')::numeric, 0) > 0 then
      insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor, pedido_id, autor_nome)
      values (novo.tenant_id, sessao.id, 'venda', (pag ->> 'forma')::public.forma_recebimento,
              (pag ->> 'valor')::numeric - coalesce((pag ->> 'troco')::numeric, 0), novo.id, p ->> 'autor_nome');
    end if;
  end loop;

  return novo;
end;
$$;

-- Cancelar uma venda de balcão: estorna no caixa (se ainda aberto) e guarda o motivo.
create function public.cancelar_venda_balcao(p_tenant uuid, p_pedido uuid, p_motivo text, p_autor text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  ped public.pedidos;
  sessao public.caixa_sessoes;
  mov record;
begin
  if coalesce(trim(p_motivo), '') = '' then
    raise exception 'informe o motivo do cancelamento' using errcode = 'check_violation';
  end if;
  select * into ped from public.pedidos where tenant_id = p_tenant and id = p_pedido and canal = 'balcao';
  if not found then raise exception 'venda não encontrada' using errcode = 'no_data_found'; end if;
  if ped.status = 'cancelado' then raise exception 'venda já cancelada' using errcode = 'check_violation'; end if;
  select * into sessao from public.caixa_sessoes where id = ped.caixa_sessao_id;
  if sessao.estado <> 'aberta' then
    raise exception 'o caixa desta venda já foi fechado' using errcode = 'check_violation';
  end if;

  update public.pedidos set status = 'cancelado', cancelado_motivo = p_motivo where id = p_pedido;
  for mov in select forma, sum(valor) as valor from public.caixa_movimentos
              where pedido_id = p_pedido and tipo = 'venda' group by forma loop
    insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor, motivo, pedido_id, autor_nome)
    values (p_tenant, sessao.id, 'estorno', mov.forma, mov.valor, p_motivo, p_pedido, p_autor);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
grant select, insert on public.caixa_sessoes, public.caixa_movimentos, public.caixa_conferencias, public.pagamentos_pedido to authenticated;
grant update (estado, fechada_em, justificativa, conferida_por, conferida_em) on public.caixa_sessoes to authenticated;
grant all on public.caixa_sessoes, public.caixa_movimentos, public.caixa_conferencias, public.pagamentos_pedido to service_role;
grant execute on function public.registar_venda_balcao(jsonb) to authenticated, service_role;
grant execute on function public.cancelar_venda_balcao(uuid, uuid, text, text) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['caixa_sessoes', 'caixa_movimentos', 'caixa_conferencias', 'pagamentos_pedido'] loop
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

-- Movimentos só entram com o caixa aberto, e uma sessão fechada não volta atrás.
create function app.caixa_aberto()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from public.caixa_sessoes s where s.id = new.sessao_id and s.estado = 'aberta') then
    raise exception 'o caixa está fechado' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger caixa_movimentos_aberto
  before insert on public.caixa_movimentos
  for each row execute function app.caixa_aberto();

create function app.caixa_transicao()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (
    (old.estado = 'aberta' and new.estado = 'fechada') or
    (old.estado = 'fechada' and new.estado = 'conferida') or
    (old.estado = new.estado)
  ) then
    raise exception 'o caixa não pode passar de % para %', old.estado, new.estado using errcode = 'check_violation';
  end if;
  if old.estado <> 'aberta' and new.justificativa is distinct from old.justificativa then
    raise exception 'a justificativa de um caixa fechado não muda' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger caixa_sessoes_transicao
  before update on public.caixa_sessoes
  for each row execute function app.caixa_transicao();
