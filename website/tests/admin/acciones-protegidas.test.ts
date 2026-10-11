import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'

/**
 * Las server actions se pueden invocar con un POST a cualquier ruta del
 * sitio (no solo a /admin), así que el middleware no las protege: cada una
 * debe cortar sin sesión antes de tocar la base o el storage.
 */

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('@/lib/admin/sharp', () => ({ cargarSharp: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { cargarSharp } = await import('@/lib/admin/sharp')

// Todos los actions.ts de app/, descubiertos solos: un módulo nuevo queda cubierto
const modulos = import.meta.glob('/app/**/actions.ts', { eager: true }) as Record<string, Record<string, unknown>>

const acciones = Object.entries(modulos).flatMap(([archivo, exportado]) =>
  Object.entries(exportado)
    .filter(([, valor]) => typeof valor === 'function')
    .map(([nombre, fn]) => ({
      accion: `${archivo.replace(/^\/app\/|\/actions\.ts$/g, '')} → ${nombre}`,
      fn: fn as (...args: unknown[]) => Promise<unknown>,
    }))
)

/** Archivos de app/ y lib/ con la directiva 'use server' */
function archivosUseServer(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name)
    if (e.isDirectory()) return archivosUseServer(ruta)
    if (!/\.tsx?$/.test(e.name)) return []
    return /^\s*['"]use server['"]/.test(readFileSync(ruta, 'utf8')) ? [ruta] : []
  })
}

describe('descubrimiento de server actions', () => {
  it('todo archivo "use server" se llama actions.ts, para que esta prueba lo encuentre', () => {
    const archivos = [...archivosUseServer('app'), ...archivosUseServer('lib')]
    expect(archivos.length).toBe(Object.keys(modulos).length)
    for (const archivo of archivos) expect(path.basename(archivo)).toBe('actions.ts')
  })
})

// Argumentos plausibles: lo que importa es que se corte antes de usarlos
const ARGS = [1, { path: 'biblioteca/x.webp', nombre: 'x', mime: 'image/webp', bytes: 1, ancho: 1, alto: 1 }, ['a'], 'x']

describe('server actions del admin sin sesión', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(false)
  })

  it('se revisan todas las acciones exportadas', () => {
    expect(acciones.length).toBeGreaterThanOrEqual(40)
  })

  it.each(acciones)('$accion se rechaza sin tocar la base', async ({ fn }) => {
    await expect(fn(...ARGS)).rejects.toThrow('No autorizado')
    expect(createAdminClient).not.toHaveBeenCalled()
    expect(cargarSharp).not.toHaveBeenCalled()
  })
})
