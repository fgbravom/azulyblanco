import { vi } from 'vitest'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { SESSION_COOKIE, firmarToken } from '@/lib/auth/token'
import { crearSupabaseFalso } from './supabase-falso'

export const REDACTOR_ID = '11111111-2222-4333-8444-555555555555'

export type CookiesFalsas = {
  get: (nombre: string) => { name: string; value: string } | undefined
  getAll: () => { name: string; value: string }[]
  set: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  /** Cliente falso que atiende la consulta de la cuenta del redactor (si createAdminClient está mockeado) */
  base?: ReturnType<typeof crearSupabaseFalso>
}

/** Estado de la cuenta del redactor en la base; null = la cuenta no existe */
export const NOMBRE_REDACTOR = 'Redactora de Prueba'

export type CuentaFalsa = {
  activa?: boolean
  version_sesion?: number
  debe_cambiar_password?: boolean
} | null

/** Lo que devuelve la base para la cuenta del redactor; null = la cuenta no existe */
export function filaCuenta(cuenta: CuentaFalsa = {}) {
  return (
    cuenta && {
      activa: true,
      version_sesion: 0,
      debe_cambiar_password: false,
      redactores: { nombre: NOMBRE_REDACTOR },
      ...cuenta,
    }
  )
}

/**
 * Simula las cookies de la petición: con sesión de admin (`'admin'` o `true`),
 * de redactor (`'redactor'`) o sin sesión (`false`).
 * Para el redactor, si `createAdminClient` está mockeado en el archivo de prueba,
 * responde la consulta de su cuenta con `cuenta` (por defecto activa, versión 0).
 * Devuelve el almacén para revisar qué cookies escribió el código.
 */
export async function simularSesion(
  rol: 'admin' | 'redactor' | boolean,
  cuenta: CuentaFalsa = {}
): Promise<CookiesFalsas> {
  const secreto = process.env.SESSION_SECRET!
  const token =
    rol === 'redactor'
      ? await firmarToken(secreto, { rol: 'redactor', redactorId: REDACTOR_ID, version: 0 })
      : rol
        ? await firmarToken(secreto, { rol: 'admin' })
        : undefined
  const almacen: CookiesFalsas = {
    get: (nombre) => (nombre === SESSION_COOKIE && token ? { name: nombre, value: token } : undefined),
    getAll: () => (token ? [{ name: SESSION_COOKIE, value: token }] : []),
    set: vi.fn(),
    delete: vi.fn(),
  }
  vi.mocked(cookies).mockResolvedValue(almacen as unknown as Awaited<ReturnType<typeof cookies>>)

  if (rol === 'redactor' && vi.isMockFunction(createAdminClient)) {
    const fila = filaCuenta(cuenta)
    almacen.base = crearSupabaseFalso((c) => (c.tabla === 'cuentas_redactores' ? { data: fila } : undefined))
    vi.mocked(createAdminClient).mockReturnValue(almacen.base.cliente)
  }
  return almacen
}
