'use server'

import bcrypt from 'bcryptjs'
import { hashPassword, validarPasswordNueva } from '@/lib/auth/password'
import { createSession, obtenerSesion } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Un redactor cambia su propia contraseña. El admin no: la suya vive en una
 * variable de entorno. Subir la versión cierra sus demás sesiones, y la cookie
 * se vuelve a emitir para no cerrar la actual.
 */
export async function cambiarMiPassword(actual: string, nueva: string) {
  const sesion = await obtenerSesion()
  if (sesion?.rol !== 'redactor') throw new Error('No autorizado')

  if (typeof actual !== 'string' || typeof nueva !== 'string' || !actual) throw new Error('Indica tu contraseña actual')
  const invalida = validarPasswordNueva(nueva)
  if (invalida) throw new Error(invalida)
  if (nueva === actual) throw new Error('La nueva contraseña debe ser distinta de la actual')

  const supabase = createAdminClient()
  const { data: cuenta, error } = await supabase
    .from('cuentas_redactores')
    .select('password_hash, version_sesion')
    .eq('redactor_id', sesion.redactorId)
    .single()
  if (error) throw new Error(error.message)

  if (!(await bcrypt.compare(actual, cuenta.password_hash))) throw new Error('La contraseña actual no es correcta')

  const version = cuenta.version_sesion + 1
  const { error: errorGuardado } = await supabase
    .from('cuentas_redactores')
    .update({ password_hash: await hashPassword(nueva), debe_cambiar_password: false, version_sesion: version })
    .eq('redactor_id', sesion.redactorId)
  if (errorGuardado) throw new Error(errorGuardado.message)

  await createSession({ rol: 'redactor', redactorId: sesion.redactorId, version })
}
