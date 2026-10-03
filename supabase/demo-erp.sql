-- =============================================================================
-- Demonstração do ERP — liga todos os módulos prontos na Lanchonete da Praça
-- (seed.sql) e prepara dados para testar de ponta a ponta. Idempotente.
-- Correr DEPOIS de seed.sql: SQL Editor → colar → Run.
--
-- Equipe de teste: Gerente "Demo Gerente", PIN 2580 (só para demonstração;
-- mude ou desative antes de usar com um cliente real).
-- =============================================================================

-- Módulos prontos ligados (os essenciais Loja e Conta estão sempre).
insert into public.tenant_modulos (tenant_id, modulo, ativo, ativado_em)
select 'a0000000-0000-4000-8000-000000000001', m, true, now()
  from unnest(array[
    'pedidos', 'cardapio', 'resumo', 'clientes', 'financeiro', 'caixa', 'pdv',
    'comandas', 'cozinha', 'estoque', 'producao', 'equipe', 'ponto', 'ia_whatsapp'
  ]) as m
on conflict (tenant_id, modulo) do update set ativo = true;

-- Dados de partida do financeiro e da cozinha.
select public.financeiro_padrao('a0000000-0000-4000-8000-000000000001');
select public.cozinha_padrao('a0000000-0000-4000-8000-000000000001');

-- Lanches e porções vão para a Cozinha; bebidas não passam pela cozinha.
insert into public.estacao_categorias (tenant_id, categoria_id, estacao_id)
select 'a0000000-0000-4000-8000-000000000001', c, e.id
  from public.estacoes e,
       unnest(array['c0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002']::uuid[]) as c
 where e.tenant_id = 'a0000000-0000-4000-8000-000000000001' and e.nome = 'Cozinha'
on conflict (categoria_id) do nothing;

-- Oito mesas no salão.
insert into public.mesas (tenant_id, loja_id, numero, area, lugares)
select 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', n, case when n <= 4 then 'Salão' else 'Varanda' end, 4
  from generate_series(1, 8) as n
on conflict (tenant_id, loja_id, numero) do nothing;

-- Refrigerante com controlo de estoque e código de barras.
update public.produtos
   set controla_estoque = true, unidade = 'un', estoque_minimo = 24, codigo_barras = '7894900011517'
 where id = 'd0000000-0000-4000-8000-000000000005';

-- Insumos e ficha técnica do X-Salada e da batata.
insert into public.insumos (tenant_id, nome, unidade, quantidade_minima) values
  ('a0000000-0000-4000-8000-000000000001', 'Pão de hambúrguer', 'un', 30),
  ('a0000000-0000-4000-8000-000000000001', 'Hambúrguer 120 g', 'un', 30),
  ('a0000000-0000-4000-8000-000000000001', 'Queijo muçarela', 'kg', 2),
  ('a0000000-0000-4000-8000-000000000001', 'Batata congelada', 'kg', 5)
on conflict (tenant_id, nome) do nothing;

insert into public.fichas (tenant_id, produto_id, insumo_id, quantidade)
select 'a0000000-0000-4000-8000-000000000001', f.produto, i.id, f.quantidade
  from (values
    ('d0000000-0000-4000-8000-000000000001'::uuid, 'Pão de hambúrguer', 1.000),
    ('d0000000-0000-4000-8000-000000000001'::uuid, 'Hambúrguer 120 g', 1.000),
    ('d0000000-0000-4000-8000-000000000001'::uuid, 'Queijo muçarela', 0.030),
    ('d0000000-0000-4000-8000-000000000004'::uuid, 'Batata congelada', 0.400)
  ) as f (produto, nome, quantidade)
  join public.insumos i on i.tenant_id = 'a0000000-0000-4000-8000-000000000001' and i.nome = f.nome
on conflict (produto_id, insumo_id) do nothing;

-- Entrada inicial de estoque (concluída), para haver saldo e custo médio.
do $$
declare
  e uuid;
begin
  if exists (select 1 from public.estoque_entradas where tenant_id = 'a0000000-0000-4000-8000-000000000001' and numero_nota = 'DEMO-1') then
    return;
  end if;
  insert into public.estoque_entradas (tenant_id, numero_nota, fornecedor_nome, autor_nome)
  values ('a0000000-0000-4000-8000-000000000001', 'DEMO-1', 'Estoque inicial', 'Demonstração')
  returning id into e;
  insert into public.estoque_entrada_itens (tenant_id, entrada_id, produto_id, insumo_id, descricao, quantidade_nota, valor_total)
  select 'a0000000-0000-4000-8000-000000000001', e, null, i.id, i.nome, x.q, x.v
    from (values ('Pão de hambúrguer', 60, 48.00), ('Hambúrguer 120 g', 60, 210.00), ('Queijo muçarela', 3, 135.00), ('Batata congelada', 10, 120.00)) as x (nome, q, v)
    join public.insumos i on i.tenant_id = 'a0000000-0000-4000-8000-000000000001' and i.nome = x.nome;
  insert into public.estoque_entrada_itens (tenant_id, entrada_id, produto_id, descricao, quantidade_nota, valor_total)
  values ('a0000000-0000-4000-8000-000000000001', e, 'd0000000-0000-4000-8000-000000000005', 'Refrigerante lata', 48, 144.00);
  perform public.concluir_entrada_estoque('a0000000-0000-4000-8000-000000000001', e, 'Demonstração');
end;
$$;

-- Gerente de demonstração (PIN 2580).
insert into public.equipe_membros (tenant_id, nome, papel, pin_hash)
values ('a0000000-0000-4000-8000-000000000001', 'Demo Gerente', 'gerente',
        'scrypt$Minki1PKa6fTVy670H8wnA$e29AgW8kdEUEXkOF0UrRnYbAmYSCfz3cmrG5kedPvpw')
on conflict (tenant_id, nome) do nothing;
