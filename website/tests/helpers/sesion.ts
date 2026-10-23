import { vi } from 'vitest'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { SESSION_COOKIE, firmarToken } from '@/lib/auth/token'
import { crearSupabaseFalso, sesionDePrueba } from './supabase-falso'

/** Redactor (firma de noticias) de la cuenta colaboradora de prueba */
export const REDACTOR_ID = '11111111-2222-4333-8444-555555555555'
export const CUENTA_COLABORADOR_ID = '22222222-3333-4444-8555-666666666666'
export const CUENTA_ADMIN_ID = '33333333-4444-4555-8666-777777777777'
export const NOMBRE_REDACTOR = 'Redactora de Prueba'

export type CookiesFalsas = {
  get: (nombre: string) => { name: string; value: string } | undefined
  getAll: () => { name: string; value: string }[]
  set: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  /** Cliente falso que atiende la consulta de la cuenta (si createAdminClient está mockeado) */
  base?: ReturnType<typeof crearSupabaseFalso>
}

export type CuentaFalsa = {
  activa?: boolean
  version_sesion?: number
  debe_cambiar_password?: boolean
} | null

/** Lo que devuelve la base para la cuenta colaboradora; null = la cuenta no existe */
export function filaCuenta(cuenta: CuentaFalsa = {}) {
  return (
    cuenta && {
      rol: 'colaborador',
      activa: true,
      version_sesion: 0,
      debe_cambiar_password: false,
      redactor_id: REDACTOR_ID,
      redactores: { nombre: NOMBRE_REDACTOR },
      ...cuenta,
    }
  )
}

/** Lo que devuelve la base para la cuenta del administrador */
function filaAdmin(cuenta: CuentaFalsa = {}) {
  return (
    cuenta && {
      rol: 'admin',
      activa: true,
      version_sesion: 0,
      debe_cambiar_password: false,
      redactor_id: null,
      redactores: null,
      ...cuenta,
    }
  )
}

/**
 * Simula las cookies de la petición: con sesión de administrador (`'admin'` o `true`),
 * de colaborador (`'colaborador'`) o sin sesión (`false`).
 * Si `createAdminClient` está mockeado en el archivo de prueba, la consulta de la
 * cuenta responde con `cuenta` (por defecto activa, versión 0; `null` = no existe).
 * Devuelve el almacén para revisar qué cookies escribió el código.
 */
export async function simularSesion(
  rol: 'admin' | 'colaborador' | boolean,
  cuenta: CuentaFalsa = {}
): Promise<CookiesFalsas> {
  const secreto = process.env.SESSION_SECRET!
  const token =
    rol === 'colaborador'
      ? await firmarToken(secreto, { rol: 'colaborador', cuentaId: CUENTA_COLABORADOR_ID, version: 0 })
      : rol
        ? await firmarToken(secreto, { rol: 'admin', cuentaId: CUENTA_ADMIN_ID, version: 0 })
        : undefined
  const almacen: CookiesFalsas = {
    get: (nombre) => (nombre === SESSION_COOKIE && token ? { name: nombre, value: token } : undefined),
    getAll: () => (token ? [{ name: SESSION_COOKIE, value: token }] : []),
    set: vi.fn(),
    delete: vi.fn(),
  }
  vi.mocked(cookies).mockResolvedValue(almacen as unknown as Awaited<ReturnType<typeof cookies>>)

  const fila = rol === 'colaborador' ? filaCuenta(cuenta) : filaAdmin(cuenta)
  sesionDePrueba.activa = Boolean(rol)
  sesionDePrueba.fila = fila ?? null

  if (rol && vi.isMockFunction(createAdminClient)) {
    almacen.base = crearSupabaseFalso((c) => (c.tabla === 'cuentas_panel' ? { data: fila } : undefined))
    vi.mocked(createAdminClient).mockReturnValue(almacen.base.cliente)
  }
  return almacen
}
