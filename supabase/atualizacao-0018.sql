-- =============================================================================
-- ACTUALIZAÇÃO 0018 — 0018_atomicidade_estoque.sql
-- Para projectos com as migrações anteriores aplicadas. SQL Editor → colar → Run.
-- =============================================================================

begin;

-- =============================================================================
-- 0018 — Estoque: operações compostas numa só transacção
--
-- 1. salvar_ficha: troca a ficha técnica inteira de uma vez (antes eram duas
--    chamadas; se a segunda falhasse, o produto ficava sem ficha).
-- 2. concluir_entrada: conclui a entrada e, se vier uma categoria, lança a
--    nota como UMA conta a pagar com uma parcela por duplicata, tudo junto.
--    Origem 'compra' + id da entrada: o índice titulos_origem_unica impede
--    lançar a mesma nota duas vezes.
-- Ambas security invoker: a RLS de quem chama continua a valer.
-- =============================================================================

create function public.salvar_ficha(p_tenant uuid, p_produto uuid, p_linhas jsonb)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  n integer;
begin
  if jsonb_typeof(p_linhas) <> 'array' then
    raise exception 'ficha inválida' using errcode = 'check_violation';
  end if;
  delete from public.fichas where tenant_id = p_tenant and produto_id = p_produto;
  insert into public.fichas (tenant_id, produto_id, insumo_id, quantidade)
  select p_tenant, p_produto, (l ->> 'insumo_id')::uuid, (l ->> 'quantidade')::numeric
  from jsonb_array_elements(p_linhas) l;
  get diagnostics n = row_count;
  return n;
end;
$$;

create function public.concluir_entrada(p_tenant uuid, p_entrada uuid, p_autor text, p_categoria uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  itens integer;
  e public.estoque_entradas;
  v_titulo uuid;
  parcelas integer := 0;
  hoje date := (now() at time zone 'America/Porto_Velho')::date;
begin
  itens := public.concluir_entrada_estoque(p_tenant, p_entrada, p_autor);
  if p_categoria is null then
    return jsonb_build_object('itens', itens, 'parcelas', 0);
  end if;

  select * into e from public.estoque_entradas where tenant_id = p_tenant and id = p_entrada;
  if not exists (
    select 1 from jsonb_array_elements(e.duplicatas) d
    where (d ->> 'valor')::numeric > 0 and (d ->> 'vencimento') ~ '^\d{4}-\d{2}-\d{2}$'
  ) then
    return jsonb_build_object('itens', itens, 'parcelas', 0);
  end if;

  insert into public.titulos (tenant_id, tipo, descricao, pessoa_id, categoria_id, origem, origem_id, competencia, documento)
  values (
    p_tenant, 'pagar',
    left('NF ' || coalesce(e.numero_nota, 's/n') || ' · ' || coalesce(e.fornecedor_nome, 'Fornecedor'), 120),
    e.fornecedor_id, p_categoria, 'compra', p_entrada,
    coalesce(e.emitida_em, hoje), left(e.numero_nota, 60)
  )
  on conflict (tenant_id, origem, origem_id) where origem_id is not null do nothing
  returning id into v_titulo;
  if v_titulo is null then
    return jsonb_build_object('itens', itens, 'parcelas', 0);
  end if;

  insert into public.parcelas (tenant_id, titulo_id, numero, vencimento, valor)
  select p_tenant, v_titulo, row_number() over (order by (d ->> 'vencimento')::date, ord), (d ->> 'vencimento')::date, round((d ->> 'valor')::numeric, 2)
  from jsonb_array_elements(e.duplicatas) with ordinality as x(d, ord)
  where (d ->> 'valor')::numeric > 0 and (d ->> 'vencimento') ~ '^\d{4}-\d{2}-\d{2}$';
  get diagnostics parcelas = row_count;

  return jsonb_build_object('itens', itens, 'parcelas', parcelas, 'titulo_id', v_titulo);
end;
$$;

revoke execute on function public.salvar_ficha(uuid, uuid, jsonb) from public, anon;
revoke execute on function public.concluir_entrada(uuid, uuid, text, uuid) from public, anon;
grant execute on function public.salvar_ficha(uuid, uuid, jsonb) to authenticated, service_role;
grant execute on function public.concluir_entrada(uuid, uuid, text, uuid) to authenticated, service_role;

insert into app.migracoes (nome) values ('0018_atomicidade_estoque.sql') on conflict (nome) do nothing;

commit;
