'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const heroImages = [
  '/images/fotoportada.jpg',
  '/images/fotoportada2.jpg',
  '/images/fotoportada3.jpg',
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000) // Cambiar cada 5 segundos

    return () => clearInterval(interval)
  }, [])

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

      {/* Indicadores sutiles */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
