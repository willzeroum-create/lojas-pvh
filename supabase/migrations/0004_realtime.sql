-- =============================================================================
-- 0004 — Tempo real nos pedidos
--
-- O painel subscreve INSERT/UPDATE em `pedidos` filtrados por tenant_id. O
-- Realtime aplica as políticas RLS de `pedidos` a cada subscritor, por isso um
-- tenant nunca recebe pedidos de outro.
--
-- `replica identity full` é necessário para o filtro por coluna funcionar em
-- UPDATE. A publicação só existe no Supabase; em PGlite o bloco é ignorado.
-- =============================================================================

alter table public.pedidos replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.pedidos;
  end if;
end;
$$;
