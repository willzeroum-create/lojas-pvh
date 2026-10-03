-- =============================================================================
-- LIMPEZA: apaga tudo o que é da plataforma. Não toca em auth.users nem em
-- objectos do Supabase; só nas nossas tabelas, tipos, funções e políticas.
-- Usado por reinstalar-do-zero.sql e por `pnpm migrar --do-zero`.
-- =============================================================================
drop policy if exists "arquivos: operadores lêem" on storage.objects;
drop policy if exists "arquivos: operadores enviam" on storage.objects;
drop policy if exists "arquivos: operadores substituem" on storage.objects;
drop policy if exists "arquivos: operadores apagam" on storage.objects;
drop policy if exists "fotos: leitura pública" on storage.objects;
drop policy if exists "fotos: tenant envia" on storage.objects;
drop policy if exists "fotos: tenant substitui" on storage.objects;
drop policy if exists "fotos: tenant apaga" on storage.objects;

drop table if exists
  public.consentimentos, public.pessoa_enderecos, public.pessoas,
  public.tenant_modulos,
  public.arquivos, public.notas_internas, public.cadeia_registos, public.cadeia_etapas,
  public.fichas, public.insumos, public.tenant_onboarding,
  public.itens_pedido, public.pedidos, public.opcoes, public.grupos_opcao,
  public.produtos, public.categorias, public.lojas,
  public.membros, public.operadores, public.tenants
  cascade;

drop function if exists public.criar_pedido(jsonb);
drop function if exists public.anonimizar_pedidos(integer);
drop function if exists public.anonimizar_pessoa(uuid, uuid);

drop type if exists public.tipo_pessoa;
drop type if exists public.cadeia_estado;
drop type if exists public.etapa_onboarding;
drop type if exists public.forma_pagamento;
drop type if exists public.tipo_entrega;
drop type if exists public.pedido_status;
drop type if exists public.canal_pedido;
drop type if exists public.papel_membro;
drop type if exists public.tenant_status;

drop schema if exists app cascade;
