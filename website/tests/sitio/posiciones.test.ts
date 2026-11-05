import { describe, expect, it } from 'vitest'
import { getPosicionesSerie, posiciones, revisarCoherencia, SLUGS_SERIE } from '@/lib/data/posiciones'

describe('tabla de posiciones ANFA', () => {
  it('publica las tres series que tienen página propia', () => {
    expect(SLUGS_SERIE).toEqual(['primera', 'honor', '35'])
    for (const slug of SLUGS_SERIE) {
      expect(getPosicionesSerie(slug)?.serie.slug).toBe(slug)
    }
  })

  it('trae la fecha vigente y el organizador de la imagen oficial', () => {
    const tabla = getPosicionesSerie('primera')
    expect(tabla?.campeonato).toBe('Campeonato ANFA 2026')
    expect(tabla?.torneo).toBe('Clausura')
    expect(tabla?.fechaNumero).toBe(25)
    expect(tabla?.organizador).toBe('Asociación de Fútbol Curicó Aguas Negras')
  })

  it('cada tabla viene numerada del 1 al total de equipos', () => {
    expect(posiciones.series.map((serie) => serie.tabla.length)).toEqual([13, 11, 13])
    for (const serie of posiciones.series) {
      expect(serie.tabla.map((fila) => fila.pos)).toEqual(serie.tabla.map((_, i) => i + 1))
    }
  })

  it('PJ siempre es la suma de G, E y P', () => {
    for (const serie of posiciones.series) {
      for (const fila of serie.tabla) {
        expect(fila.pj, `${serie.slug}: ${fila.equipo}`).toBe(fila.g + fila.e + fila.p)
      }
    }
  })

  it('PTS, PJ y DG cuadran con G, E, P, GF y GC en todas las filas', () => {
    expect(revisarCoherencia()).toEqual([])
  })

  it('las correcciones a la imagen oficial quedan registradas', () => {
    expect(posiciones.correcciones.map((c) => `${c.serie}:${c.equipo}`)).toEqual([
      '35:Real Curicó',
      'honor:J. Aguas Negras',
      'primera:J. Valvanera',
    ])
  })

  it('marca a Azul y Blanco en las tres series', () => {
    for (const serie of posiciones.series) {
      expect(serie.tabla.filter((fila) => fila.es_ayb)).toHaveLength(1)
    }
  })

  it('no inventa una tabla para una serie sin datos', () => {
    expect(getPosicionesSerie('sub-17')).toBeNull()
  })
})
