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
  public.entregas,
  public.entregadores,
  public.delivery_zonas,
  public.fidelidade_movimentos,
  public.fidelidade_config,
  public.ponto_batidas,
  public.cobrancas_pix,
  public.documentos_fiscais, public.webhooks_recebidos, public.integracoes_segredos, public.integracoes,
  public.auditoria, public.equipe_membros,
  public.inventarios, public.estoque_vinculos, public.estoque_entrada_itens, public.estoque_entradas, public.estoque_movimentos,
  public.comandas, public.mesas, public.estacao_categorias, public.estacoes,
  public.pagamentos_pedido, public.caixa_conferencias, public.caixa_movimentos, public.caixa_sessoes,
  public.baixas, public.parcelas, public.titulos, public.categorias_financeiras, public.carteiras,
  public.consentimentos, public.pessoa_enderecos, public.pessoas,
  public.tenant_modulos,
  public.arquivos, public.notas_internas, public.cadeia_registos, public.cadeia_etapas,
  public.fichas, public.insumos, public.tenant_onboarding,
  public.itens_pedido, public.pedidos, public.opcoes, public.grupos_opcao,
  public.produtos, public.categorias, public.lojas,
  public.membros, public.operadores, public.tenants
  cascade;

drop function if exists public.despachar_entrega(uuid, uuid, uuid);
drop function if exists public.concluir_entrega(uuid, uuid, boolean, text);
drop function if exists public.acertar_entregador(uuid, uuid);
drop function if exists app.entrega_do_pedido();
drop function if exists app.entrega_transicao();
drop function if exists public.registar_venda_com_cashback(jsonb);
drop function if exists app.lancar_resgate_cashback(uuid, uuid, numeric, uuid, numeric, text);
drop function if exists app.cashback_do_pedido();
drop function if exists app.cashback_em_vigor(uuid);
drop function if exists public.saldo_cashback(uuid, uuid, date, uuid);
drop function if exists app.ponto_valida_batida();
drop function if exists app.ponto_so_anula();
drop function if exists public.concluir_entrada(uuid, uuid, text, uuid);
drop function if exists public.salvar_ficha(uuid, uuid, jsonb);
drop function if exists public.criar_pedido(jsonb);
drop function if exists public.anonimizar_pedidos(integer);
drop function if exists public.anonimizar_pessoa(uuid, uuid);
drop function if exists public.financeiro_padrao(uuid);
drop function if exists public.registar_venda_balcao(jsonb);
drop function if exists public.cancelar_venda_balcao(uuid, uuid, text, text);
drop function if exists public.abrir_comanda(uuid, uuid, uuid, text, integer, text);
drop function if exists public.fechar_comanda(jsonb);
drop function if exists public.juntar_comandas(uuid, uuid, uuid);
drop function if exists public.cozinha_padrao(uuid);
drop function if exists public.estornar_movimento_estoque(uuid, uuid, text);
drop function if exists public.concluir_entrada_estoque(uuid, uuid, text);
drop function if exists public.aplicar_inventario(uuid, text, jsonb, text);

drop type if exists public.tipo_pessoa;
drop type if exists public.estado_comanda;
drop type if exists public.papel_equipe;
drop type if exists public.estado_cobranca_pix;
drop type if exists public.tipo_batida;
drop type if exists public.estado_entrega;
drop type if exists public.estado_documento_fiscal;
drop type if exists public.tipo_documento_fiscal;
drop type if exists public.ambiente_integracao;
drop type if exists public.estado_integracao;
drop type if exists public.tipo_movimento_estoque;
drop type if exists public.estado_entrada;
drop type if exists public.estado_preparo;
drop type if exists public.tipo_movimento_caixa;
drop type if exists public.estado_caixa;
drop type if exists public.forma_recebimento;
drop type if exists public.linha_resultado;
drop type if exists public.tipo_carteira;
drop type if exists public.estado_parcela;
drop type if exists public.tipo_titulo;
drop type if exists public.cadeia_estado;
drop type if exists public.etapa_onboarding;
drop type if exists public.forma_pagamento;
drop type if exists public.tipo_entrega;
drop type if exists public.pedido_status;
drop type if exists public.canal_pedido;
drop type if exists public.papel_membro;
drop type if exists public.tenant_status;

drop schema if exists app cascade;
