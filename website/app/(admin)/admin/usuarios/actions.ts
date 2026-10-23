'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { generarPasswordTemporal, hashPassword } from '@/lib/auth/password'
import { validarUsuario } from '@/lib/auth/usuario'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CuentaPanel } from '@/lib/contenido/tipos'

type Rol = CuentaPanel['rol']

const nombreSchema = z.string().trim().min(1, 'Indica el nombre del colaborador')

function validarNombre(nombre: string): string {
  const parsed = nombreSchema.safeParse(nombre)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Nombre inválido')
  return parsed.data
}

function errorDeCuenta(error: { code?: string; message: string }): Error {
  if (error.code === '23505') return new Error('Ya existe una cuenta con ese usuario')
  return new Error(error.message)
}

function errorDeRedactor(error: { code?: string; message: string }): Error {
  if (error.code === '23505') return new Error('Ya existe un redactor con ese nombre')
  return new Error(error.message)
}

function cambios() {
  revalidatePath('/admin/usuarios')
  revalidatePath('/admin/redactores')
}

export async function listarCuentas(): Promise<CuentaPanel[]> {
  await requireAdmin()
  const { data, error } = await createAdminClient()
    .from('cuentas_panel')
    .select('id, usuario, rol, activa, ultimo_ingreso, debe_cambiar_password, redactores(nombre)')
    .order('rol')
    .order('usuario')
  if (error) throw new Error(error.message)

  return (data as unknown as {
    id: string
    usuario: string
    rol: Rol
    activa: boolean
    ultimo_ingreso: string | null
    debe_cambiar_password: boolean
    redactores: { nombre: string } | { nombre: string }[] | null
  }[]).map(({ redactores, ...cuenta }) => {
    const redactor = Array.isArray(redactores) ? redactores[0] : redactores
    return { ...cuenta, nombre: redactor?.nombre ?? 'Administración' }
  })
}

/**
 * Crea una cuenta con contraseña temporal (se devuelve una sola vez). Un
 * colaborador también crea su redactor, que es su firma en las noticias.
 */
export async function crearCuenta(input: {
  usuario: string
  rol: Rol
  nombre?: string
}): Promise<{ usuario: string; passwordTemporal: string }> {
  await requireAdmin()
  const usuario = validarUsuario(input.usuario)
  const passwordTemporal = generarPasswordTemporal()
  const datos = {
    usuario,
    password_hash: await hashPassword(passwordTemporal),
    debe_cambiar_password: true,
  }
  const supabase = createAdminClient()

  if (input.rol === 'admin') {
    const { error } = await supabase.from('cuentas_panel').insert({ ...datos, rol: 'admin' })
    if (error) throw errorDeCuenta(error)
  } else {
    const nombre = validarNombre(input.nombre ?? '')
    const { data: redactor, error: errorRedactor } = await supabase.from('redactores').insert({ nombre }).select('id').single()
    if (errorRedactor) throw errorDeRedactor(errorRedactor)

    const { error } = await supabase
      .from('cuentas_panel')
      .insert({ ...datos, rol: 'colaborador', redactor_id: redactor.id })
    if (error) {
      await supabase.from('redactores').delete().eq('id', redactor.id)
      throw errorDeCuenta(error)
    }
  }

  cambios()
  return { usuario, passwordTemporal }
}

/**
 * Pasa una cuenta a otro rol. Cierra sus sesiones abiertas. Al pasar a
 * colaborador se le pide una contraseña nueva, porque necesita un redactor.
 */
export async function cambiarRol(cuentaId: string, rol: Rol, nombre?: string) {
  const sesion = await requireAdmin()
  if (sesion.cuentaId === cuentaId) throw new Error('No puedes cambiar tu propio rol')

  const supabase = createAdminClient()
  const { data: actual, error } = await supabase.from('cuentas_panel').select('rol, version_sesion').eq('id', cuentaId).single()
  if (error) throw new Error(error.message)
  if (actual.rol === rol) return

  const version = actual.version_sesion + 1

  if (rol === 'admin') {
    const { error: errorCambio } = await supabase
      .from('cuentas_panel')
      .update({ rol: 'admin', redactor_id: null, version_sesion: version })
      .eq('id', cuentaId)
    if (errorCambio) throw errorDeCuenta(errorCambio)
  } else {
    const nuevoNombre = validarNombre(nombre ?? '')
    const { data: redactor, error: errorRedactor } = await supabase.from('redactores').insert({ nombre: nuevoNombre }).select('id').single()
    if (errorRedactor) throw errorDeRedactor(errorRedactor)

    const { error: errorCambio } = await supabase
      .from('cuentas_panel')
      .update({ rol: 'colaborador', redactor_id: redactor.id, version_sesion: version, debe_cambiar_password: true })
      .eq('id', cuentaId)
    if (errorCambio) {
      await supabase.from('redactores').delete().eq('id', redactor.id)
      throw errorDeCuenta(errorCambio)
    }
  }

  cambios()
}

/** Nueva contraseña temporal; cierra las sesiones abiertas de la cuenta */
export async function restablecerPassword(cuentaId: string): Promise<{ passwordTemporal: string }> {
  const sesion = await requireAdmin()
  if (sesion.cuentaId === cuentaId) throw new Error('Para cambiar tu contraseña usa Mi cuenta')

  const supabase = createAdminClient()
  const { data: actual, error } = await supabase.from('cuentas_panel').select('version_sesion').eq('id', cuentaId).single()
  if (error) throw new Error(error.message)

  const passwordTemporal = generarPasswordTemporal()
  const { error: errorCambio } = await supabase
    .from('cuentas_panel')
    .update({
      password_hash: await hashPassword(passwordTemporal),
      debe_cambiar_password: true,
      version_sesion: actual.version_sesion + 1,
    })
    .eq('id', cuentaId)
  if (errorCambio) throw errorDeCuenta(errorCambio)

  cambios()
  return { passwordTemporal }
}

/** Activa o desactiva una cuenta; al desactivar se cierran sus sesiones abiertas */
export async function cambiarEstado(cuentaId: string, activa: boolean) {
  const sesion = await requireAdmin()
  if (sesion.cuentaId === cuentaId) throw new Error('No puedes desactivar tu propia cuenta')

  const supabase = createAdminClient()
  const cambio: { activa: boolean; version_sesion?: number } = { activa }
  if (!activa) {
    const { data: actual, error } = await supabase.from('cuentas_panel').select('version_sesion').eq('id', cuentaId).single()
    if (error) throw new Error(error.message)
    cambio.version_sesion = actual.version_sesion + 1
  }

  const { error } = await supabase.from('cuentas_panel').update(cambio).eq('id', cuentaId)
  if (error) throw errorDeCuenta(error)

  cambios()
}
