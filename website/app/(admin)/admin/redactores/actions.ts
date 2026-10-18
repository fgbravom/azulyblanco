'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { ADMIN_USUARIO, generarPasswordTemporal, hashPassword } from '@/lib/auth/password'
import { BUCKET_MEDIOS, type CuentaRedactor, type Redactor, type RedactorConCuenta } from '@/lib/contenido/tipos'

const redactorSchema = z.object({
  nombre: z.string().trim().min(1, 'Indica el nombre del redactor'),
})

// Mismo patrón que el CHECK de cuentas_redactores; se guarda en minúscula
const usuarioSchema = z
  .string({ error: 'Indica el usuario' })
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,32}$/, 'El usuario debe tener de 3 a 32 caracteres: letras, números, punto, guion o guion bajo')
  .refine((u) => u !== ADMIN_USUARIO, 'Ese usuario está reservado')

function cambios() {
  revalidatePath('/admin/redactores')
  revalidatePath('/admin/noticias', 'layout')
  revalidarSitio('noticias')
}

/** Ruta en el bucket de un avatar subido desde el admin; null si es un archivo de public/ */
function pathEnBucket(url: string | null) {
  const path = url?.split(`/object/public/${BUCKET_MEDIOS}/`)[1]
  return path?.startsWith('redactores/') ? path : null
}

export async function listarRedactores(): Promise<RedactorConCuenta[]> {
  await requireAdmin()
  // Columnas de la cuenta una a una: el hash de la contraseña nunca sale del servidor
  const { data, error } = await createAdminClient()
    .from('redactores')
    .select('*, cuentas_redactores(usuario, activa, ultimo_ingreso, debe_cambiar_password)')
    .order('nombre')
  if (error) throw new Error(error.message)
  return (data as (Redactor & { cuentas_redactores: CuentaRedactor | CuentaRedactor[] | null })[]).map(
    ({ cuentas_redactores, ...redactor }) => ({
      ...redactor,
      cuenta: (Array.isArray(cuentas_redactores) ? cuentas_redactores[0] : cuentas_redactores) ?? null,
    })
  )
}

/**
 * Crea o actualiza un redactor. `avatarPath` es la ruta dentro del bucket
 * "medios" de una imagen ya subida con URL firmada (destino "redactor"); se
 * guarda su URL pública. `undefined` conserva el avatar anterior y `null` lo quita.
 */
export async function guardarRedactor(
  id: string | null,
  input: { nombre: string; avatarPath?: string | null }
): Promise<Redactor> {
  await requireAdmin()

  const parsed = redactorSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const fila: Record<string, unknown> = { nombre: parsed.data.nombre }

  const supabase = createAdminClient()

  let avatarAnterior: string | null = null
  if (id) {
    const { data: actual } = await supabase.from('redactores').select('avatar_url').eq('id', id).maybeSingle()
    avatarAnterior = actual?.avatar_url ?? null
  }

  const cambiaAvatar = input.avatarPath !== undefined
  if (input.avatarPath) {
    if (!input.avatarPath.startsWith('redactores/')) throw new Error('Ruta de avatar inválida')
    fila.avatar_url = supabase.storage.from(BUCKET_MEDIOS).getPublicUrl(input.avatarPath).data.publicUrl
  } else if (input.avatarPath === null) {
    fila.avatar_url = null
  }

  const consulta = id
    ? supabase.from('redactores').update(fila).eq('id', id)
    : supabase.from('redactores').insert(fila)
  const { data, error } = await consulta.select().single()
  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un redactor con ese nombre')
    throw new Error(error.message)
  }

  // Las noticias guardan también el nombre como texto: se mantiene al día
  if (id) {
    const { error: errorNoticias } = await supabase.from('noticias').update({ autor: parsed.data.nombre }).eq('redactor_id', id)
    if (errorNoticias) throw new Error(errorNoticias.message)
  }

  // Se reemplazó o quitó el avatar: el archivo anterior ya no se usa
  if (cambiaAvatar && avatarAnterior && avatarAnterior !== fila.avatar_url) {
    const pathAnterior = pathEnBucket(avatarAnterior)
    if (pathAnterior) await supabase.storage.from(BUCKET_MEDIOS).remove([pathAnterior])
  }

  cambios()
  return data as Redactor
}

export async function eliminarRedactor(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: redactor, error } = await supabase.from('redactores').select('avatar_url').eq('id', id).single()
  if (error) throw new Error(error.message)

  const { error: errorBorrado } = await supabase.from('redactores').delete().eq('id', id)
  if (errorBorrado) throw new Error(errorBorrado.message)

  const path = pathEnBucket(redactor.avatar_url)
  if (path) await supabase.storage.from(BUCKET_MEDIOS).remove([path])

  cambios()
}

// ============================================================================
// Acceso al panel (cuentas de redactores)
// ============================================================================

function validarUsuario(usuario: string): string {
  const parsed = usuarioSchema.safeParse(usuario)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Usuario inválido')
  return parsed.data
}

// Los helpers no se exportan: todo export de un actions.ts es una server action
function errorDeCuenta(error: { code?: string; message: string }): Error {
  if (error.code === '23505') {
    return new Error(error.message.includes('pkey') ? 'Este redactor ya tiene acceso' : 'Ya existe una cuenta con ese usuario')
  }
  if (error.code === '23503') return new Error('El redactor ya no existe')
  if (error.code === 'PGRST116') return new Error('Este redactor no tiene acceso al panel')
  return new Error(error.message)
}

async function versionDeSesion(supabase: ReturnType<typeof createAdminClient>, redactorId: string): Promise<number> {
  const { data, error } = await supabase.from('cuentas_redactores').select('version_sesion').eq('redactor_id', redactorId).single()
  if (error) throw errorDeCuenta(error)
  return data.version_sesion
}

/** Crea el acceso de un redactor. La contraseña temporal se devuelve una sola vez. */
export async function crearCuenta(redactorId: string, usuario: string): Promise<{ usuario: string; passwordTemporal: string }> {
  await requireAdmin()
  const nombre = validarUsuario(usuario)
  const passwordTemporal = generarPasswordTemporal()

  const { error } = await createAdminClient()
    .from('cuentas_redactores')
    .insert({
      redactor_id: redactorId,
      usuario: nombre,
      password_hash: await hashPassword(passwordTemporal),
      debe_cambiar_password: true,
    })
  if (error) throw errorDeCuenta(error)

  revalidatePath('/admin/redactores')
  return { usuario: nombre, passwordTemporal }
}

export async function cambiarUsuario(redactorId: string, usuario: string): Promise<{ usuario: string }> {
  await requireAdmin()
  const nombre = validarUsuario(usuario)

  const { error } = await createAdminClient()
    .from('cuentas_redactores')
    .update({ usuario: nombre })
    .eq('redactor_id', redactorId)
    .select('usuario')
    .single()
  if (error) throw errorDeCuenta(error)

  revalidatePath('/admin/redactores')
  return { usuario: nombre }
}

/** Nueva contraseña temporal; cierra las sesiones abiertas del redactor y le exige cambiarla */
export async function restablecerPassword(redactorId: string): Promise<{ passwordTemporal: string }> {
  await requireAdmin()
  const supabase = createAdminClient()
  const version = await versionDeSesion(supabase, redactorId)
  const passwordTemporal = generarPasswordTemporal()

  const { error } = await supabase
    .from('cuentas_redactores')
    .update({
      password_hash: await hashPassword(passwordTemporal),
      debe_cambiar_password: true,
      version_sesion: version + 1,
    })
    .eq('redactor_id', redactorId)
  if (error) throw errorDeCuenta(error)

  revalidatePath('/admin/redactores')
  return { passwordTemporal }
}

/** Activa o desactiva el acceso; al desactivar se cierran sus sesiones abiertas */
export async function cambiarEstadoCuenta(redactorId: string, activa: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  const cambio: { activa: boolean; version_sesion?: number } = { activa }
  if (!activa) cambio.version_sesion = (await versionDeSesion(supabase, redactorId)) + 1

  const { error } = await supabase.from('cuentas_redactores').update(cambio).eq('redactor_id', redactorId)
  if (error) throw errorDeCuenta(error)

  revalidatePath('/admin/redactores')
}
