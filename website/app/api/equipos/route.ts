/**
 * API Route: /api/equipos
 * Gestión de equipos y categorías
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEquipos,
  getEquiposTemporadaActual,
  getCategorias,
  getPosiciones,
} from '@/lib/data/equipos';

/**
 * GET /api/equipos
 * Obtiene lista de equipos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');

    // Obtener categorías
    if (tipo === 'categorias') {
      const categorias = await getCategorias();
      return NextResponse.json({
        success: true,
        data: categorias,
        error: null,
      });
    }

    // Obtener posiciones
    if (tipo === 'posiciones') {
      const posiciones = await getPosiciones();
      return NextResponse.json({
        success: true,
        data: posiciones,
        error: null,
      });
    }

    // Obtener equipos de temporada actual
    const temporadaActual = searchParams.get('temporada_actual');
    if (temporadaActual === 'true') {
      const equipos = await getEquiposTemporadaActual();
      return NextResponse.json({
        success: true,
        data: equipos,
        error: null,
      });
    }

    // Obtener todos los equipos
    // Usar consulta simple sin JOIN para evitar problemas
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: equipos, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('activo', true)
      .order('id', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      data: equipos || [],
      error: null,
    });
  } catch (error) {
    console.error('Error en GET /api/equipos:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener equipos',
      },
      { status: 500 }
    );
  }
}
