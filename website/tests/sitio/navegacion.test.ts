import { describe, expect, it } from 'vitest'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { getPosicionesSerie } from '@/lib/data/posiciones'

const series = NAVIGATION_ITEMS.find((item) => item.title === 'SERIES')?.submenu ?? []

describe('menú de SERIES', () => {
  it('lista las tres series', () => {
    expect(series.map((serie) => serie.title)).toEqual(['SERIE PRIMERA', 'SERIE HONOR', 'SERIE 35'])
  })

  it('cada serie despliega Plantel y Tabla de posiciones', () => {
    for (const serie of series) {
      expect(serie.submenu?.map((seccion) => seccion.title)).toEqual(['PLANTEL', 'TABLA DE POSICIONES'])
    }
  })

  it('las secciones abren la página de la serie en la pestaña que corresponde', () => {
    for (const serie of series) {
      const secciones = serie.submenu ?? []
      expect(secciones[0].href).toBe(serie.href)
      expect(secciones[1].href).toBe(`${serie.href}?tab=posiciones`)
    }
  })

  it('solo ofrece la tabla de posiciones de las series con tabla publicada', () => {
    for (const serie of series) {
      const slug = serie.href.replace('/series/', '')
      const conTabla = getPosicionesSerie(slug) !== null
      expect(serie.submenu?.some((seccion) => seccion.title === 'TABLA DE POSICIONES')).toBe(conTabla)
    }
  })
})
