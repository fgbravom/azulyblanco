/**
 * API Route: /api/estadisticas/[id]
 * Gestión de estadística individual
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateEstadisticaPartido,
  deleteEstadisticaPartido,
} from '@/lib/data/estadisticas';
import type { EstadisticaPartidoUpdate } from '@/types/database';

/**
 * PATCH /api/estadisticas/[id]
 * Actualiza una estadística
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const estadisticaId = parseInt(id);

    if (isNaN(estadisticaId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'ID de estadística inválido',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updates: EstadisticaPartidoUpdate = {
      titular: body.titular,
      minutos_jugados: body.minutos_jugados,
      minuto_entrada: body.minuto_entrada,
      minuto_salida: body.minuto_salida,
      goles: body.goles,
      asistencias: body.asistencias,
      tiros_totales: body.tiros_totales,
      tiros_puerta: body.tiros_puerta,
      regates_exitosos: body.regates_exitosos,
      pases_clave: body.pases_clave,
      tackles_exitosos: body.tackles_exitosos,
      intercepciones: body.intercepciones,
      despejes: body.despejes,
      duelos_ganados: body.duelos_ganados,
      duelos_perdidos: body.duelos_perdidos,
      tarjetas_amarillas: body.tarjetas_amarillas,
      tarjetas_rojas: body.tarjetas_rojas,
      faltas_cometidas: body.faltas_cometidas,
      faltas_recibidas: body.faltas_recibidas,
      paradas: body.paradas,
      goles_encajados: body.goles_encajados,
      penales_detenidos: body.penales_detenidos,
      valoracion: body.valoracion,
      observaciones: body.observaciones,
    };

    // Eliminar campos undefined
    Object.keys(updates).forEach(
      (key) =>
        updates[key as keyof EstadisticaPartidoUpdate] === undefined &&
        delete updates[key as keyof EstadisticaPartidoUpdate]
    );

    const estadistica = await updateEstadisticaPartido(estadisticaId, updates);

    return NextResponse.json({
      success: true,
      data: estadistica,
      error: null,
    });
  } catch (error) {
    console.error('Error en PATCH /api/estadisticas/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar estadística',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/estadisticas/[id]
 * Elimina una estadística
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const estadisticaId = parseInt(id);

    if (isNaN(estadisticaId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'ID de estadística inválido',
        },
        { status: 400 }
      );
    }

    await deleteEstadisticaPartido(estadisticaId);

    return NextResponse.json({
      success: true,
      data: { id: estadisticaId, eliminado: true },
      error: null,
    });
  } catch (error) {
    console.error('Error en DELETE /api/estadisticas/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al eliminar estadística',
      },
      { status: 500 }
    );
  }
}
