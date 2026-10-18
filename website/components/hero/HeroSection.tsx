import { preconnect } from 'react-dom'
import { getFotosHero } from '@/lib/contenido/publico'
import { HeroBoot } from './HeroBoot'
import { bootHero, crearHeroConfig } from './hero-boot'

/* ============================================
 * HeroSection - Portada con cortina de entrada
 *
 * La foto se elige y se descarga desde un script
 * inline, sin esperar a que React hidrate. Los
 * atributos que ese script agrega (srcset, src,
 * data-*) no vienen del render: por eso los
 * suppressHydrationWarning.
 *
 * Las fotos se gestionan en /admin/hero.
 * ============================================ */

// Sin JavaScript no hay quien abra la cortina ni muestre el header
const NO_SCRIPT_STYLES = `.hero-curtain,.hero-crest{display:none}header[data-hero-gated],header[data-hero-gated] [data-hero-crest-target]{opacity:1;pointer-events:auto}`

export async function HeroSection() {
  const config = crearHeroConfig(await getFotosHero())
  const bootScript = `(${bootHero.toString()})(${JSON.stringify(config).replace(/</g, '\\u003c')})`

  // Las fotos subidas desde el admin vienen de Supabase: abrir la conexión antes de que el script las pida
  new Set(
    [...config.desktop.bases, ...config.mobile.bases].filter((b) => b.startsWith('http')).map((b) => new URL(b).origin)
  ).forEach((origen) => preconnect(origen))

  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden h-[60vh] lg:h-[84vh] bg-azul-primario">
      {/* Foto de portada: next/image no sirve aquí, la fuente se decide en el cliente */}
      <picture>
        <source type="image/avif" sizes="100vw" suppressHydrationWarning />
        <source type="image/webp" sizes="100vw" suppressHydrationWarning />
        <img
          id={config.photoId}
          alt="Club Deportivo Azul y Blanco"
          fetchPriority="high"
          decoding="async"
          className="hero-photo absolute inset-0 h-full w-full object-cover object-center"
          suppressHydrationWarning
        />
      </picture>

      {/* Cortina - Cubre toda la pantalla y desliza hacia abajo */}
      <div
        className="hero-curtain fixed inset-0 z-[60] bg-azul-primario pointer-events-none"
        aria-hidden="true"
      />

      {/* Escudo de la intro - Al abrir viaja hasta el logo del header (bootHero le pone el transform) */}
      <div
        id={config.crestId}
        className="hero-crest fixed left-1/2 top-1/2 z-[61] h-36 w-36 -translate-x-1/2 -translate-y-1/2 lg:h-48 lg:w-48 pointer-events-none"
        aria-hidden="true"
        suppressHydrationWarning
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero/escudo-384.webp"
          srcSet="/images/hero/escudo-192.webp 192w, /images/hero/escudo-288.webp 288w, /images/hero/escudo-384.webp 384w"
          sizes="(min-width: 1024px) 192px, 144px"
          alt=""
          width={192}
          height={192}
          fetchPriority="high"
          decoding="sync"
          className="h-full w-full"
        />
      </div>

      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      <HeroBoot config={config} />

      <noscript>
        <style>{NO_SCRIPT_STYLES}</style>
      </noscript>
    </section>
  )
}
