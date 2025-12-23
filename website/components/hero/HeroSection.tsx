'use client'

import { useState } from 'react'
import Image from 'next/image'
import { HeroCarousel, heroImages } from './HeroCarousel'

export function HeroSection() {
  const [carouselIndex, setCarouselIndex] = useState(0)

  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden" style={{ height: '100vh' }}>
      {/* Background Carousel */}
      <HeroCarousel currentIndex={carouselIndex} onIndexChange={setCarouselIndex} />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
        {/* Escudo */}
        <div className="mb-4 animate-fade-in">
          <div className="w-28 h-28 md:w-32 md:h-32 mx-auto flex items-center justify-center">
            <Image
              src="/images/escudoazulyblanco.png"
              alt="Escudo Azul y Blanco"
              width={128}
              height={128}
              className="drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Indicadores del carrusel */}
        <div className="flex gap-2 justify-center mb-8">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCarouselIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === carouselIndex
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>

        {/* Main Heading */}
        {/* <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
          Club Deportivo
          <br />
          <span className="text-azul-claro">Azul</span> y <span className="text-white">Blanco</span>
        </h1> */}

        {/* Subtitle */}
        <p className="text-lg md:text-2xl mb-4 text-gray-100 font-light max-w-3xl mx-auto leading-relaxed">
          Más que un club.
        </p>

        <p className="text-base md:text-lg mb-10 text-white/90 font-medium">
          Desde 2006 • Curicó, Chile
        </p>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="hidden md:block absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
