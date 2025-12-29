'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const heroImagesDesktop = [
  '/images/fotoportada1.jpg',
  '/images/fotoportada2.jpg',
  '/images/fotoportada3.jpg',
  '/images/fotoportada4.jpg',
]

const heroImagesMobile = [
  '/images/portadamovil0.jpg',
  '/images/portadamovil1.jpg',
  '/images/portadamovil2.jpg',
  '/images/portadamovil3.jpg',
  '/images/portadamovil4.jpg',
]

interface HeroCarouselProps {
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

export function HeroCarousel({ currentIndex: externalIndex, onIndexChange }: HeroCarouselProps) {
  // Calcular isMobile y selectedIndex ANTES del primer render para evitar flash
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })

  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (typeof window === 'undefined') return 0

    // Detectar viewport
    const checkIsMobile = window.innerWidth < 768
    const images = checkIsMobile ? heroImagesMobile : heroImagesDesktop

    // Calcular siguiente índice
    const storageKey = checkIsMobile ? 'heroCarousel_mobile_index' : 'heroCarousel_desktop_index'
    const lastIndex = localStorage.getItem(storageKey)
    const nextIndex = lastIndex === null ? 0 : (parseInt(lastIndex) + 1) % images.length

    // Guardar el nuevo índice en localStorage
    localStorage.setItem(storageKey, nextIndex.toString())

    return nextIndex
  })

  const hasInitialized = useRef(false)

  useEffect(() => {
    // Solo ejecutar una vez al montar para agregar el listener de resize
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Listener para resize (solo para actualizar isMobile, no el índice)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const heroImages = isMobile ? heroImagesMobile : heroImagesDesktop
  const currentIndex = externalIndex !== undefined ? externalIndex : selectedIndex

  // Sin rotación automática - la imagen se mantiene fija

  return (
    <div className="absolute inset-0">
      {heroImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`Azul y Blanco ${index + 1}`}
            fill
            className="object-cover object-center"
            priority={index === 0}
            quality={90}
          />
        </div>
      ))}

      {/* Dark Overlay for text contrast */}
      <div className="absolute inset-0 bg-black/0" />
    </div>
  )
}

export { heroImagesDesktop as heroImages }
