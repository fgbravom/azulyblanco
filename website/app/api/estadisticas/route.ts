/**
 * API Route: /api/estadisticas
 * Gestión de estadísticas de partidos
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEstadisticasPartido,
  getEstadisticasJugador,
  createEstadisticaPartido,
  createEstadisticasPartido,
  getMaximosGoleadores,
  getMaximosAsistentes,
} from '@/lib/data/estadisticas';
import type { EstadisticaPartidoInsert } from '@/types/database';

/**
 * GET /api/estadisticas
 * Obtiene estadísticas según los parámetros
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const partidoId = searchParams.get('partido_id');
    const jugadorId = searchParams.get('jugador_id');
    const tipo = searchParams.get('tipo'); // 'goleadores' | 'asistentes'
    const equipoId = searchParams.get('equipo_id');
    const limit = searchParams.get('limit');

    // Estadísticas de un partido específico
    if (partidoId) {
      const estadisticas = await getEstadisticasPartido(parseInt(partidoId));
      return NextResponse.json({
        success: true,
        data: estadisticas,
        error: null,
      });
    }

    // Estadísticas de un jugador específico
    if (jugadorId) {
      const estadisticas = await getEstadisticasJugador(parseInt(jugadorId));
      return NextResponse.json({
        success: true,
        data: estadisticas,
        error: null,
      });
    }

    // Máximos goleadores
    if (tipo === 'goleadores') {
      const goleadores = await getMaximosGoleadores(
        equipoId ? parseInt(equipoId) : undefined,
        limit ? parseInt(limit) : 10
      );
      return NextResponse.json({
        success: true,
        data: goleadores,
        error: null,
      });
    }

    // Máximos asistentes
    if (tipo === 'asistentes') {
      const asistentes = await getMaximosAsistentes(
        equipoId ? parseInt(equipoId) : undefined,
        limit ? parseInt(limit) : 10
      );
      return NextResponse.json({
        success: true,
        data: asistentes,
        error: null,
      });
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Parámetros inválidos. Se requiere partido_id, jugador_id o tipo',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en GET /api/estadisticas:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/estadisticas
 * Crea estadísticas para uno o más jugadores en un partido
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar si es una creación múltiple
    if (Array.isArray(body)) {
      // Validar que todos tengan los campos requeridos
      for (const est of body) {
        if (!est.partido_id || !est.jugador_id) {
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: 'Cada estadística debe tener partido_id y jugador_id',
            },
            { status: 400 }
          );
        }
      }

      const estadisticas = await createEstadisticasPartido(body);

      return NextResponse.json(
        {
          success: true,
          data: estadisticas,
          error: null,
        },
        { status: 201 }
      );
    }

    // Creación individual
    if (!body.partido_id || !body.jugador_id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Faltan campos requeridos: partido_id, jugador_id',
        },
        { status: 400 }
      );
    }

    const estadisticaData: EstadisticaPartidoInsert = {
      partido_id: body.partido_id,
      jugador_id: body.jugador_id,
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

    const estadistica = await createEstadisticaPartido(estadisticaData);

    return NextResponse.json(
      {
        success: true,
        data: estadistica,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/estadisticas:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear estadística',
      },
      { status: 500 }
    );
  }
}
