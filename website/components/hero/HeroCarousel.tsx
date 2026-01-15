'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const heroImagesDesktop = [
  '/images/fotoportada0.jpg',
  '/images/fotoportada1.jpg',
  '/images/fotoportada2.jpg',
  '/images/fotoportada3.jpg',
  '/images/fotoportada4.jpg',
  '/images/fotoportada5.jpg',
  '/images/fotoportada6.jpg',
]

const heroImagesMobile = [
  '/images/portadamovil0.jpg',
  '/images/portadamovil1.jpg',
  '/images/portadamovil2.jpg',
  '/images/portadamovil3.jpg',
  '/images/portadamovil4.jpg',
  '/images/portadamovil5.jpg',
  '/images/portadamovil6.jpg',
]


interface HeroCarouselProps {
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

export function HeroCarousel({ currentIndex: externalIndex, onIndexChange }: HeroCarouselProps) {
  // Iniciar con valores por defecto para que servidor y cliente coincidan
  const [isMobile, setIsMobile] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Detectar viewport
    const checkIsMobile = window.innerWidth < 768
    setIsMobile(checkIsMobile)

    // Calcular siguiente índice desde localStorage
    const images = checkIsMobile ? heroImagesMobile : heroImagesDesktop
    const storageKey = checkIsMobile ? 'heroCarousel_mobile_index' : 'heroCarousel_desktop_index'
    const lastIndex = localStorage.getItem(storageKey)
    const nextIndex = lastIndex === null ? 0 : (parseInt(lastIndex) + 1) % images.length

    // Guardar el nuevo índice en localStorage
    localStorage.setItem(storageKey, nextIndex.toString())
    setSelectedIndex(nextIndex)

    // Listener para resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const heroImages = isMobile ? heroImagesMobile : heroImagesDesktop
  const currentIndex = externalIndex !== undefined ? externalIndex : selectedIndex

  // Sin rotación automática - la imagen se mantiene fija

  // Solo renderizar la imagen actual - no hay carrusel automático
  const currentImage = heroImages[currentIndex]

  return (
    <div className="absolute inset-0">
      <Image
        src={currentImage}
        alt="Azul y Blanco"
        fill
        className="object-cover object-center"
        priority
        quality={85}
        sizes="100vw"
      />
    </div>
  )
}

export { heroImagesDesktop as heroImages }
