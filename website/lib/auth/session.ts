import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_MAX_AGE, firmarToken, verificarToken } from './token';

/**
 * Crea una sesión de administrador
 */
export async function createSession() {
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error('SESSION_SECRET no está configurado en las variables de entorno');
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await firmarToken(sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    // Raíz: las APIs del admin (/api/*) también necesitan la cookie
    path: '/',
  });
}

/**
 * Verifica si existe una sesión válida de administrador
 */
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verificarToken(cookieStore.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
}

/**
 * Corta la ejecución de una server action si no hay sesión de administrador
 */
export async function requireAdmin() {
  if (!(await verifySession())) {
    throw new Error('No autorizado');
  }
}

/**
 * Destruye la sesión de administrador
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: '/' });
  // Cookie de la versión anterior, que vivía bajo /admin
  cookieStore.delete({ name: SESSION_COOKIE, path: '/admin' });
}
