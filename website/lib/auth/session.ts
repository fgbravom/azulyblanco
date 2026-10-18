import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SESSION_COOKIE, SESSION_MAX_AGE, firmarToken, verificarToken, type DatosToken } from './token';

export type Sesion =
  | { rol: 'admin' }
  | { rol: 'redactor'; redactorId: string; nombre: string; debeCambiarPassword: boolean };

/**
 * Crea la sesión de un administrador o de un redactor
 */
export async function createSession(datos: DatosToken) {
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error('SESSION_SECRET no está configurado en las variables de entorno');
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await firmarToken(sessionSecret, datos), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    // Raíz: las APIs del admin (/api/*) también necesitan la cookie
    path: '/',
  });
}

/**
 * Sesión vigente o null. Sin cookie válida no toca la base; para un redactor
 * confirma que la cuenta exista, esté activa y su versión de sesión coincida
 * (subirla en la base cierra todas sus sesiones). Se memoiza por petición.
 */
export const obtenerSesion = cache(async (): Promise<Sesion | null> => {
  const cookieStore = await cookies();
  const datos = await verificarToken(cookieStore.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
  if (!datos) return null;
  if (datos.rol === 'admin') return { rol: 'admin' };

  const { data } = await createAdminClient()
    .from('cuentas_redactores')
    .select('activa, version_sesion, debe_cambiar_password, redactores(nombre)')
    .eq('redactor_id', datos.redactorId)
    .maybeSingle();

  if (!data || !data.activa || data.version_sesion !== datos.version) return null;

  const redactor = Array.isArray(data.redactores) ? data.redactores[0] : data.redactores;
  return {
    rol: 'redactor',
    redactorId: datos.redactorId,
    nombre: redactor?.nombre ?? '',
    debeCambiarPassword: data.debe_cambiar_password,
  };
});

/**
 * Verifica si existe una sesión válida de administrador
 */
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const datos = await verificarToken(cookieStore.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
  return datos?.rol === 'admin';
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
 * Corta la ejecución si no hay sesión de administrador ni de un redactor activo.
 * Devuelve la sesión para saber quién escribe.
 */
export async function requireEditorNoticias(): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) throw new Error('No autorizado');
  if (sesion.rol === 'redactor' && sesion.debeCambiarPassword) {
    throw new Error('Primero cambia tu contraseña temporal en Mi cuenta');
  }
  return sesion;
}

/**
 * Para las páginas de noticias: sin sesión al login y, con contraseña temporal,
 * a Mi cuenta. Va en cada página y no en el layout, porque el layout no se
 * vuelve a renderizar al navegar dentro del panel.
 */
export async function sesionParaNoticias(): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect('/admin/login');
  if (sesion.rol === 'redactor' && sesion.debeCambiarPassword) redirect('/admin/cuenta');
  return sesion;
}

/**
 * Para las rutas /api: respuesta 401 si no hay sesión de administrador, null si la hay.
 * El middleware ya las protege; esto cubre un eventual bypass del middleware.
 */
export async function rechazarSinSesion(): Promise<NextResponse | null> {
  if (await verifySession()) return null;
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
