import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SESSION_COOKIE, SESSION_MAX_AGE, firmarToken, verificarToken, type DatosToken } from './token';
import { SECCIONES_COLABORADOR, type Seccion } from './permisos';

export type Sesion =
  | { rol: 'admin'; cuentaId: string }
  | {
      rol: 'colaborador';
      cuentaId: string;
      redactorId: string;
      nombre: string;
      debeCambiarPassword: boolean;
    };

/**
 * Crea la sesión de un administrador o de un colaborador
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
 * Sesión vigente o null. Sin cookie válida no toca la base; con una cookie
 * válida confirma que la cuenta exista, esté activa y su versión de sesión
 * coincida (subirla en la base cierra todas sus sesiones). Se memoiza por petición.
 */
export const obtenerSesion = cache(async (): Promise<Sesion | null> => {
  const cookieStore = await cookies();
  const datos = await verificarToken(cookieStore.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
  if (!datos) return null;

  const { data } = await createAdminClient()
    .from('cuentas_panel')
    .select('rol, activa, version_sesion, debe_cambiar_password, redactor_id, redactores(nombre)')
    .eq('id', datos.cuentaId)
    .maybeSingle();

  if (!data || !data.activa || data.version_sesion !== datos.version || data.rol !== datos.rol) return null;

  if (data.rol === 'admin') return { rol: 'admin', cuentaId: datos.cuentaId };

  const redactor = Array.isArray(data.redactores) ? data.redactores[0] : data.redactores;
  return {
    rol: 'colaborador',
    cuentaId: datos.cuentaId,
    redactorId: data.redactor_id,
    nombre: redactor?.nombre ?? '',
    debeCambiarPassword: data.debe_cambiar_password,
  };
});

/**
 * Verifica si existe una sesión válida de administrador
 */
export async function verifySession(): Promise<boolean> {
  return (await obtenerSesion())?.rol === 'admin';
}

/**
 * Corta la ejecución de una server action si no hay sesión de administrador.
 * Devuelve la sesión para saber qué cuenta actúa.
 */
export async function requireAdmin(): Promise<Extract<Sesion, { rol: 'admin' }>> {
  const sesion = await obtenerSesion();
  if (sesion?.rol !== 'admin') {
    throw new Error('No autorizado');
  }
  return sesion;
}

/**
 * Corta la ejecución si la cuenta no puede usar la sección: el admin puede todo;
 * un colaborador solo sus secciones y sin contraseña temporal pendiente.
 * Devuelve la sesión para saber quién escribe.
 */
export async function requirePermiso(seccion: Seccion): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) throw new Error('No autorizado');
  if (sesion.rol === 'admin') return sesion;
  if (!SECCIONES_COLABORADOR.includes(seccion)) throw new Error('No autorizado');
  if (sesion.debeCambiarPassword) {
    throw new Error('Primero cambia tu contraseña temporal en Mi cuenta');
  }
  return sesion;
}

/** Noticias: el admin y los colaboradores */
export function requireEditorNoticias(): Promise<Sesion> {
  return requirePermiso('noticias');
}

/**
 * Para las páginas de una sección: sin sesión al login, con contraseña temporal
 * a Mi cuenta, y sin permiso a Noticias (la página de inicio del colaborador).
 * Va en cada página y no en el layout, porque el layout no se vuelve a
 * renderizar al navegar dentro del panel.
 */
export async function sesionParaSeccion(seccion: Seccion): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect('/admin/login');
  if (sesion.rol === 'colaborador' && sesion.debeCambiarPassword) redirect('/admin/cuenta');
  if (sesion.rol === 'colaborador' && !SECCIONES_COLABORADOR.includes(seccion)) redirect('/admin/noticias');
  return sesion;
}

export function sesionParaNoticias(): Promise<Sesion> {
  return sesionParaSeccion('noticias');
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
 * Para las rutas /api de una sección: 401 sin sesión, 403 si la cuenta no tiene
 * permiso (un colaborador en una API que no es de su sección), null si lo tiene.
 */
export async function rechazarSinPermiso(seccion: Seccion): Promise<NextResponse | null> {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (sesion.rol === 'admin') return null;
  if (!SECCIONES_COLABORADOR.includes(seccion) || sesion.debeCambiarPassword) {
    return NextResponse.json({ error: 'Sin permiso para esta sección' }, { status: 403 });
  }
  return null;
}

/**
 * Destruye la sesión
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: '/' });
  // Cookie de la versión anterior, que vivía bajo /admin
  cookieStore.delete({ name: SESSION_COOKIE, path: '/admin' });
}
