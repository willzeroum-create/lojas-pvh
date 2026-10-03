-- =============================================================================
-- 0009 — Clientes e fornecedores (módulo `clientes`)
--
-- Um cadastro único de pessoas por tenant, com papéis (cliente, fornecedor).
-- O pedido do cardápio cria ou actualiza o cliente pelo WhatsApp, por isso o
-- histórico começa no primeiro pedido, mesmo antes de o módulo ser ligado.
--
-- Regras:
--   • WhatsApp guardado só com dígitos e DDI; único por tenant entre pessoas
--     não anonimizadas (é a chave do cliente que chega pelo cardápio).
--   • CPF ou CNPJ (numérico ou alfanumérico) sem máscara, único por tenant
--     quando informado.
--   • LGPD: o comerciante é o controlador. O consentimento fica registado com
--     finalidade e data; anonimizar apaga os dados pessoais e mantém os
--     valores dos pedidos.
-- =============================================================================

create type public.tipo_pessoa as enum ('pf', 'pj');

create table public.pessoas (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants (id) on delete cascade,
  tipo            public.tipo_pessoa not null default 'pf',
  nome            text not null check (length(nome) between 1 and 120),
  nome_fantasia   text check (nome_fantasia is null or length(nome_fantasia) <= 120),
  documento       text check (documento is null or documento ~ '^([0-9]{11}|[0-9A-Z]{12}[0-9]{2})$'),
  whatsapp        text check (whatsapp is null or whatsapp ~ '^[0-9]{12,13}$'),
  email           text check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  nascimento      date,
  observacoes     text check (observacoes is null or length(observacoes) <= 2000),
  e_cliente       boolean not null default true,
  e_fornecedor    boolean not null default false,
  etiquetas       text[] not null default '{}',
  origem          text not null default 'manual' check (origem in ('manual', 'pedido', 'importacao')),
  anonimizado_em  timestamptz,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  unique (id, tenant_id),
  check (e_cliente or e_fornecedor),
  check (documento is null or (tipo = 'pf') = (length(documento) = 11))
);
comment on table public.pessoas is 'Cadastro único de clientes e fornecedores do tenant.';
comment on column public.pessoas.whatsapp is 'Só dígitos com DDI. Chave do cliente que chega pelo cardápio.';
comment on column public.pessoas.documento is 'CPF (11 dígitos) ou CNPJ (14, numérico ou alfanumérico), sem máscara, validado na aplicação.';

create unique index pessoas_whatsapp_unico
  on public.pessoas (tenant_id, whatsapp)
  where whatsapp is not null and anonimizado_em is null;
create unique index pessoas_documento_unico
  on public.pessoas (tenant_id, documento)
  where documento is not null and anonimizado_em is null;
create index pessoas_tenant_nome_idx on public.pessoas (tenant_id, lower(nome));

create trigger pessoas_atualizado_em
  before update on public.pessoas
  for each row execute function app.carimbar_atualizado_em();

create table public.pessoa_enderecos (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  pessoa_id    uuid not null,
  rotulo       text not null default 'Principal' check (length(rotulo) between 1 and 40),
  cep          text check (cep is null or cep ~ '^[0-9]{8}$'),
  rua          text,
  numero       text,
  complemento  text,
  bairro       text,
  cidade       text,
  uf           text check (uf is null or uf ~ '^[A-Z]{2}$'),
  referencia   text,
  principal    boolean not null default false,
  criado_em    timestamptz not null default now(),
  foreign key (pessoa_id, tenant_id) references public.pessoas (id, tenant_id) on delete cascade
);
create index pessoa_enderecos_pessoa_idx on public.pessoa_enderecos (tenant_id, pessoa_id);

create table public.consentimentos (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  pessoa_id     uuid not null,
  finalidade    text not null check (finalidade in ('pedidos', 'marketing', 'aniversario')),
  concedido     boolean not null,
  origem        text not null check (origem in ('cardapio', 'balcao', 'painel', 'importacao')),
  registado_em  timestamptz not null default now(),
  foreign key (pessoa_id, tenant_id) references public.pessoas (id, tenant_id) on delete cascade
);
comment on table public.consentimentos is 'LGPD: histórico de consentimentos por finalidade. O último registo vale.';
create index consentimentos_pessoa_idx on public.consentimentos (tenant_id, pessoa_id, finalidade, registado_em desc);

-- Pedido ligado ao cliente.
alter table public.pedidos add column cliente_id uuid;
alter table public.pedidos
  add constraint pedidos_cliente_tenant_fkey
  foreign key (cliente_id, tenant_id) references public.pessoas (id, tenant_id) on delete set null (cliente_id);
create index pedidos_tenant_cliente_idx on public.pedidos (tenant_id, cliente_id, criado_em desc);

-- -----------------------------------------------------------------------------
-- O pedido do cardápio cria ou actualiza o cliente pelo WhatsApp.
-- -----------------------------------------------------------------------------
create function app.cliente_do_pedido()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  numero text;
begin
  if new.cliente_id is not null or new.cliente_telefone is null then
    return new;
  end if;
  numero := regexp_replace(new.cliente_telefone, '\D', '', 'g');
  if length(numero) in (10, 11) then
    numero := '55' || numero;
  end if;
  if numero !~ '^[0-9]{12,13}$' then
    return new;
  end if;

  insert into public.pessoas as p (tenant_id, nome, whatsapp, origem)
  values (new.tenant_id, coalesce(nullif(trim(new.cliente_nome), ''), 'Cliente ' || right(numero, 4)), numero, 'pedido')
  on conflict (tenant_id, whatsapp) where whatsapp is not null and anonimizado_em is null
  do update set e_cliente = true
  returning p.id into new.cliente_id;

  return new;
end;
$$;

create trigger pedidos_cliente
  before insert on public.pedidos
  for each row execute function app.cliente_do_pedido();

-- LGPD: anonimizar uma pessoa a pedido. Mantém pedidos e valores, apaga o pessoal.
create function public.anonimizar_pessoa(p_tenant uuid, p_pessoa uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.pessoas
     set nome = 'Cliente anonimizado', nome_fantasia = null, documento = null, whatsapp = null,
         email = null, nascimento = null, observacoes = null, etiquetas = '{}', anonimizado_em = now()
   where tenant_id = p_tenant and id = p_pessoa;
  delete from public.pessoa_enderecos where tenant_id = p_tenant and pessoa_id = p_pessoa;
  update public.pedidos
     set cliente_nome = null, cliente_telefone = null, endereco = null, anonimizado_em = coalesce(anonimizado_em, now())
   where tenant_id = p_tenant and cliente_id = p_pessoa;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões e RLS: o padrão das tabelas do tenant.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.pessoas, public.pessoa_enderecos, public.consentimentos to authenticated;
grant all on public.pessoas, public.pessoa_enderecos, public.consentimentos to service_role;
grant execute on function public.anonimizar_pessoa(uuid, uuid) to authenticated, service_role;

do $$
declare
  t text;
begin
  foreach t in array array['pessoas', 'pessoa_enderecos', 'consentimentos'] loop
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

-- Clientes que já pediram pelo cardápio passam a existir no cadastro.
insert into public.pessoas (tenant_id, nome, whatsapp, origem)
select distinct on (p.tenant_id, '55' || p.cliente_telefone)
       p.tenant_id, coalesce(nullif(trim(p.cliente_nome), ''), 'Cliente'), '55' || p.cliente_telefone, 'pedido'
  from public.pedidos p
 where p.cliente_telefone ~ '^[0-9]{10,11}$' and p.anonimizado_em is null
 order by p.tenant_id, '55' || p.cliente_telefone, p.criado_em desc
on conflict do nothing;

update public.pedidos p
   set cliente_id = x.id
  from public.pessoas x
 where x.tenant_id = p.tenant_id and x.whatsapp = '55' || p.cliente_telefone and p.cliente_id is null;
