'use client'

import { useLayoutEffect } from 'react'
import { bootHero, HERO_BOOT_CONFIG } from './hero-boot'

/**
 * En la carga inicial el script inline de HeroSection ya arrancó el hero y
 * esto no hace nada. Cubre la navegación interna hacia el home, donde React
 * no ejecuta los <script> que renderiza.
 */
export function HeroBoot() {
  useLayoutEffect(() => {
    bootHero(HERO_BOOT_CONFIG)
  }, [])

  return null
}
