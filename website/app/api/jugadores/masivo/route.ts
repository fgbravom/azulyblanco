/**
 * API Route: /api/jugadores/masivo
 * Acciones sobre varios jugadores a la vez (baja, reactivación y eliminación)
 */

import { NextRequest, NextResponse } from 'next/server';
import { rechazarSinPermiso } from '@/lib/auth/session';
import { revalidarSitio } from '@/lib/admin/revalidar';
import {
  setActivoJugadores,
  resumenDatosJugadores,
  eliminarInactivosPermanente,
} from '@/lib/data/jugadores';

const MAX_IDS = 500;
const ACCIONES = ['baja', 'reactivar', 'eliminar'] as const;
type Accion = (typeof ACCIONES)[number];

/** Lista de ids enteros positivos, sin repetir; null si algo no cuadra */
function parseIds(valor: unknown): number[] | null {
  if (!Array.isArray(valor) || valor.length === 0 || valor.length > MAX_IDS) return null;
  if (!valor.every((id) => Number.isInteger(id) && id > 0)) return null;
  return Array.from(new Set(valor as number[]));
}

function error(mensaje: string, status: number) {
  return NextResponse.json({ success: false, data: null, error: mensaje }, { status });
}

/**
 * GET /api/jugadores/masivo?ids=1,2,3
 * Cuotas y pagos que se perderían al eliminar a esos jugadores
 */
export async function GET(request: NextRequest) {
  const denegado = await rechazarSinPermiso('plantel');
  if (denegado) return denegado;

  try {
    const ids = parseIds((request.nextUrl.searchParams.get('ids') ?? '').split(',').filter(Boolean).map(Number));
    if (!ids) return error('Lista de jugadores inválida', 400);

    return NextResponse.json({ success: true, data: await resumenDatosJugadores(ids), error: null });
  } catch (e) {
    console.error('Error en GET /api/jugadores/masivo:', e);
    return error(e instanceof Error ? e.message : 'Error al revisar los jugadores', 500);
  }
}

/**
 * POST /api/jugadores/masivo
 * Cuerpo: { ids: number[], accion: 'baja' | 'reactivar' | 'eliminar' }
 */
export async function POST(request: NextRequest) {
  const denegado = await rechazarSinPermiso('plantel');
  if (denegado) return denegado;

  try {
    const body = await request.json();
    const ids = parseIds(body.ids);
    if (!ids) return error('Lista de jugadores inválida', 400);
    if (!ACCIONES.includes(body.accion)) return error('Acción inválida', 400);
    const accion: Accion = body.accion;

    const afectados =
      accion === 'eliminar'
        ? await eliminarInactivosPermanente(ids)
        : await setActivoJugadores(ids, accion === 'reactivar');
    revalidarSitio('series');

    return NextResponse.json({ success: true, data: { afectados }, error: null });
  } catch (e) {
    console.error('Error en POST /api/jugadores/masivo:', e);
    return error(e instanceof Error ? e.message : 'Error al actualizar jugadores', 500);
  }
}
