import { vi } from 'vitest'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, firmarToken } from '@/lib/auth/token'

export type CookiesFalsas = {
  get: (nombre: string) => { name: string; value: string } | undefined
  getAll: () => { name: string; value: string }[]
  set: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

/**
 * Simula las cookies de la petición: con sesión de admin válida, o sin ella.
 * Devuelve el almacén para revisar qué cookies escribió el código.
 */
export async function simularSesion(valida: boolean): Promise<CookiesFalsas> {
  const token = valida ? await firmarToken(process.env.SESSION_SECRET!) : undefined
  const almacen: CookiesFalsas = {
    get: (nombre) => (nombre === SESSION_COOKIE && token ? { name: nombre, value: token } : undefined),
    getAll: () => (token ? [{ name: SESSION_COOKIE, value: token }] : []),
    set: vi.fn(),
    delete: vi.fn(),
  }
  vi.mocked(cookies).mockResolvedValue(almacen as unknown as Awaited<ReturnType<typeof cookies>>)
  return almacen
}
