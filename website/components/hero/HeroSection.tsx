'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const HeroCarousel = dynamic(() => import('./HeroCarousel').then(mod => ({ default: mod.HeroCarousel })), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-azul-primario" />
  )
})

export function HeroSection() {
  const [animating, setAnimating] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // Timeout máximo: animar aunque la imagen no haya cargado
    const maxWait = setTimeout(() => {
      setAnimating(true)
    }, 800)

    return () => clearTimeout(maxWait)
  }, [])

  useEffect(() => {
    // Animar en cuanto la imagen esté lista (puede ser antes del timeout)
    // 300ms mínimo para garantizar que el browser pintó el estado inicial
    if (imageLoaded) {
      const timer = setTimeout(() => {
        setAnimating(true)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [imageLoaded])

  // Emitir evento global cuando la imagen está lista
  useEffect(() => {
    if (imageLoaded) {
      window.dispatchEvent(new Event('heroImageLoaded'))
    }
  }, [imageLoaded])

  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden transform-gpu h-[60vh] lg:h-[84vh] bg-azul-primario">
      {/* Background Carousel */}
      <HeroCarousel onImageLoad={() => setImageLoaded(true)} />

      {/* Animated Curtain - Desliza hacia abajo */}
      <div
        className={`absolute inset-0 z-50 bg-azul-primario transition-transform duration-[1200ms] ease-in-out ${
          animating ? 'translate-y-full' : 'translate-y-0'
        }`}
      />
    </section>
  )
}
