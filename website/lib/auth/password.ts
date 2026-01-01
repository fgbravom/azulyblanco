import bcrypt from 'bcryptjs';

/**
 * Verifica si la contraseña ingresada coincide con el hash almacenado
 */
export async function verifyPassword(inputPassword: string): Promise<boolean> {
  // Hash hardcoded temporal para evitar problemas con $ en .env
  // Este hash corresponde a la contraseña: asd123
  const TEMP_HASH = '$2b$10$O1mN4pE8HyJQxLUdY7Ens.Rj5U5F7qojNGInzKElD9pXP9nQ4Eq7a';

  return bcrypt.compare(inputPassword, TEMP_HASH);
}
