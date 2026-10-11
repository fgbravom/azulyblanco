import bcrypt from 'bcryptjs';

// Solo para desarrollo local (contraseña: asd123). En producción no hay
// respaldo: sin ADMIN_PASSWORD_HASH nadie entra, porque esta contraseña es pública.
const DEV_HASH = '$2b$10$O1mN4pE8HyJQxLUdY7Ens.Rj5U5F7qojNGInzKElD9pXP9nQ4Eq7a';

/**
 * Lee el hash desde ADMIN_PASSWORD_HASH. Se acepta en base64 porque los "$"
 * del hash bcrypt se rompen en algunos .env.
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
