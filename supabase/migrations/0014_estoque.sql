-- =============================================================================
-- 0014 — Estoque (módulo `estoque`) e fichas técnicas (módulo `producao`)
--
-- Itens de estoque: produtos com `controla_estoque` e insumos. O saldo e o
-- custo médio vivem no item e só mudam por movimentos. Um movimento nunca se
-- edita nem se apaga: corrige-se com um estorno. Cada movimento guarda o saldo
-- antes e depois.
--
-- Baixa automática: quando um pedido fica `concluido` (de qualquer canal), os
-- itens baixam o produto (se controla estoque) e os insumos da ficha técnica.
-- Pedido concluído que é cancelado estorna a baixa. Só com o módulo ligado.
-- =============================================================================

alter table public.produtos add column controla_estoque boolean not null default false;
alter table public.produtos add column unidade text not null default 'un' check (unidade in ('un', 'kg', 'g', 'l', 'ml', 'cx', 'pct', 'dz'));
alter table public.produtos add column estoque_atual numeric(12, 3) not null default 0;
alter table public.produtos add column estoque_minimo numeric(12, 3) not null default 0 check (estoque_minimo >= 0);
alter table public.produtos add column custo_medio numeric(12, 4) not null default 0 check (custo_medio >= 0);

alter table public.insumos add column codigo_barras text;
alter table public.insumos add column ativo boolean not null default true;
alter table public.insumos add constraint insumos_unidade_check check (unidade in ('un', 'kg', 'g', 'l', 'ml', 'cx', 'pct', 'dz'));
alter table public.insumos add constraint insumos_tenant_nome_unico unique (tenant_id, nome);
comment on column public.insumos.quantidade_atual is 'Saldo actual; só muda por estoque_movimentos.';
comment on column public.insumos.custo_unitario is 'Custo médio por unidade; recalculado em cada entrada.';

alter table public.itens_pedido add column estoque_baixado boolean not null default false;

create type public.tipo_movimento_estoque as enum ('entrada', 'saida', 'venda', 'ajuste', 'estorno', 'producao');

create table public.estoque_movimentos (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  produto_id     uuid,
  insumo_id      uuid,
  tipo           public.tipo_movimento_estoque not null,
  motivo         text not null check (length(motivo) between 2 and 120),
  quantidade     numeric(12, 3) not null check (quantidade <> 0),
  custo_unitario numeric(12, 4),
  saldo_antes    numeric(12, 3) not null,
  saldo_depois   numeric(12, 3) not null,
  origem         text check (origem in ('entrada', 'pedido', 'inventario', 'manual', 'estorno')),
  origem_id      uuid,
  estorno_de     uuid references public.estoque_movimentos (id),
  autor_nome     text,
  criado_em      timestamptz not null default now(),
  check ((produto_id is null) <> (insumo_id is null)),
  check (tipo not in ('entrada', 'producao') or quantidade > 0),
  check (tipo not in ('saida', 'venda') or quantidade < 0),
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id) on delete cascade,
  foreign key (insumo_id, tenant_id) references public.insumos (id, tenant_id) on delete cascade
);
comment on column public.estoque_movimentos.quantidade is 'Positiva entra, negativa sai.';
create index estoque_movimentos_item_idx on public.estoque_movimentos (tenant_id, coalesce(produto_id, insumo_id), criado_em desc);
create unique index estoque_um_estorno on public.estoque_movimentos (estorno_de) where estorno_de is not null;

-- Saldo, custo médio e carimbo de antes/depois.
create function app.aplicar_movimento_estoque()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  saldo numeric(12, 3);
  custo numeric(12, 4);
begin
  if new.produto_id is not null then
    select estoque_atual, custo_medio into saldo, custo from public.produtos where id = new.produto_id for update;
  else
    select quantidade_atual, custo_unitario into saldo, custo from public.insumos where id = new.insumo_id for update;
  end if;
  new.saldo_antes := saldo;
  new.saldo_depois := saldo + new.quantidade;

  -- Custo médio ponderado só nas entradas com custo e saldo positivo.
  if new.tipo in ('entrada', 'producao') and new.custo_unitario is not null then
    if saldo > 0 then
      custo := ((saldo * custo) + (new.quantidade * new.custo_unitario)) / (saldo + new.quantidade);
    else
      custo := new.custo_unitario;
    end if;
  end if;

  if new.produto_id is not null then
    update public.produtos set estoque_atual = new.saldo_depois, custo_medio = custo where id = new.produto_id;
  else
    update public.insumos set quantidade_atual = new.saldo_depois, custo_unitario = custo where id = new.insumo_id;
  end if;
  return new;
end;
$$;
comment on function app.aplicar_movimento_estoque() is 'Security definer só para escrever saldo e custo, que os utilizadores não alteram à mão.';

create trigger estoque_movimentos_aplicar
  before insert on public.estoque_movimentos
  for each row execute function app.aplicar_movimento_estoque();

-- Estorno: movimento simétrico, ligado ao original.
create function public.estornar_movimento_estoque(p_tenant uuid, p_movimento uuid, p_autor text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  m public.estoque_movimentos;
begin
  select * into m from public.estoque_movimentos where tenant_id = p_tenant and id = p_movimento;
  if not found then raise exception 'movimento não encontrado' using errcode = 'no_data_found'; end if;
  if m.tipo = 'estorno' then raise exception 'um estorno não se estorna' using errcode = 'check_violation'; end if;
  insert into public.estoque_movimentos (tenant_id, produto_id, insumo_id, tipo, motivo, quantidade, origem, origem_id, estorno_de, autor_nome, saldo_antes, saldo_depois)
  values (m.tenant_id, m.produto_id, m.insumo_id, 'estorno', 'Estorno: ' || m.motivo, -m.quantidade, 'estorno', m.id, m.id, p_autor, 0, 0);
exception
  when unique_violation then raise exception 'este movimento já foi estornado' using errcode = 'check_violation';
end;
$$;

-- -----------------------------------------------------------------------------
-- Baixa automática pela venda
-- -----------------------------------------------------------------------------
create function app.estoque_ligado(p_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.tenant_modulos where tenant_id = p_tenant and modulo = 'estoque' and ativo);
$$;

create function app.baixar_item_pedido(i public.itens_pedido)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  f record;
  controla boolean;
begin
  if i.produto_id is null or i.estoque_baixado or i.preparo is not distinct from 'cancelado' then return; end if;
  select p.controla_estoque into controla from public.produtos p where p.id = i.produto_id;
  if controla then
    insert into public.estoque_movimentos (tenant_id, produto_id, tipo, motivo, quantidade, origem, origem_id, saldo_antes, saldo_depois)
    values (i.tenant_id, i.produto_id, 'venda', 'Venda', -i.quantidade, 'pedido', i.pedido_id, 0, 0);
  end if;
  for f in select fi.insumo_id, fi.quantidade from public.fichas fi where fi.produto_id = i.produto_id loop
    insert into public.estoque_movimentos (tenant_id, insumo_id, tipo, motivo, quantidade, origem, origem_id, saldo_antes, saldo_depois)
    values (i.tenant_id, f.insumo_id, 'venda', 'Venda (ficha técnica)', -(f.quantidade * i.quantidade), 'pedido', i.pedido_id, 0, 0);
  end loop;
  update public.itens_pedido set estoque_baixado = true where id = i.id;
end;
$$;

-- Pedido concluído baixa; concluído que é cancelado estorna.
create function app.estoque_pelo_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  i public.itens_pedido;
  m public.estoque_movimentos;
begin
  if not app.estoque_ligado(new.tenant_id) then return null; end if;
  if new.status = 'concluido' and old.status is distinct from 'concluido' then
    for i in select * from public.itens_pedido where pedido_id = new.id loop
      perform app.baixar_item_pedido(i);
    end loop;
  elsif new.status = 'cancelado' and old.status = 'concluido' then
    for m in select * from public.estoque_movimentos
              where origem = 'pedido' and origem_id = new.id and tipo = 'venda'
                and not exists (select 1 from public.estoque_movimentos e where e.estorno_de = estoque_movimentos.id) loop
      insert into public.estoque_movimentos (tenant_id, produto_id, insumo_id, tipo, motivo, quantidade, origem, origem_id, estorno_de, saldo_antes, saldo_depois)
      values (m.tenant_id, m.produto_id, m.insumo_id, 'estorno', 'Venda cancelada', -m.quantidade, 'estorno', m.id, m.id, 0, 0);
    end loop;
    update public.itens_pedido set estoque_baixado = false where pedido_id = new.id;
  end if;
  return null;
end;
$$;

create trigger pedidos_estoque
  after update of status on public.pedidos
  for each row execute function app.estoque_pelo_pedido();

-- Venda de balcão: o pedido nasce concluído e os itens chegam depois.
create function app.estoque_pelo_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if app.estoque_ligado(new.tenant_id)
     and exists (select 1 from public.pedidos p where p.id = new.pedido_id and p.status = 'concluido') then
    perform app.baixar_item_pedido(new);
  end if;
  return null;
end;
$$;

create trigger itens_pedido_estoque
  after insert on public.itens_pedido
  for each row execute function app.estoque_pelo_item();

-- -----------------------------------------------------------------------------
-- Entradas (manual ou XML da NF-e)
-- -----------------------------------------------------------------------------
create type public.estado_entrada as enum ('pendente', 'concluida', 'cancelada');

create table public.estoque_entradas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  fornecedor_id  uuid,
  fornecedor_nome text,
  fornecedor_documento text,
  numero_nota    text,
  serie          text,
  chave_acesso   text check (chave_acesso is null or chave_acesso ~ '^[0-9]{44}$'),
  emitida_em     date,
  valor_total    numeric(12, 2) not null default 0,
  estado         public.estado_entrada not null default 'pendente',
  observacoes    text,
  duplicatas     jsonb not null default '[]'::jsonb,
  autor_nome     text,
  criado_em      timestamptz not null default now(),
  concluida_em   timestamptz,
  unique (id, tenant_id),
  foreign key (fornecedor_id, tenant_id) references public.pessoas (id, tenant_id) on delete set null (fornecedor_id)
);
comment on column public.estoque_entradas.duplicatas is 'Parcelas da nota [{numero, vencimento, valor}], viram contas a pagar.';
create unique index estoque_entradas_chave_unica on public.estoque_entradas (tenant_id, chave_acesso) where chave_acesso is not null and estado <> 'cancelada';

create table public.estoque_entrada_itens (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  entrada_id        uuid not null,
  produto_id        uuid,
  insumo_id         uuid,
  descricao         text not null,
  codigo_fornecedor text,
  ean               text,
  unidade_nota      text,
  quantidade_nota   numeric(12, 4) not null check (quantidade_nota > 0),
  fator             numeric(12, 4) not null default 1 check (fator > 0),
  valor_total       numeric(12, 2) not null check (valor_total >= 0),
  foreign key (entrada_id, tenant_id) references public.estoque_entradas (id, tenant_id) on delete cascade,
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id),
  foreign key (insumo_id, tenant_id) references public.insumos (id, tenant_id),
  check (produto_id is null or insumo_id is null)
);
comment on column public.estoque_entrada_itens.fator is 'Conversão da unidade da nota para a do estoque (caixa com 12 → 12).';

-- O vínculo item do fornecedor → produto/insumo é lembrado para a próxima nota.
create table public.estoque_vinculos (
  tenant_id            uuid not null references public.tenants (id) on delete cascade,
  fornecedor_documento text not null,
  codigo_fornecedor    text not null,
  produto_id           uuid,
  insumo_id            uuid,
  fator                numeric(12, 4) not null default 1,
  primary key (tenant_id, fornecedor_documento, codigo_fornecedor),
  foreign key (produto_id, tenant_id) references public.produtos (id, tenant_id) on delete cascade,
  foreign key (insumo_id, tenant_id) references public.insumos (id, tenant_id) on delete cascade,
  check ((produto_id is null) <> (insumo_id is null))
);

-- Concluir a entrada: um movimento por item ligado, com custo; lembra os vínculos.
create function public.concluir_entrada_estoque(p_tenant uuid, p_entrada uuid, p_autor text)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  e public.estoque_entradas;
  it public.estoque_entrada_itens;
  n integer := 0;
  qtd numeric(12, 3);
begin
  select * into e from public.estoque_entradas where tenant_id = p_tenant and id = p_entrada for update;
  if not found then raise exception 'entrada não encontrada' using errcode = 'no_data_found'; end if;
  if e.estado <> 'pendente' then raise exception 'esta entrada já foi %', e.estado using errcode = 'check_violation'; end if;
  if exists (select 1 from public.estoque_entrada_itens where entrada_id = p_entrada and produto_id is null and insumo_id is null) then
    raise exception 'ligue todos os itens a um produto ou insumo antes de concluir' using errcode = 'check_violation';
  end if;

  for it in select * from public.estoque_entrada_itens where entrada_id = p_entrada loop
    qtd := round(it.quantidade_nota * it.fator, 3);
    insert into public.estoque_movimentos (tenant_id, produto_id, insumo_id, tipo, motivo, quantidade, custo_unitario, origem, origem_id, autor_nome, saldo_antes, saldo_depois)
    values (p_tenant, it.produto_id, it.insumo_id, 'entrada',
            coalesce('Compra NF ' || e.numero_nota, 'Entrada manual'), qtd,
            case when qtd > 0 then it.valor_total / qtd end, 'entrada', p_entrada, p_autor, 0, 0);
    if e.fornecedor_documento is not null and it.codigo_fornecedor is not null then
      insert into public.estoque_vinculos (tenant_id, fornecedor_documento, codigo_fornecedor, produto_id, insumo_id, fator)
      values (p_tenant, e.fornecedor_documento, it.codigo_fornecedor, it.produto_id, it.insumo_id, it.fator)
      on conflict (tenant_id, fornecedor_documento, codigo_fornecedor)
      do update set produto_id = excluded.produto_id, insumo_id = excluded.insumo_id, fator = excluded.fator;
    end if;
    n := n + 1;
  end loop;

  update public.estoque_entradas set estado = 'concluida', concluida_em = now() where id = p_entrada;
  return n;
end;
$$;

-- -----------------------------------------------------------------------------
-- Inventário: contagem → ajustes
-- -----------------------------------------------------------------------------
create table public.inventarios (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  descricao    text not null default 'Inventário',
  autor_nome   text,
  itens        jsonb not null default '[]'::jsonb,
  ajustes      integer not null default 0,
  criado_em    timestamptz not null default now()
);
comment on column public.inventarios.itens is 'Contagem registada [{produto_id|insumo_id, nome, sistema, contado, diferenca}].';

create function public.aplicar_inventario(p_tenant uuid, p_descricao text, p_contagem jsonb, p_autor text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  c jsonb;
  sistema numeric(12, 3);
  contado numeric(12, 3);
  inv uuid;
  registo jsonb := '[]'::jsonb;
  n integer := 0;
  nome text;
begin
  insert into public.inventarios (tenant_id, descricao, autor_nome) values (p_tenant, coalesce(nullif(trim(p_descricao), ''), 'Inventário'), p_autor)
  returning id into inv;
  for c in select * from jsonb_array_elements(p_contagem) loop
    contado := (c ->> 'contado')::numeric;
    if contado < 0 then raise exception 'contagem negativa' using errcode = 'check_violation'; end if;
    if c ? 'produto_id' then
      select estoque_atual, p.nome into sistema, nome from public.produtos p where p.tenant_id = p_tenant and p.id = (c ->> 'produto_id')::uuid;
    else
      select quantidade_atual, x.nome into sistema, nome from public.insumos x where x.tenant_id = p_tenant and x.id = (c ->> 'insumo_id')::uuid;
    end if;
    if sistema is null then raise exception 'item do inventário não encontrado' using errcode = 'no_data_found'; end if;
    registo := registo || jsonb_build_object('produto_id', c ->> 'produto_id', 'insumo_id', c ->> 'insumo_id', 'nome', nome,
                                              'sistema', sistema, 'contado', contado, 'diferenca', contado - sistema);
    if contado <> sistema then
      insert into public.estoque_movimentos (tenant_id, produto_id, insumo_id, tipo, motivo, quantidade, origem, origem_id, autor_nome, saldo_antes, saldo_depois)
      values (p_tenant, (c ->> 'produto_id')::uuid, (c ->> 'insumo_id')::uuid, 'ajuste', 'Inventário', contado - sistema, 'inventario', inv, p_autor, 0, 0);
      n := n + 1;
    end if;
  end loop;
  update public.inventarios set itens = registo, ajustes = n where id = inv;
  return inv;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
-- Saldo e custo só mudam por movimentos: o update passa a ser por colunas.
revoke update on public.produtos from authenticated;
grant update (
  categoria_id, nome, descricao, preco, preco_promocional, foto_url, sku, disponivel, tempo_preparo_min, ordem,
  codigo_barras, vendido_por_peso, controla_estoque, unidade, estoque_minimo
) on public.produtos to authenticated;
revoke update on public.insumos from authenticated;
grant update (nome, unidade, quantidade_minima, codigo_barras, ativo) on public.insumos to authenticated;
grant select, insert on public.estoque_movimentos, public.inventarios to authenticated;
grant update (itens, ajustes) on public.inventarios to authenticated;
grant select, insert, update, delete on public.estoque_entradas, public.estoque_entrada_itens, public.estoque_vinculos to authenticated;
grant all on public.estoque_movimentos, public.inventarios, public.estoque_entradas, public.estoque_entrada_itens, public.estoque_vinculos to service_role;
grant execute on function public.estornar_movimento_estoque(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.concluir_entrada_estoque(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.aplicar_inventario(uuid, text, jsonb, text) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['estoque_movimentos', 'inventarios', 'estoque_entradas', 'estoque_entrada_itens', 'estoque_vinculos'] loop
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
