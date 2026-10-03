-- =============================================================================
-- ACTUALIZAÇÃO 0017 — 0017_pix.sql
-- Para projectos com as migrações anteriores aplicadas. SQL Editor → colar → Run.
-- =============================================================================

begin;

-- =============================================================================
-- 0017 — Pix (módulo `bancos`, pré-funcional)
--
-- Cobrança Pix dinâmica (QR + copia-e-cola) pelo PSP do cliente, com o nosso
-- `txid` como chave de idempotência. A confirmação vem por webhook (assinado)
-- ou por consulta; paga, a cobrança de uma parcela dá baixa sozinha no
-- financeiro (carteira Pix). O PDV usa a cobrança para mostrar o QR e só
-- conclui a venda quando o Pix cai.
-- =============================================================================

create type public.estado_cobranca_pix as enum ('pendente', 'pago', 'expirado', 'cancelado', 'devolvido', 'erro');

create table public.cobrancas_pix (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  txid          text not null check (txid ~ '^[A-Za-z0-9]{26,35}$'),
  provedor      text not null,
  provedor_id   text,
  valor         numeric(12, 2) not null check (valor > 0),
  descricao     text not null check (length(descricao) between 1 and 140),
  origem        text not null check (origem in ('pdv', 'parcela', 'comanda', 'manual')),
  origem_id     uuid,
  estado        public.estado_cobranca_pix not null default 'pendente',
  copia_cola    text,
  qr_base64     text,
  expira_em     timestamptz,
  pago_em       timestamptz,
  mensagem      text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (tenant_id, txid)
);
comment on column public.cobrancas_pix.txid is 'Nosso identificador (idempotência no PSP e na conciliação).';
create index cobrancas_pix_tenant_idx on public.cobrancas_pix (tenant_id, criado_em desc);
create index cobrancas_pix_origem_idx on public.cobrancas_pix (tenant_id, origem, origem_id);

create trigger cobrancas_pix_atualizado_em
  before update on public.cobrancas_pix
  for each row execute function app.carimbar_atualizado_em();

-- O estado "pago" só chega pelo servidor (webhook ou consulta ao PSP): os
-- membros criam e cancelam, mas não marcam como pago.
grant select, insert on public.cobrancas_pix to authenticated;
grant update (estado) on public.cobrancas_pix to authenticated;
grant all on public.cobrancas_pix to service_role;

alter table public.cobrancas_pix enable row level security;
create policy "cobrancas_pix: membros e operadores"
  on public.cobrancas_pix for all to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()))
  with check (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));

create function app.cobranca_pix_so_cancela()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Quem não é o servidor só pode cancelar uma cobrança pendente.
  if current_user = 'authenticated' and not (old.estado = 'pendente' and new.estado = 'cancelado') then
    raise exception 'só se cancela uma cobrança pendente' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger cobrancas_pix_so_cancela
  before update of estado on public.cobrancas_pix
  for each row execute function app.cobranca_pix_so_cancela();

insert into app.migracoes (nome) values ('0017_pix.sql') on conflict (nome) do nothing;

commit;
