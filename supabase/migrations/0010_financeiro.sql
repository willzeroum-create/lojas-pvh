-- =============================================================================
-- 0010 — Financeiro simples (módulo `financeiro`)
--
-- Contas a receber e a pagar em parcelas; cada pagamento é uma baixa. Regras:
--   • O estado da parcela (aberta, parcial, paga, cancelada) é calculado das
--     baixas por gatilho; ninguém o escolhe à mão (sem grant de escrita).
--   • Corrigir é estornar, nunca apagar: baixas e títulos não têm delete.
--   • Competência (data do fato) e caixa (data da baixa) ficam separadas.
--   • Categorias com linha de resultado formam a DRE gerencial do mês.
-- =============================================================================

create type public.tipo_titulo as enum ('receber', 'pagar');
create type public.estado_parcela as enum ('aberta', 'parcial', 'paga', 'cancelada');
create type public.tipo_carteira as enum ('caixa', 'banco', 'pix', 'cartao', 'outra');
create type public.linha_resultado as enum (
  'receita_vendas', 'outras_receitas', 'impostos', 'custo_mercadoria',
  'despesa_variavel', 'pessoal', 'despesa_fixa', 'outras_despesas'
);

create table public.carteiras (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  nome           text not null check (length(nome) between 1 and 60),
  tipo           public.tipo_carteira not null,
  saldo_inicial  numeric(12, 2) not null default 0,
  ativa          boolean not null default true,
  criado_em      timestamptz not null default now(),
  unique (id, tenant_id),
  unique (tenant_id, nome)
);
comment on table public.carteiras is 'Onde o dinheiro está: caixa da loja, banco, Pix, cartão a receber.';

create table public.categorias_financeiras (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  nome       text not null check (length(nome) between 1 and 60),
  tipo       public.tipo_titulo not null,
  linha      public.linha_resultado not null,
  ativa      boolean not null default true,
  unique (id, tenant_id),
  unique (tenant_id, tipo, nome),
  check ((tipo = 'receber') = (linha in ('receita_vendas', 'outras_receitas')))
);
comment on table public.categorias_financeiras is 'Receitas (tipo receber) e despesas (tipo pagar), cada uma numa linha da DRE.';

create table public.titulos (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  tipo          public.tipo_titulo not null,
  descricao     text not null check (length(descricao) between 1 and 120),
  pessoa_id     uuid,
  categoria_id  uuid not null,
  origem        text not null default 'manual' check (origem in ('manual', 'pedido', 'compra', 'recorrente')),
  origem_id     uuid,
  competencia   date not null,
  documento     text check (documento is null or length(documento) <= 60),
  observacoes   text check (observacoes is null or length(observacoes) <= 1000),
  cancelado_em  timestamptz,
  criado_em     timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (pessoa_id, tenant_id) references public.pessoas (id, tenant_id) on delete set null (pessoa_id),
  foreign key (categoria_id, tenant_id) references public.categorias_financeiras (id, tenant_id)
);
comment on table public.titulos is 'Uma conta a receber ou a pagar; o valor está nas parcelas.';
create unique index titulos_origem_unica on public.titulos (tenant_id, origem, origem_id) where origem_id is not null;
create index titulos_tenant_idx on public.titulos (tenant_id, tipo, competencia desc);

create table public.parcelas (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  titulo_id   uuid not null,
  numero      integer not null check (numero between 1 and 360),
  vencimento  date not null,
  valor       numeric(12, 2) not null check (valor > 0),
  valor_pago  numeric(12, 2) not null default 0 check (valor_pago >= 0),
  estado      public.estado_parcela not null default 'aberta',
  pago_em     date,
  unique (id, tenant_id),
  unique (titulo_id, numero),
  foreign key (titulo_id, tenant_id) references public.titulos (id, tenant_id) on delete cascade
);
comment on column public.parcelas.estado is 'Calculado pelas baixas (gatilho). Vencida = aberta/parcial com vencimento passado, calculado na leitura.';
create index parcelas_vencimento_idx on public.parcelas (tenant_id, estado, vencimento);

create table public.baixas (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  parcela_id   uuid not null,
  carteira_id  uuid not null,
  data         date not null,
  valor        numeric(12, 2) not null check (valor > 0),
  juros        numeric(12, 2) not null default 0 check (juros >= 0),
  multa        numeric(12, 2) not null default 0 check (multa >= 0),
  desconto     numeric(12, 2) not null default 0 check (desconto >= 0),
  forma        text not null default 'dinheiro' check (forma in ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'boleto', 'transferencia', 'outro')),
  observacao   text check (observacao is null or length(observacao) <= 300),
  estornada_em timestamptz,
  criado_em    timestamptz not null default now(),
  foreign key (parcela_id, tenant_id) references public.parcelas (id, tenant_id) on delete cascade,
  foreign key (carteira_id, tenant_id) references public.carteiras (id, tenant_id)
);
comment on column public.baixas.valor is 'Quanto da parcela foi quitado (principal). O que entrou ou saiu da carteira é valor + juros + multa - desconto.';
create index baixas_parcela_idx on public.baixas (tenant_id, parcela_id);
create index baixas_data_idx on public.baixas (tenant_id, data desc);

-- -----------------------------------------------------------------------------
-- Estado da parcela a partir das baixas não estornadas.
-- -----------------------------------------------------------------------------
create function app.recalcular_parcela(p_parcela uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  total numeric(12, 2);
  ultima date;
  p public.parcelas;
  cancelado boolean;
begin
  select * into p from public.parcelas where id = p_parcela;
  if not found then return; end if;
  select t.cancelado_em is not null into cancelado from public.titulos t where t.id = p.titulo_id;
  select coalesce(sum(b.valor), 0), max(b.data) into total, ultima
    from public.baixas b where b.parcela_id = p_parcela and b.estornada_em is null;

  update public.parcelas
     set valor_pago = total,
         pago_em = case when total >= p.valor then ultima end,
         estado = case
           when cancelado then 'cancelada'
           when total >= p.valor then 'paga'
           when total > 0 then 'parcial'
           else 'aberta'
         end::public.estado_parcela
   where id = p_parcela;
end;
$$;
comment on function app.recalcular_parcela(uuid) is 'Security definer só para escrever as colunas calculadas, que os utilizadores não podem alterar.';

create function app.baixa_alterada()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform app.recalcular_parcela(coalesce(new.parcela_id, old.parcela_id));
  return null;
end;
$$;

-- Parcela nasce sempre aberta: o estado só muda pelas baixas.
create function app.parcela_nova()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.valor_pago := 0;
  new.pago_em := null;
  new.estado := 'aberta';
  return new;
end;
$$;

create trigger parcelas_nova
  before insert on public.parcelas
  for each row execute function app.parcela_nova();

create trigger baixas_recalcular
  after insert or update on public.baixas
  for each row execute function app.baixa_alterada();

-- Uma baixa não pode quitar mais do que falta na parcela.
create function app.validar_baixa()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  p public.parcelas;
  outras numeric(12, 2);
begin
  if new.estornada_em is not null then return new; end if;
  select * into p from public.parcelas where id = new.parcela_id;
  if p.estado = 'cancelada' then
    raise exception 'parcela cancelada não recebe baixas' using errcode = 'check_violation';
  end if;
  select coalesce(sum(valor), 0) into outras from public.baixas
   where parcela_id = new.parcela_id and estornada_em is null and id <> new.id;
  if outras + new.valor > p.valor then
    raise exception 'a baixa passa do saldo da parcela (saldo %)', p.valor - outras using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger baixas_validar
  before insert on public.baixas
  for each row execute function app.validar_baixa();

-- Só o estorno muda uma baixa, e uma vez.
create function app.so_estorno()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.estornada_em is not null then
    raise exception 'baixa já estornada' using errcode = 'check_violation';
  end if;
  if (to_jsonb(new) - 'estornada_em') <> (to_jsonb(old) - 'estornada_em') or new.estornada_em is null then
    raise exception 'uma baixa só pode ser estornada' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger baixas_so_estorno
  before update on public.baixas
  for each row execute function app.so_estorno();

-- Cancelar o título cancela as parcelas em aberto (as pagas ficam como estão).
create function app.titulo_cancelado()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  p uuid;
begin
  if new.cancelado_em is not null and old.cancelado_em is null then
    for p in select id from public.parcelas where titulo_id = new.id loop
      perform app.recalcular_parcela(p);
    end loop;
  end if;
  return new;
end;
$$;

create trigger titulos_cancelar
  after update of cancelado_em on public.titulos
  for each row execute function app.titulo_cancelado();

-- -----------------------------------------------------------------------------
-- Carteiras e categorias de partida (idempotente).
-- -----------------------------------------------------------------------------
create function public.financeiro_padrao(p_tenant uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.carteiras (tenant_id, nome, tipo) values
    (p_tenant, 'Caixa da loja', 'caixa'),
    (p_tenant, 'Pix', 'pix'),
    (p_tenant, 'Cartão a receber', 'cartao'),
    (p_tenant, 'Banco', 'banco')
  on conflict (tenant_id, nome) do nothing;

  insert into public.categorias_financeiras (tenant_id, nome, tipo, linha) values
    (p_tenant, 'Vendas', 'receber', 'receita_vendas'),
    (p_tenant, 'Outras receitas', 'receber', 'outras_receitas'),
    (p_tenant, 'Impostos sobre vendas', 'pagar', 'impostos'),
    (p_tenant, 'Mercadorias e insumos', 'pagar', 'custo_mercadoria'),
    (p_tenant, 'Embalagens', 'pagar', 'custo_mercadoria'),
    (p_tenant, 'Taxas de cartão e apps', 'pagar', 'despesa_variavel'),
    (p_tenant, 'Entregas', 'pagar', 'despesa_variavel'),
    (p_tenant, 'Marketing', 'pagar', 'despesa_variavel'),
    (p_tenant, 'Salários e encargos', 'pagar', 'pessoal'),
    (p_tenant, 'Pró-labore', 'pagar', 'pessoal'),
    (p_tenant, 'Aluguel', 'pagar', 'despesa_fixa'),
    (p_tenant, 'Energia e água', 'pagar', 'despesa_fixa'),
    (p_tenant, 'Internet e telefone', 'pagar', 'despesa_fixa'),
    (p_tenant, 'Contador e sistemas', 'pagar', 'despesa_fixa'),
    (p_tenant, 'Manutenção', 'pagar', 'outras_despesas'),
    (p_tenant, 'Outras despesas', 'pagar', 'outras_despesas')
  on conflict (tenant_id, tipo, nome) do nothing;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------
grant select, insert, update on public.carteiras, public.categorias_financeiras to authenticated;
grant select, insert on public.titulos, public.parcelas, public.baixas to authenticated;
grant update (descricao, pessoa_id, categoria_id, competencia, documento, observacoes, cancelado_em) on public.titulos to authenticated;
grant update (vencimento) on public.parcelas to authenticated;
grant update (estornada_em) on public.baixas to authenticated;
grant all on public.carteiras, public.categorias_financeiras, public.titulos, public.parcelas, public.baixas to service_role;
grant execute on function public.financeiro_padrao(uuid) to authenticated, service_role;
revoke execute on function app.recalcular_parcela(uuid) from public, anon;
grant execute on function app.recalcular_parcela(uuid) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['carteiras', 'categorias_financeiras', 'titulos', 'parcelas', 'baixas'] loop
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
