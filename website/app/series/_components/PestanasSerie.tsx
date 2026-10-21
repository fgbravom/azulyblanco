'use client'

import { useSyncExternalStore, type ReactNode } from 'react'
import { Tabs } from '@/components/ui/tabs'

type PestanaSerie = 'plantel' | 'posiciones'

// Al cambiar de pestaña solo se actualiza la URL (history.replaceState), que es
// la fuente de verdad; este aviso hace que useSyncExternalStore vuelva a leerla
const AVISO_CAMBIO = 'serie:pestanas'

function leerPestana(): PestanaSerie {
  return new URLSearchParams(window.location.search).get('tab') === 'posiciones' ? 'posiciones' : 'plantel'
}

function suscribirPestana(notificar: () => void) {
  window.addEventListener(AVISO_CAMBIO, notificar)
  // También al volver atrás o adelante en el historial
  window.addEventListener('popstate', notificar)
  return () => {
    window.removeEventListener(AVISO_CAMBIO, notificar)
    window.removeEventListener('popstate', notificar)
  }
}

interface PestanasSerieProps {
  /** La pestaña de tabla solo existe si hay tabla publicada */
  tieneTabla: boolean
  children: ReactNode
}

/**
 * Pestañas de una página de serie, sincronizadas con `?tab=`.
 *
 * El menú de SERIES lleva hasta `/series/<slug>?tab=posiciones` y aquí se abre
 * esa pestaña al cargar. La URL se lee en el cliente en vez de usar la prop
 * `searchParams` de la página para no convertir una ruta cacheada
 * (`revalidatePath('/series', 'layout')`) en dinámica.
 */
export function PestanasSerie({ tieneTabla, children }: PestanasSerieProps) {
  const pestanaEnUrl = useSyncExternalStore(suscribirPestana, leerPestana, () => 'plantel' as const)
  // Sin tabla publicada la pestaña de posiciones no existe
  const pestana: PestanaSerie = tieneTabla ? pestanaEnUrl : 'plantel'

  const cambiar = (valor: string) => {
    if (valor !== 'plantel' && valor !== 'posiciones') return
    // La pestaña por defecto se queda con la URL limpia de la página de la serie
    window.history.replaceState(
      null,
      '',
      valor === 'posiciones' ? `${window.location.pathname}?tab=posiciones` : window.location.pathname,
    )
    window.dispatchEvent(new Event(AVISO_CAMBIO))
  }

  return (
    <Tabs value={pestana} onValueChange={cambiar}>
      {children}
    </Tabs>
  )
}
