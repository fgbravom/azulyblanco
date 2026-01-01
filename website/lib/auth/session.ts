import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';

/**
 * Crea una sesión de administrador
 */
export async function createSession() {
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error('SESSION_SECRET no está configurado en las variables de entorno');
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/admin',
  });
}

/**
 * Verifica si existe una sesión válida de administrador
 */
export async function verifySession(): Promise<boolean> {
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  return session?.value === sessionSecret;
}

/**
 * Destruye la sesión de administrador
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
