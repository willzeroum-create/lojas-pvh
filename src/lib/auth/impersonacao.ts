/**
 * Impersonação: o operador entra no painel de um tenant sem a senha do
 * cliente. É só um cookie com o id do tenant; só produz efeito se quem o tem
 * for operador (ver `sessao.ts`), e a RLS já deixa operadores lerem tudo.
 */
export const COOKIE_IMPERSONACAO = 'pvh_tenant'

export const OPCOES_COOKIE_IMPERSONACAO = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 12,
} as const
