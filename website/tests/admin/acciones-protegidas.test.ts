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

// Acciones públicas: no tocan la base ni el storage y no exigen sesión.
// Si aparece una acá, el cambio debe justificarse en la revisión del PR.
const ACCIONES_PUBLICAS = new Set(['contacto → enviarMensajeContacto'])

describe('server actions del admin sin sesión', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(false)
  })

  it('se revisan todas las acciones exportadas', () => {
    expect(acciones.length).toBeGreaterThanOrEqual(40)
    // La lista de públicas no puede quedarse con nombres que ya no existen
    for (const publica of ACCIONES_PUBLICAS) {
      expect(acciones.some((a) => a.accion === publica)).toBe(true)
    }
  })

  it.each(acciones.filter((a) => !ACCIONES_PUBLICAS.has(a.accion)))(
    '$accion se rechaza sin tocar la base',
    async ({ fn }) => {
      await expect(fn(...ARGS)).rejects.toThrow('No autorizado')
      expect(createAdminClient).not.toHaveBeenCalled()
      expect(cargarSharp).not.toHaveBeenCalled()
    }
  )
})

// Acciones que además puede usar un redactor (requireEditorNoticias). Cada una
// aplica sus propias reglas (solo sus noticias, solo la biblioteca...), que se prueban
// aparte; agregar una acá debe justificarse en la revisión del PR.
const ACCIONES_REDACTOR = new Set([
  '(admin)/admin/noticias → listarNoticias',
  '(admin)/admin/noticias → obtenerNoticia',
  '(admin)/admin/noticias → guardarNoticia',
  '(admin)/admin/noticias → cambiarPublicacionNoticia',
  '(admin)/admin/medios → prepararSubida',
  '(admin)/admin/medios → listarMedios',
  '(admin)/admin/medios → registrarMedio',
  '(admin)/admin/cuenta → cambiarMiPassword',
])

describe('server actions del admin con sesión de redactor', () => {
  let base: Awaited<ReturnType<typeof simularSesion>>['base']

  beforeEach(async () => {
    vi.clearAllMocks()
    base = (await simularSesion('redactor')).base
  })

  it('la lista blanca no se queda con nombres que ya no existen', () => {
    for (const permitida of ACCIONES_REDACTOR) {
      expect(acciones.some((a) => a.accion === permitida)).toBe(true)
    }
  })

  it.each(acciones.filter((a) => !ACCIONES_PUBLICAS.has(a.accion) && !ACCIONES_REDACTOR.has(a.accion)))(
    '$accion se rechaza',
    async ({ fn }) => {
      await expect(fn(...ARGS)).rejects.toThrow('No autorizado')
      // Lo único que puede consultarse es la cuenta del redactor, nunca contenido
      expect(base!.consultas.every((c) => c.tabla === 'cuentas_redactores')).toBe(true)
      expect(cargarSharp).not.toHaveBeenCalled()
    }
  )
})
