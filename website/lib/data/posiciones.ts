/**
 * Tabla de posiciones del Campeonato ANFA.
 *
 * La única fuente es `posiciones.json`, que se transcribe desde las imágenes
 * que publica la Asociación de Fútbol Curicó Aguas Negras. No hay base de
 * datos: cada actualización es un commit con el JSON nuevo (ver
 * Docs/POSICIONES.md). Se guarda solo la fecha vigente de cada serie.
 */

import { z } from 'zod'
import datos from './posiciones.json'

export const SLUGS_SERIE = ['primera', 'honor', '35'] as const
export type SlugSerie = (typeof SLUGS_SERIE)[number]

const filaSchema = z.object({
  pos: z.number().int().positive(),
  equipo: z.string().min(1),
  pts: z.number().int().nonnegative(),
  pj: z.number().int().nonnegative(),
  g: z.number().int().nonnegative(),
  e: z.number().int().nonnegative(),
  p: z.number().int().nonnegative(),
  gf: z.number().int().nonnegative(),
  gc: z.number().int().nonnegative(),
  dg: z.number().int(),
  es_ayb: z.boolean().optional(),
})

const serieSchema = z.object({
  slug: z.enum(SLUGS_SERIE),
  nombre: z.string().min(1),
  tabla: z.array(filaSchema).min(1),
})

const inconsistenciaSchema = z.object({
  serie: z.enum(SLUGS_SERIE),
  equipo: z.string().min(1),
  detalle: z.string().min(1),
})

const posicionesSchema = z.object({
  campeonato: z.string().min(1),
  torneo: z.string().min(1),
  organizador: z.string().min(1),
  fecha_numero: z.number().int().positive(),
  fuente: z.string().min(1),
  leyenda: z.record(z.string(), z.string()),
  series: z.array(serieSchema).min(1),
  // Nombre en la tabla → nombre en el catálogo de rivales, cuando no coinciden (para el escudo)
  equivalencias_catalogo: z.record(z.string(), z.string()),
  notas: z.array(z.string()),
  inconsistencias: z.array(inconsistenciaSchema),
})

export type FilaPosicion = z.infer<typeof filaSchema>
export type SeriePosiciones = z.infer<typeof serieSchema>
export type Inconsistencia = z.infer<typeof inconsistenciaSchema>
export type DatosPosiciones = z.infer<typeof posicionesSchema>

/** JSON validado una sola vez al cargar el módulo */
export const posiciones: DatosPosiciones = posicionesSchema.parse(datos)

/** Datos listos para pintar la tabla de una página de serie */
export interface TablaPublicada {
  campeonato: string
  torneo: string
  organizador: string
  fechaNumero: number
  leyenda: Record<string, string>
  equivalencias: Record<string, string>
  serie: SeriePosiciones
}

/**
 * Tabla de la serie que corresponde a una página de `/series/*`, o null si
 * todavía no hay tabla publicada para ese slug.
 */
export function getPosicionesSerie(slug: string): TablaPublicada | null {
  const serie = posiciones.series.find((s) => s.slug === slug)
  if (!serie) return null

  return {
    campeonato: posiciones.campeonato,
    torneo: posiciones.torneo,
    organizador: posiciones.organizador,
    fechaNumero: posiciones.fecha_numero,
    leyenda: posiciones.leyenda,
    equivalencias: posiciones.equivalencias_catalogo,
    serie,
  }
}

/**
 * Clave para cruzar el nombre de la tabla ("San Martin") con el catálogo de
 * rivales ("San Martín"): sin tildes, sin mayúsculas y sin espacios de más.
 */
export function claveEquipo(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export interface Discrepancia {
  serie: SlugSerie
  equipo: string
  campo: 'pts' | 'pj' | 'dg'
  esperado: number
  encontrado: number
}

/**
 * Filas cuyo PTS, PJ o DG no cuadran con G, E y P. La tabla oficial trae
 * anomalías reales y se publica tal cual: esto sirve para revisar una
 * transcripción nueva. Las filas ya documentadas en `inconsistencias` se
 * omiten, para que el resultado vacío signifique "nada nuevo que revisar".
 */
export function revisarCoherencia(datos: DatosPosiciones = posiciones): Discrepancia[] {
  const documentadas = new Set(datos.inconsistencias.map((i) => `${i.serie}:${i.equipo}`))
  const discrepancias: Discrepancia[] = []

  for (const serie of datos.series) {
    for (const fila of serie.tabla) {
      if (documentadas.has(`${serie.slug}:${fila.equipo}`)) continue

      const esperados: [Discrepancia['campo'], number, number][] = [
        ['pts', fila.g * 3 + fila.e, fila.pts],
        ['pj', fila.g + fila.e + fila.p, fila.pj],
        ['dg', fila.gf - fila.gc, fila.dg],
      ]

      for (const [campo, esperado, encontrado] of esperados) {
        if (esperado !== encontrado) {
          discrepancias.push({ serie: serie.slug, equipo: fila.equipo, campo, esperado, encontrado })
        }
      }
    }
  }

  return discrepancias
}
