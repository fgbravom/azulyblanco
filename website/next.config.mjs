/** @type {import('next').NextConfig} */
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
  // Next mete siempre unos polyfills (Array.at, flat, fromEntries, hasOwn, trimStart...) que
  // todos los navegadores desde 2022 ya traen: se reemplazan por un módulo vacío (~14 KiB menos)
  turbopack: {
    resolveAlias: {
      '../build/polyfills/polyfill-module': './lib/sin-polyfills.js',
    },
  },
  images: {
    // Sin la optimización de Vercel: en el plan Hobby cada imagen × ancho × formato
    // cuenta como transformación (5K al mes) y, pasado el límite, las imágenes
    // nuevas responden 402 y no cargan. Las imágenes se sirven tal cual porque ya
    // llegan livianas: el admin las reduce y recomprime en WebP al subirlas
    // (lib/admin/subir-imagen.ts) y las del repo están optimizadas a mano.
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        // El alias de Vercel duplicaba el sitio en buscadores: todo al dominio oficial
        source: '/:path*',
        has: [{ type: 'host', value: 'azulyblanco.vercel.app' }],
        destination: 'https://www.azulyblanco.cl/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        // Seguridad básica: sin iframes ajenos (clickjacking del admin), sin
        // adivinar tipos de archivo y sin filtrar URLs (/cuotas/<código>) a otros sitios
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
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
