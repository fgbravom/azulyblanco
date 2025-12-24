'use client'

import { useState } from 'react'
import { HeroCarousel } from './HeroCarousel'

export function HeroSection() {
  const [carouselIndex, setCarouselIndex] = useState(0)

  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden h-[60vh] md:h-screen">
      {/* Background Carousel */}
      <HeroCarousel currentIndex={carouselIndex} onIndexChange={setCarouselIndex} />
    </section>
  )
}
