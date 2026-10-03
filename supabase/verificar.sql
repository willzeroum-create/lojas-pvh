-- Verificação da instalação: uma linha por item. Colar no SQL Editor e Run.
-- Não altera nada.
select 'tabelas' as item,
       coalesce(string_agg(table_name, ', ' order by table_name), '(nenhuma)') as valor
  from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'
union all
select 'tipos (enums)',
       coalesce(string_agg(t.typname, ', ' order by t.typname), '(nenhum)')
  from pg_type t join pg_namespace n on n.oid = t.typnamespace
 where n.nspname = 'public' and t.typtype = 'e'
union all
select 'funções app.*',
       coalesce(string_agg(p.proname, ', ' order by p.proname), '(nenhuma)')
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'app'
union all
select 'funções public.*',
       coalesce(string_agg(p.proname, ', ' order by p.proname), '(nenhuma)')
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname in ('criar_pedido', 'anonimizar_pedidos')
union all
select 'triggers',
       coalesce(string_agg(tgname, ', ' order by tgname), '(nenhum)')
  from pg_trigger where not tgisinternal
union all
select 'políticas public (esperado 22)', count(*)::text from pg_policies where schemaname = 'public'
union all
select 'políticas storage (esperado 4)',
       coalesce(string_agg(policyname, ', ' order by policyname), '(nenhuma)')
  from pg_policies where schemaname = 'storage'
union all
select 'bucket fotos', case when exists (select 1 from storage.buckets where id = 'fotos') then 'ok' else 'FALTA' end
union all
select 'realtime (esperado pedidos)',
       coalesce(string_agg(tablename, ', '), '(nenhuma)')
  from pg_publication_tables where pubname = 'supabase_realtime'
union all
select 'app.migracoes',
       case when to_regclass('app.migracoes') is null then 'FALTA a tabela' else 'existe' end;
