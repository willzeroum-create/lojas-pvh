-- =============================================================================
-- 0003 — Storage: bucket `fotos`
--
-- Leitura pública (as fotos aparecem na página do comerciante). Escrita só na
-- pasta do próprio tenant: `{tenant_id}/produtos/{produto_id}.webp`,
-- `{tenant_id}/logo.webp`. As fotos são redimensionadas no browser antes do
-- upload, por isso o limite é generoso mas não enorme.
--
-- Este ficheiro depende do esquema `storage` do Supabase e não corre nos
-- testes locais em PGlite.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 3145728, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- A primeira pasta do caminho tem de ser um tenant do utilizador (ou ele é operador).
create function app.pasta_do_tenant_permitida(nome_objeto text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select app.e_operador())
    or (
      (storage.foldername(nome_objeto))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and ((storage.foldername(nome_objeto))[1])::uuid in (select app.tenants_do_utilizador())
    )
$$;
grant execute on function app.pasta_do_tenant_permitida(text) to authenticated, service_role;

create policy "fotos: leitura pública"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fotos');

create policy "fotos: tenant envia"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos' and app.pasta_do_tenant_permitida(name));

create policy "fotos: tenant substitui"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fotos' and app.pasta_do_tenant_permitida(name))
  with check (bucket_id = 'fotos' and app.pasta_do_tenant_permitida(name));

create policy "fotos: tenant apaga"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos' and app.pasta_do_tenant_permitida(name));
