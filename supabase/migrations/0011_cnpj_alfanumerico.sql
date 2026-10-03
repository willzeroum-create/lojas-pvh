-- =============================================================================
-- 0011 — CNPJ alfanumérico
--
-- Desde julho de 2026 a Receita Federal emite CNPJ com letras: 12 posições
-- alfanuméricas e 2 dígitos verificadores numéricos (ex.: 12ABC34501DE35).
-- O cadastro de empresas recusava-os. Os dígitos verificadores são conferidos
-- na aplicação (src/lib/dominio/documento.ts).
-- =============================================================================

alter table public.tenants drop constraint if exists tenants_cnpj_check;
alter table public.tenants
  add constraint tenants_cnpj_check check (cnpj is null or cnpj ~ '^[0-9A-Z]{12}[0-9]{2}$');
comment on column public.tenants.cnpj is 'CNPJ sem máscara, numérico ou alfanumérico (maiúsculas).';
