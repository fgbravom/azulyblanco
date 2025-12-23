'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const heroImagesDesktop = [
  '/images/fotoportada.jpg',
  '/images/fotoportada2.jpg',
  '/images/fotoportada3.jpg',
  '/images/fotoportada4.jpg',
]

const heroImagesMobile = [
  '/images/portadamovil1.jpg',
  '/images/portadamovil2.jpg',
  '/images/portadamovil3.jpg',
]

interface HeroCarouselProps {
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

export function HeroCarousel({ currentIndex: externalIndex, onIndexChange }: HeroCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const heroImages = isMobile ? heroImagesMobile : heroImagesDesktop

  useEffect(() => {
    const interval = setInterval(() => {
      const newIndex = (currentIndex + 1) % heroImages.length
      if (externalIndex === undefined) {
        setInternalIndex(newIndex)
      }
      onIndexChange?.(newIndex)
    }, 5000) // Cambiar cada 5 segundos

    return () => clearInterval(interval)
  }, [currentIndex, externalIndex, onIndexChange, heroImages.length])

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
