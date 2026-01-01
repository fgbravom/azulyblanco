/**
 * API Route: /api/partidos
 * Gestión de partidos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPartidos, createPartido } from '@/lib/data/partidos';
import type { PartidoInsert, PartidosFilter, QueryOptions } from '@/types/database';

/**
 * GET /api/partidos
 * Obtiene lista de partidos con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Construir filtros
    const filter: PartidosFilter = {};

    const equipoId = searchParams.get('equipo_id');
    if (equipoId) filter.equipo_id = parseInt(equipoId);

    const estado = searchParams.get('estado');
    if (estado) filter.estado = estado as any;

    const competicion = searchParams.get('competicion');
    if (competicion) filter.competicion = competicion;

    const ubicacion = searchParams.get('ubicacion');
    if (ubicacion) filter.ubicacion = ubicacion as any;

    const fechaDesde = searchParams.get('fecha_desde');
    if (fechaDesde) filter.fecha_desde = fechaDesde;

    const fechaHasta = searchParams.get('fecha_hasta');
    if (fechaHasta) filter.fecha_hasta = fechaHasta;

    // Opciones de paginación y ordenamiento
    const options: QueryOptions = {};

    const page = searchParams.get('page');
    if (page) options.page = parseInt(page);

    const pageSize = searchParams.get('pageSize');
    if (pageSize) options.pageSize = parseInt(pageSize);

    const sortCampo = searchParams.get('sort_campo');
    const sortOrden = searchParams.get('sort_orden');
    if (sortCampo && sortOrden) {
      options.sort = {
        campo: sortCampo,
        orden: sortOrden as 'asc' | 'desc',
      };
    }

    const result = await getPartidos(filter, options);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error en GET /api/partidos:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener partidos',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partidos
 * Crea un nuevo partido
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    if (!body.equipo_id || !body.fecha || !body.equipo_local || !body.equipo_visitante || !body.ubicacion) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Faltan campos requeridos: equipo_id, fecha, equipo_local, equipo_visitante, ubicacion',
        },
        { status: 400 }
      );
    }

    const partidoData: PartidoInsert = {
      equipo_id: body.equipo_id,
      fecha: body.fecha,
      ubicacion: body.ubicacion,
      equipo_local: body.equipo_local,
      equipo_visitante: body.equipo_visitante,
      hora: body.hora,
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

    const partido = await createPartido(partidoData);

    return NextResponse.json(
      {
        success: true,
        data: partido,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/partidos:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear partido',
      },
      { status: 500 }
    );
  }
}
