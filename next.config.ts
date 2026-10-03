import type { NextConfig } from 'next'

/**
 * As fotos vivem no Storage do Supabase. O host vem do URL do projecto para não
 * repetir o valor; se o env não estiver definido (por exemplo no build sem
 * `.env.local`) aceita-se qualquer projecto `*.supabase.co`.
 */
const hostSupabase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname
  } catch {
    return '*.supabase.co'
  }
})()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: hostSupabase, pathname: '/storage/v1/object/public/**' }],
  },
  experimental: {
    serverActions: { bodySizeLimit: '12mb' },
  },
}

export default nextConfig
