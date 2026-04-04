'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

/* ============================================
 * HeroImage - Imagen de portada rotativa
 *
 * Muestra una imagen diferente cada vez que
 * se carga la página. Mantiene índices separados
 * para desktop y móvil en localStorage.
 * ============================================ */

// Configuración
const MOBILE_BREAKPOINT = 768

const STORAGE_KEYS = {
  desktop: 'hero_index_desktop',
  mobile: 'hero_index_mobile',
} as const

// Imágenes por dispositivo
const IMAGES = {
  desktop: [
    '/images/fotoportada0.webp',
    '/images/fotoportada1.webp',
    '/images/fotoportada2.webp',
    '/images/fotoportada3.webp',
    '/images/fotoportada4.webp',
    '/images/fotoportada5.webp',
    '/images/fotoportada6.webp',
  ],
  mobile: [
    '/images/portadamovil0.webp',
    '/images/portadamovil1.webp',
    '/images/portadamovil2.webp',
    '/images/portadamovil3.webp',
    '/images/portadamovil4.webp',
    '/images/portadamovil5.webp',
    '/images/portadamovil6.webp',
  ],
} as const

/* ============================================
 * Utilidades
 * ============================================ */

/**
 * Detecta si el viewport es móvil
 */
function checkIsMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
}

/**
 * Obtiene el siguiente índice de imagen y lo guarda en localStorage
 */
function getNextImageIndex(isMobile: boolean): number {
  const key = isMobile ? STORAGE_KEYS.mobile : STORAGE_KEYS.desktop
  const images = isMobile ? IMAGES.mobile : IMAGES.desktop

  const lastIndex = localStorage.getItem(key)
  const nextIndex = lastIndex === null
    ? 0
    : (parseInt(lastIndex, 10) + 1) % images.length

  localStorage.setItem(key, nextIndex.toString())

  return nextIndex
}

/* ============================================
 * Componente
 * ============================================ */

interface HeroCarouselProps {
  onImageLoad?: () => void
}

export function HeroCarousel({ onImageLoad }: HeroCarouselProps) {
  // Estado de la imagen a mostrar (null durante SSR)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  // Inicialización en cliente (se ejecuta una vez al montar)
  useEffect(() => {
    const isMobile = checkIsMobile()
    const index = getNextImageIndex(isMobile)
    const images = isMobile ? IMAGES.mobile : IMAGES.desktop

    setImageSrc(images[index])
  }, [])

  // Placeholder durante hidratación (el fondo azul viene del padre)
  if (!imageSrc) {
    return null
  }

  return (
    <div className="absolute inset-0">
      <Image
        src={imageSrc}
        alt="Club Deportivo Azul y Blanco"
        fill
        priority
        quality={85}
        sizes="100vw"
        placeholder="empty"
        className="object-cover object-center"
        onLoad={onImageLoad}
      />
    </div>
  )
}

// Export para compatibilidad con otros componentes
export { IMAGES as heroImages }