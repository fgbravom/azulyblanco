'use client'

import { useEffect } from 'react'

/**
 * ScrollToTop - Fuerza el scroll a la parte superior en cada carga/recarga
 *
 * Este componente previene que el navegador restaure la posición de scroll
 * anterior cuando el usuario recarga la página o navega con back/forward.
 */
export function ScrollToTop() {
  useEffect(() => {
    // Forzar scroll al top inmediatamente
    window.scrollTo(0, 0)

    // Prevenir restauración automática del scroll por el navegador
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  return null
}
