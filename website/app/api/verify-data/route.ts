import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  try {
    // Verificar categorías
    const { data: categorias, error: errorCategorias } = await supabase
      .from('categorias')
      .select('*')
      .order('orden');

    // Verificar posiciones
    const { data: posiciones, error: errorPosiciones } = await supabase
      .from('posiciones')
      .select('*')
      .order('id');

    // Verificar equipos
    const { data: equipos, error: errorEquipos } = await supabase
      .from('equipos')
      .select('*')
      .order('id');

    return NextResponse.json({
      success: true,
      data: {
        categorias: {
          count: categorias?.length || 0,
          data: categorias || [],
          error: errorCategorias?.message || null
        },
        posiciones: {
          count: posiciones?.length || 0,
          data: posiciones || [],
          error: errorPosiciones?.message || null
        },
        equipos: {
          count: equipos?.length || 0,
          data: equipos || [],
          error: errorEquipos?.message || null
        }
      },
      expected: {
        categorias: 3,
        posiciones: 10,
        equipos: 3
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
