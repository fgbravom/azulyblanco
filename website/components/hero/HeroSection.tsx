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

  useEffect(() => {
    // Iniciar animación después de un breve delay
    const timer = setTimeout(() => {
      setAnimating(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden h-[60vh] lg:h-[84vh] bg-azul-primario">
      {/* Background Carousel */}
      <HeroCarousel />

      {/* Animated Curtain - Desliza hacia abajo */}
      <div
        className={`absolute inset-0 z-50 bg-azul-primario transition-transform duration-[1200ms] ease-in-out ${
          animating ? 'translate-y-full' : 'translate-y-0'
        }`}
      />
    </section>
  )
}
