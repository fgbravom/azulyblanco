import { z } from 'zod'
import { ADMIN_USUARIO } from './password'

// Mismo patrón que el CHECK de cuentas_panel; se guarda en minúscula
const usuarioSchema = z
  .string({ error: 'Indica el usuario' })
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,32}$/, 'El usuario debe tener de 3 a 32 caracteres: letras, números, punto, guion o guion bajo')
  .refine((u) => u !== ADMIN_USUARIO, 'Ese usuario está reservado')

export function validarUsuario(usuario: string): string {
  const parsed = usuarioSchema.safeParse(usuario)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Usuario inválido')
  return parsed.data
}
