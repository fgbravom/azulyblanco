import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Freno a la fuerza bruta del login: 10 intentos fallidos por IP cada 15
 * minutos. Se guarda en la base (tabla login_intentos, migración 005) porque
 * en Vercel cada función tiene su propia memoria.
 */
const MAX_INTENTOS = 10;
const VENTANA_MS = 15 * 60 * 1000;

/** Vercel reemplaza x-forwarded-for con la IP real del cliente */
export function ipDe(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'desconocida'
  );
}

function desde() {
  return new Date(Date.now() - VENTANA_MS).toISOString();
}

export async function loginBloqueado(ip: string): Promise<boolean> {
  const { count, error } = await createAdminClient()
    .from('login_intentos')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', desde());
  // Sin la tabla (migración pendiente) no se bloquea, para no cerrar el admin
  if (error) {
    console.error('No se pudieron leer los intentos de login:', error.message);
    return false;
  }
  return (count ?? 0) >= MAX_INTENTOS;
}

export async function registrarFallo(ip: string) {
  const supabase = createAdminClient();
  await supabase.from('login_intentos').insert({ ip });
  // Limpieza de lo que ya no cuenta
  await supabase.from('login_intentos').delete().lt('created_at', desde());
}

export async function limpiarIntentos(ip: string) {
  await createAdminClient().from('login_intentos').delete().eq('ip', ip);
}
