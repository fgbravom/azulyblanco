/**
 * API Route: /api/partidos/[id]
 * Gestión de partido individual
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPartidoById,
  updatePartido,
  updateResultadoPartido,
  deletePartido,
} from '@/lib/data/partidos';
import type { PartidoUpdate } from '@/types/database';

/**
 * GET /api/partidos/[id]
 * Obtiene un partido por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partidoId = parseInt(id);

    if (isNaN(partidoId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'ID de partido inválido',
        },
        { status: 400 }
      );
    }

    const partido = await getPartidoById(partidoId);

    if (!partido) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Partido no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: partido,
      error: null,
    });
  } catch (error) {
    console.error('Error en GET /api/partidos/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener partido',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/partidos/[id]
 * Actualiza un partido
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partidoId = parseInt(id);

    if (isNaN(partidoId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'ID de partido inválido',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Si se está actualizando el resultado específicamente
    if (body.actualizar_resultado && body.goles_local !== undefined && body.goles_visitante !== undefined) {
      const partido = await updateResultadoPartido(
        partidoId,
        body.goles_local,
        body.goles_visitante
      );

      return NextResponse.json({
        success: true,
        data: partido,
        error: null,
      });
    }

    // Actualización general
    const updates: PartidoUpdate = {
      equipo_id: body.equipo_id,
      fecha: body.fecha,
      hora: body.hora,
      ubicacion: body.ubicacion,
      equipo_local: body.equipo_local,
      equipo_visitante: body.equipo_visitante,
      goles_local: body.goles_local,
      goles_visitante: body.goles_visitante,
      estado: body.estado,
      competicion: body.competicion,
      jornada: body.jornada,
      estadio: body.estadio,
      arbitro: body.arbitro,
      asistencia: body.asistencia,
      resumen: body.resumen,
      observaciones: body.observaciones,
    };

    // Eliminar campos undefined
    Object.keys(updates).forEach(
      (key) => updates[key as keyof PartidoUpdate] === undefined && delete updates[key as keyof PartidoUpdate]
    );

    const partido = await updatePartido(partidoId, updates);

    return NextResponse.json({
      success: true,
      data: partido,
      error: null,
    });
  } catch (error) {
    console.error('Error en PATCH /api/partidos/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar partido',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/partidos/[id]
 * Elimina un partido
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partidoId = parseInt(id);

    if (isNaN(partidoId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'ID de partido inválido',
        },
        { status: 400 }
      );
    }

    await deletePartido(partidoId);

    return NextResponse.json({
      success: true,
      data: { id: partidoId, eliminado: true },
      error: null,
    });
  } catch (error) {
    console.error('Error en DELETE /api/partidos/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al eliminar partido',
      },
      { status: 500 }
    );
  }
}
