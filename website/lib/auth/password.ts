import bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DatosToken } from './token';

/** Usuario del administrador. Ningún colaborador puede usarlo. */
export const ADMIN_USUARIO = 'ab06';

// Hash sin dueño: se compara cuando el usuario no existe para que la respuesta
// tarde lo mismo y no revele qué usuarios hay
const HASH_FICTICIO = '$2b$10$hcyRwU3SaT0FCFvjJ9GO7OBDPLj8vCddLFrohU7v2tW7GCrI01y1m';

const PASSWORD_MINIMO = 10;
// Sin 0/O/l/1/I para que se pueda dictar o copiar a mano
const LEGIBLES = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

// Solo para desarrollo local (contraseña: asd123). En producción no hay
// respaldo: sin ADMIN_PASSWORD_HASH nadie entra, porque esta contraseña es pública.
const DEV_HASH = '$2b$10$O1mN4pE8HyJQxLUdY7Ens.Rj5U5F7qojNGInzKElD9pXP9nQ4Eq7a';

/**
 * Lee el hash desde ADMIN_PASSWORD_HASH. Se acepta en base64 porque los "$"
 * del hash bcrypt se rompen en algunos .env. Solo sirve para crear la cuenta
 * del admin en su primer ingreso; después la contraseña vive en la base.
 */
function getPasswordHash(): string | null {
  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!raw) return process.env.NODE_ENV === 'production' ? null : DEV_HASH;
  if (raw.startsWith('$2')) return raw;
  return Buffer.from(raw, 'base64').toString('utf8');
}

/**
 * Verifica si la contraseña ingresada coincide con el hash almacenado
 */
export async function verifyPassword(inputPassword: string): Promise<boolean> {
  const hash = getPasswordHash();
  if (!hash) {
    console.error('ADMIN_PASSWORD_HASH no está configurado: el login queda cerrado');
    return false;
  }
  return bcrypt.compare(inputPassword, hash);
}

/** Hash bcrypt (costo 10) de una contraseña nueva */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Mensaje de error si la contraseña nueva no sirve, o null si está bien */
export function validarPasswordNueva(password: string): string | null {
  if (password.length < PASSWORD_MINIMO) {
    return `La contraseña debe tener al menos ${PASSWORD_MINIMO} caracteres`;
  }
  return null;
}

/** Contraseña temporal de 12 caracteres legibles, para que el admin la entregue a un redactor */
export function generarPasswordTemporal(): string {
  return Array.from({ length: 12 }, () => LEGIBLES[randomInt(LEGIBLES.length)]).join('');
}

/**
 * Valida usuario y contraseña. Devuelve los datos para firmar la sesión, o null
 * si no calzan (usuario inexistente, cuenta inactiva o contraseña mala).
 */
export async function verificarCredenciales(usuario: string, password: string): Promise<DatosToken | null> {
  const nombre = usuario.trim().toLowerCase();
  const supabase = createAdminClient();

  // El usuario se guarda en minúscula (CHECK en la tabla), así que basta comparar con igualdad
  const { data: cuenta } = await supabase
    .from('cuentas_panel')
    .select('id, rol, password_hash, activa, version_sesion')
    .eq('usuario', nombre)
    .maybeSingle();

  // Primer ingreso del admin: la contraseña de ADMIN_PASSWORD_HASH crea su cuenta.
  // Desde entonces su contraseña se cambia en la base y la variable ya no cuenta.
  if (nombre === ADMIN_USUARIO && !cuenta) {
    const hash = getPasswordHash();
    if (!hash || !(await verifyPassword(password))) return null;

    const { data: nueva, error } = await supabase
      .from('cuentas_panel')
      .insert({ usuario: ADMIN_USUARIO, rol: 'admin', password_hash: hash, debe_cambiar_password: false })
      .select('id, version_sesion')
      .single();
    if (error) throw new Error(error.message);

    return { rol: 'admin', cuentaId: nueva.id, version: nueva.version_sesion };
  }

  const coincide = await bcrypt.compare(password, cuenta?.password_hash ?? HASH_FICTICIO);
  if (!cuenta || !coincide || !cuenta.activa) return null;

  await supabase
    .from('cuentas_panel')
    .update({ ultimo_ingreso: new Date().toISOString() })
    .eq('id', cuenta.id);

  return { rol: cuenta.rol as DatosToken['rol'], cuentaId: cuenta.id, version: cuenta.version_sesion };
}
