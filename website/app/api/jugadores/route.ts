/**
 * API Route: /api/jugadores
 * Gestión de jugadores
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJugadores, createJugador } from '@/lib/data/jugadores';
import type { JugadorInsert, JugadoresFilter, QueryOptions } from '@/types/database';

/**
 * GET /api/jugadores
 * Obtiene lista de jugadores con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Construir filtros
    const filter: JugadoresFilter = {};

    const equipoId = searchParams.get('equipo_id');
    if (equipoId) filter.equipo_id = parseInt(equipoId);

    const posicionId = searchParams.get('posicion_id');
    if (posicionId) filter.posicion_id = parseInt(posicionId);

    const estado = searchParams.get('estado');
    if (estado) filter.estado = estado as any;

    const activo = searchParams.get('activo');
    if (activo !== null) filter.activo = activo === 'true';

    const busqueda = searchParams.get('busqueda');
    if (busqueda) filter.busqueda = busqueda;

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

    const result = await getJugadores(filter, options);

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
    console.error('Error en GET /api/jugadores:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener jugadores',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jugadores
 * Crea un nuevo jugador
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    if (!body.nombre || !body.apellidos || !body.equipo_id || !body.posicion_id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Faltan campos requeridos: nombre, apellidos, equipo_id, posicion_id',
        },
        { status: 400 }
      );
    }

    const jugadorData: JugadorInsert = {
      nombre: body.nombre,
      apellidos: body.apellidos,
      equipo_id: body.equipo_id,
      posicion_id: body.posicion_id,
      fecha_nacimiento: body.fecha_nacimiento,
      nacionalidad: body.nacionalidad,
      dni: body.dni,
      foto_url: body.foto_url,
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
      activo: body.activo,
    };

    const jugador = await createJugador(jugadorData);

    return NextResponse.json(
      {
        success: true,
        data: jugador,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/jugadores:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear jugador',
      },
      { status: 500 }
    );
  }
}
