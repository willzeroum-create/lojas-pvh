-- =============================================================================
-- ACTUALIZAÇÃO 0020 — 0020_ponto_storage.sql
-- Para projectos com as migrações anteriores aplicadas. SQL Editor → colar → Run.
-- =============================================================================

begin;

-- =============================================================================
-- 0020 — Storage: bucket privado `ponto` (fotos das batidas)
--
-- Sem políticas para authenticated: só o servidor (service_role) grava a foto
-- depois de conferir o PIN, e gera links assinados curtos para o espelho.
-- Caminho: {tenant_id}/{membro_id}/{AAAA-MM}/{batida_id}.jpg. Até 512 KB.
--
-- Depende do esquema `storage` do Supabase e não corre nos testes em PGlite.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ponto', 'ponto', false, 524288, array['image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into app.migracoes (nome) values ('0020_ponto_storage.sql') on conflict (nome) do nothing;

commit;
