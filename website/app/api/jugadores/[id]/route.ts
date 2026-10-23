/**
 * API Route: /api/jugadores/[id]
 * Gestión de jugador individual
 */

import { NextRequest, NextResponse } from 'next/server';
import { rechazarSinPermiso } from '@/lib/auth/session';
import {
  getJugadorById,
  updateJugador,
  deleteJugador,
  deleteJugadorPermanente,
  setPosicionesJugador,
} from '@/lib/data/jugadores';
import { parsePosiciones } from '@/lib/validations/jugador';
import type { JugadorUpdate } from '@/types/database';

/**
 * GET /api/jugadores/[id]
 * Obtiene un jugador por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denegado = await rechazarSinPermiso('plantel');
  if (denegado) return denegado;

  try {
    const { id } = await params;
    const jugadorId = parseInt(id);

    if (isNaN(jugadorId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'ID de jugador inválido',
        },
        { status: 400 }
      );
    }

    const jugador = await getJugadorById(jugadorId);

    if (!jugador) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Jugador no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jugador,
      error: null,
    });
  } catch (error) {
    console.error('Error en GET /api/jugadores/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener jugador',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/jugadores/[id]
 * Actualiza un jugador
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denegado = await rechazarSinPermiso('plantel');
  if (denegado) return denegado;

  try {
    const { id } = await params;
    const jugadorId = parseInt(id);

    if (isNaN(jugadorId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'ID de jugador inválido',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const posicionesIds = parsePosiciones(body.posiciones_ids);
    if (posicionesIds && posicionesIds.length === 0) {
      return NextResponse.json(
        { success: false, data: null, error: 'El jugador necesita al menos una posición' },
        { status: 400 }
      );
    }

    const updates: JugadorUpdate = {
      nombre: body.nombre,
      apellidos: body.apellidos,
      fecha_nacimiento: body.fecha_nacimiento,
      nacionalidad: body.nacionalidad,
      dni: body.dni,
      foto_url: body.foto_url,
      foto_foco_x: body.foto_foco_x,
      foto_foco_y: body.foto_foco_y,
      foto_foco_ancho: body.foto_foco_ancho,
      foto_cara_x: body.foto_cara_x,
      foto_cara_y: body.foto_cara_y,
      foto_cara_ancho: body.foto_cara_ancho,
      equipo_id: body.equipo_id,
      posicion_id: posicionesIds?.[0] ?? body.posicion_id,
      dorsal: body.dorsal,
      altura_cm: body.altura_cm,
      peso_kg: body.peso_kg,
      pie_preferido: body.pie_preferido,
      email: body.email,
      telefono: body.telefono,
      direccion: body.direccion,
      tipo_sangre: body.tipo_sangre,
      contacto_emergencia: body.contacto_emergencia,
      telefono_emergencia: body.telefono_emergencia,
      alergias: body.alergias,
      lesiones_cronicas: body.lesiones_cronicas,
      estado: body.estado,
      fecha_alta: body.fecha_alta,
      fecha_baja: body.fecha_baja,
      activo: body.activo,
    };

    // Eliminar campos undefined
    Object.keys(updates).forEach(
      (key) => updates[key as keyof JugadorUpdate] === undefined && delete updates[key as keyof JugadorUpdate]
    );

    const jugador = await updateJugador(jugadorId, updates);
    if (posicionesIds) await setPosicionesJugador(jugadorId, posicionesIds);

    return NextResponse.json({
      success: true,
      data: jugador,
      error: null,
    });
  } catch (error) {
    console.error('Error en PATCH /api/jugadores/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar jugador',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jugadores/[id]
 * Elimina un jugador (soft delete por defecto)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denegado = await rechazarSinPermiso('plantel');
  if (denegado) return denegado;

  try {
    const { id } = await params;
    const jugadorId = parseInt(id);

    if (isNaN(jugadorId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'ID de jugador inválido',
        },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const permanente = searchParams.get('permanente') === 'true';

    if (permanente) {
      await deleteJugadorPermanente(jugadorId);
    } else {
      await deleteJugador(jugadorId);
    }

    return NextResponse.json({
      success: true,
      data: { id: jugadorId, eliminado: true, permanente },
      error: null,
    });
  } catch (error) {
    console.error('Error en DELETE /api/jugadores/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al eliminar jugador',
      },
      { status: 500 }
    );
  }
}
