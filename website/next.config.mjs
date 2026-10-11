/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : new URL('https://*.supabase.co')
// Supabase local (npm run db:start) sirve las imágenes desde 127.0.0.1
const supabaseLocal = ['127.0.0.1', 'localhost'].includes(supabaseUrl.hostname)

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // El admin del hero carga sharp en tiempo de ejecución (lib/admin/sharp.ts),
  // así que el trazado de archivos no lo detecta solo: se incluye a mano.
  outputFileTracingIncludes: {
    '/admin/hero': [
      './node_modules/sharp/**/*',
      './node_modules/@img/**/*',
      './node_modules/detect-libc/**/*',
      './node_modules/semver/**/*',
    ],
  },
  images: {
    // Imágenes subidas desde el admin (bucket público "medios" de Supabase Storage)
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol.replace(':', ''),
        hostname: supabaseUrl.hostname,
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Next bloquea optimizar imágenes de IPs privadas; solo se permite con el Supabase local
    dangerouslyAllowLocalIP: supabaseLocal,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        // Fotos del hero: archivos estáticos ya optimizados por scripts/optimize-hero-images.mjs
        source: '/images/hero/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000',
          },
        ],
      },
    ]
  },
}

export default nextConfig
