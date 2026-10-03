-- =============================================================================
-- Seed de demonstração — um tenant completo para ver a página pública e o
-- painel a funcionar. Idempotente: pode correr mais do que uma vez.
--
-- Não cria utilizadores (isso é feito por `pnpm operador` e pelo console).
-- =============================================================================

insert into public.tenants (id, slug, nome_fantasia, razao_social, telefone, whatsapp, cor_marca, endereco, status, publicado_em, renovacao_em)
values (
  'a0000000-0000-4000-8000-000000000001',
  'lanchonete-da-praca',
  'Lanchonete da Praça',
  'Lanchonete da Praça ME',
  '69999998888',
  '5569999998888',
  '#f2541b',
  '{"rua": "Av. Sete de Setembro", "numero": "1200", "bairro": "Centro", "cidade": "Porto Velho", "uf": "RO", "cep": "76801000", "referencia": "Em frente à praça"}',
  'ativo',
  now(),
  (current_date + interval '30 days')::date
)
on conflict (id) do nothing;

-- Módulos do painel: os mesmos que uma empresa nova recebe (ver modulosPadrao()).
insert into public.tenant_modulos (tenant_id, modulo, ativo, ativado_em)
select 'a0000000-0000-4000-8000-000000000001', m.modulo, true, now()
  from (values ('pedidos'), ('cardapio'), ('resumo')) as m (modulo)
on conflict (tenant_id, modulo) do nothing;

insert into public.lojas (id, tenant_id, nome, endereco, horarios, taxa_entrega, pedido_minimo, raio_entrega_km)
values (
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'Principal',
  '{"rua": "Av. Sete de Setembro", "numero": "1200", "bairro": "Centro", "cidade": "Porto Velho", "uf": "RO", "cep": "76801000"}',
  '[
    {"dia": 1, "abre": "17:00", "fecha": "23:30"},
    {"dia": 2, "abre": "17:00", "fecha": "23:30"},
    {"dia": 3, "abre": "17:00", "fecha": "23:30"},
    {"dia": 4, "abre": "17:00", "fecha": "23:30"},
    {"dia": 5, "abre": "17:00", "fecha": "01:00"},
    {"dia": 6, "abre": "17:00", "fecha": "01:00"},
    {"dia": 0, "abre": "18:00", "fecha": "23:00"}
  ]',
  5.00,
  15.00,
  6
)
on conflict (id) do nothing;

insert into public.categorias (id, tenant_id, nome, ordem) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Lanches', 1),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Porções', 2),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Bebidas', 3)
on conflict (id) do nothing;

insert into public.produtos (id, tenant_id, categoria_id, nome, descricao, preco, preco_promocional, tempo_preparo_min, ordem) values
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'X-Salada', 'Pão, hambúrguer 120 g, queijo, alface, tomate e maionese da casa.', 18.00, null, 15, 1),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'X-Bacon', 'Pão, hambúrguer 120 g, queijo, bacon crocante e maionese da casa.', 22.00, 19.90, 15, 2),
  ('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'X-Tudo', 'Pão, dois hambúrgueres, queijo, bacon, ovo, presunto, salada e batata palha.', 28.00, null, 20, 3),
  ('d0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'Batata frita', 'Porção média, serve duas pessoas.', 16.00, null, 12, 1),
  ('d0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'Refrigerante lata 350 ml', null, 6.00, null, 0, 1),
  ('d0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'Suco natural 500 ml', 'Laranja, acerola ou maracujá.', 9.00, null, 5, 2)
on conflict (id) do nothing;

insert into public.grupos_opcao (id, tenant_id, produto_id, nome, min, max, obrigatorio, ordem) values
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Ponto da carne', 1, 1, true, 1),
  ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Adicionais', 0, 3, false, 2),
  ('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000005', 'Sabor', 1, 1, true, 1),
  ('e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000006', 'Fruta', 1, 1, true, 1)
on conflict (id) do nothing;

insert into public.opcoes (id, tenant_id, grupo_id, nome, preco_adicional, ordem) values
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'Ao ponto', 0, 1),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'Bem passado', 0, 2),
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'Bacon', 4.00, 1),
  ('f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'Ovo', 2.50, 2),
  ('f0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'Queijo extra', 3.00, 3),
  ('f0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003', 'Coca-Cola', 0, 1),
  ('f0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003', 'Guaraná', 0, 2),
  ('f0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000004', 'Laranja', 0, 1),
  ('f0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000004', 'Acerola', 0, 2),
  ('f0000000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000004', 'Maracujá', 0, 3)
on conflict (id) do nothing;

-- Cadeia de produção: as restantes etapas do modelo são materializadas ao abrir a cadeia no console.
insert into public.cadeia_etapas (tenant_id, frente, chave, titulo, ordem, estado, url, notas, concluida_em) values
  ('a0000000-0000-4000-8000-000000000001', 'lancamento', 'cadastro', 'Cadastro', 1, 'concluido', null, null, now()),
  ('a0000000-0000-4000-8000-000000000001', 'lancamento', 'cardapio', 'Cardápio carregado', 2, 'concluido', null, 'Importado da foto do cardápio de papel; preços conferidos com o Zé.', now()),
  ('a0000000-0000-4000-8000-000000000001', 'lancamento', 'fotos', 'Fotos', 3, 'em_curso', null, 'Faltam X-Tudo e a batata. Combinado fotografar sexta às 17h.', null),
  ('a0000000-0000-4000-8000-000000000001', 'lancamento', 'pagina', 'Página publicada', 4, 'concluido', null, null, now()),
  ('a0000000-0000-4000-8000-000000000001', 'lancamento', 'google', 'Link no Google', 5, 'pendente', null, null, null),
  ('a0000000-0000-4000-8000-000000000001', 'lancamento', 'cobranca', 'Cobrança ativa', 6, 'concluido', null, 'Setup pago em dinheiro. Mensalidade via Pix todo dia 5.', now()),
  ('a0000000-0000-4000-8000-000000000001', 'presenca_digital', 'instagram', 'Instagram', 1, 'ja_tinha', 'https://instagram.com/lanchonetedapraca', 'Perfil com 1.2k seguidores, publica 2x por semana. Bio sem link: corrigir na etapa "Link no Google".', now()),
  ('a0000000-0000-4000-8000-000000000001', 'presenca_digital', 'google_meu_negocio', 'Google Meu Negócio', 3, 'pendente', null, 'Perfil existe mas não está reivindicado. Pedir código por correio.', null)
on conflict (tenant_id, frente, chave) do nothing;

insert into public.notas_internas (id, tenant_id, autor_nome, titulo, conteudo, fixada) values (
  'a1000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'Equipa',
  'Briefing inicial',
  E'## Contexto\n\nLanchonete de bairro, 2 funcionários, movimento forte de quinta a sábado à noite.\n\n## Combinado\n\n- Setup: cardápio + fotos + página + Google\n- Mensalidade: renovação todo dia 5\n\n## Acessos\n\n| Serviço | Login | Onde está |\n|---|---|---|\n| Instagram | @lanchonetedapraca | com o Zé |\n| Google | conta da lanchonete | por criar |',
  true
)
on conflict (id) do nothing;
