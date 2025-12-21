'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const heroImages = [
  '/images/fotoportada.jpg',
  '/images/fotoportada2.jpg',
  '/images/fotoportada3.jpg',
]

interface HeroCarouselProps {
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

export function HeroCarousel({ currentIndex: externalIndex, onIndexChange }: HeroCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0)
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex

  useEffect(() => {
    const interval = setInterval(() => {
      const newIndex = (currentIndex + 1) % heroImages.length
      if (externalIndex === undefined) {
        setInternalIndex(newIndex)
      }
      onIndexChange?.(newIndex)
    }, 5000) // Cambiar cada 5 segundos

    return () => clearInterval(interval)
  }, [currentIndex, externalIndex, onIndexChange])

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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-azul-oscuro/90 via-azul-primario/70 to-azul-oscuro/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
    </div>
  )
}

export { heroImages }
