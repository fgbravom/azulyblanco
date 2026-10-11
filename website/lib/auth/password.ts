import bcrypt from 'bcryptjs';

// Hash de respaldo mientras no exista ADMIN_PASSWORD_HASH (contraseña: asd123)
const FALLBACK_HASH = '$2b$10$O1mN4pE8HyJQxLUdY7Ens.Rj5U5F7qojNGInzKElD9pXP9nQ4Eq7a';

/**
 * Lee el hash desde ADMIN_PASSWORD_HASH. Se acepta en base64 porque los "$"
 * del hash bcrypt se rompen en algunos .env.
 */
function getPasswordHash(): string {
  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!raw) return FALLBACK_HASH;
  if (raw.startsWith('$2')) return raw;
  return Buffer.from(raw, 'base64').toString('utf8');
}

/**
 * Verifica si la contraseña ingresada coincide con el hash almacenado
 */
export async function verifyPassword(inputPassword: string): Promise<boolean> {
  return bcrypt.compare(inputPassword, getPasswordHash());
}
