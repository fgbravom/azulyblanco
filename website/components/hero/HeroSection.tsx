'use client'

import { HeroCarousel } from './HeroCarousel'

export function HeroSection() {
  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden h-[60vh] lg:h-[85vh]">
      {/* Background Carousel */}
      <HeroCarousel />
    </section>
  )
}
