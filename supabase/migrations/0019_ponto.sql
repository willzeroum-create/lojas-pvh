-- =============================================================================
-- 0019 — Ponto eletrónico
--
-- Batida no "relógio" (tablet ou celular da loja): a pessoa digita o PIN, a
-- webcam tira uma foto e, se o aparelho deixar, guarda-se a localização. A
-- identidade é conferida no servidor, por isso só o service_role insere.
--
-- Batidas nunca se apagam nem se editam: um erro anula-se (com motivo e quem
-- aprovou) e uma batida esquecida entra como manual. É o que a fiscalização
-- espera de um registo de ponto e o que protege dono e funcionário.
-- A foto fica no bucket privado `ponto` (0020), lida por links assinados.
-- =============================================================================

create type public.tipo_batida as enum ('entrada', 'saida_intervalo', 'volta_intervalo', 'saida');

alter table public.equipe_membros
  add column registra_ponto boolean not null default true,
  add column jornada_minutos integer not null default 440 check (jornada_minutos between 0 and 720);
comment on column public.equipe_membros.jornada_minutos is 'Jornada prevista por dia trabalhado (440 = 7h20, 44 h em 6 dias).';
grant update (registra_ponto, jornada_minutos) on public.equipe_membros to authenticated;

create table public.ponto_batidas (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  membro_id      uuid not null,
  tipo           public.tipo_batida not null,
  momento        timestamptz not null default now(),
  origem         text not null default 'relogio' check (origem in ('relogio', 'manual')),
  foto_path      text check (foto_path is null or length(foto_path) <= 300),
  latitude       numeric(9, 6) check (latitude is null or latitude between -90 and 90),
  longitude      numeric(9, 6) check (longitude is null or longitude between -180 and 180),
  precisao_m     integer check (precisao_m is null or precisao_m >= 0),
  dispositivo    text check (dispositivo is null or length(dispositivo) <= 200),
  motivo         text check (motivo is null or length(motivo) <= 300),
  registado_por  text,
  anulada_em     timestamptz,
  anulada_por    text,
  anulada_motivo text check (anulada_motivo is null or length(anulada_motivo) between 5 and 300),
  criado_em      timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (membro_id, tenant_id) references public.equipe_membros (id, tenant_id) on delete cascade,
  check (origem = 'relogio' or motivo is not null),
  check ((anulada_em is null) = (anulada_motivo is null))
);
comment on table public.ponto_batidas is 'Batidas de ponto. Imutáveis: só se anulam (com motivo). Manuais exigem motivo.';
create index ponto_batidas_membro_idx on public.ponto_batidas (tenant_id, membro_id, momento);

-- No relógio, a sequência tem de fazer sentido e um toque duplo não conta duas vezes.
create function app.ponto_valida_batida()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ultima public.ponto_batidas;
begin
  if new.origem <> 'relogio' then
    return new;
  end if;
  select * into ultima from public.ponto_batidas
  where tenant_id = new.tenant_id and membro_id = new.membro_id and anulada_em is null
  order by momento desc limit 1;
  if found and new.momento - ultima.momento < interval '1 minute' then
    raise exception 'batida repetida: espere um minuto' using errcode = 'check_violation';
  end if;
  if not (
    (new.tipo = 'entrada' and (not found or ultima.tipo = 'saida' or new.momento - ultima.momento > interval '16 hours'))
    or (new.tipo in ('saida_intervalo', 'saida') and found and ultima.tipo in ('entrada', 'volta_intervalo'))
    or (new.tipo = 'volta_intervalo' and found and ultima.tipo = 'saida_intervalo')
  ) then
    raise exception 'batida fora de ordem' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger ponto_batidas_valida
  before insert on public.ponto_batidas
  for each row execute function app.ponto_valida_batida();

-- Depois de gravada, só se pode anular uma vez; o resto fica como está.
create function app.ponto_so_anula()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.anulada_em is not null
     or (to_jsonb(new) - array['anulada_em', 'anulada_por', 'anulada_motivo']) <> (to_jsonb(old) - array['anulada_em', 'anulada_por', 'anulada_motivo'])
     or new.anulada_em is null then
    raise exception 'batida de ponto não se altera; só se anula uma vez, com motivo' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger ponto_batidas_so_anula
  before update on public.ponto_batidas
  for each row execute function app.ponto_so_anula();

grant select on public.ponto_batidas to authenticated;
-- Nem o servidor apaga batidas (o cascade ao apagar o tenant não depende de grants).
grant select, insert, update on public.ponto_batidas to service_role;

alter table public.ponto_batidas enable row level security;
create policy "ponto_batidas: membros e operadores lêem"
  on public.ponto_batidas for select to authenticated
  using (tenant_id in (select app.tenants_do_utilizador()) or (select app.e_operador()));
