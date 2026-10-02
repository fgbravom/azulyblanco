import { HeroBoot } from './HeroBoot'
import { bootHero, HERO_BOOT_CONFIG } from './hero-boot'

/* ============================================
 * HeroSection - Portada con cortina de entrada
 *
 * La foto se elige y se descarga desde un script
 * inline, sin esperar a que React hidrate. Los
 * atributos que ese script agrega (srcset, src,
 * data-*) no vienen del render: por eso los
 * suppressHydrationWarning.
 * ============================================ */

const BOOT_SCRIPT = `(${bootHero.toString()})(${JSON.stringify(HERO_BOOT_CONFIG).replace(/</g, '\\u003c')})`

// Sin JavaScript no hay quien abra la cortina ni muestre el header
const NO_SCRIPT_STYLES = `.hero-curtain,.hero-crest{display:none}header[data-hero-gated],header[data-hero-gated] [data-hero-crest-target]{opacity:1;pointer-events:auto}`

export function HeroSection() {
  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden h-[60vh] lg:h-[84vh] bg-azul-primario">
      {/* Foto de portada: next/image no sirve aquí, la fuente se decide en el cliente */}
      <picture>
        <source type="image/avif" sizes="100vw" suppressHydrationWarning />
        <source type="image/webp" sizes="100vw" suppressHydrationWarning />
        <img
          id={HERO_BOOT_CONFIG.photoId}
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
        id={HERO_BOOT_CONFIG.crestId}
        className="hero-crest fixed left-1/2 top-1/2 z-[61] h-36 w-36 -translate-x-1/2 -translate-y-1/2 lg:h-48 lg:w-48 pointer-events-none"
        aria-hidden="true"
        suppressHydrationWarning
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero/escudo-384.webp"
          alt=""
          width={192}
          height={192}
          fetchPriority="high"
          decoding="sync"
          className="h-full w-full"
        />
      </div>

      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      <HeroBoot />

      <noscript>
        <style>{NO_SCRIPT_STYLES}</style>
      </noscript>
    </section>
  )
}
