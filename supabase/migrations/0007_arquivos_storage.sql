-- =============================================================================
-- 0007 — Storage: bucket privado `arquivos`
--
-- Ao contrário de `fotos` (público, para a página do comerciante), este
-- bucket é privado: o console gera links assinados de curta duração para ver
-- e descarregar. Só operadores escrevem e lêem. Até 25 MB por ficheiro.
--
-- Depende do esquema `storage` do Supabase e não corre nos testes em PGlite.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('arquivos', 'arquivos', false, 26214400)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

create policy "arquivos: operadores lêem"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'arquivos' and (select app.e_operador()));

create policy "arquivos: operadores enviam"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'arquivos' and (select app.e_operador()));

create policy "arquivos: operadores substituem"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'arquivos' and (select app.e_operador()))
  with check (bucket_id = 'arquivos' and (select app.e_operador()));

create policy "arquivos: operadores apagam"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'arquivos' and (select app.e_operador()));
