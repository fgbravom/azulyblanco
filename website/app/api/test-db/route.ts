/**
 * API Route de prueba para verificar conexión con Supabase
 * Acceder a: /api/test-db
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verificar conexión listando tablas del esquema
    const tests = {
      connection: false,
      tables: {} as Record<string, boolean>,
      errors: [] as string[],
    };

    // Test 1: Verificar tabla categorias
    try {
      const { data: categorias, error } = await supabase
        .from('categorias')
        .select('*')
        .limit(1);

      tests.tables.categorias = !error;
      if (error) tests.errors.push(`categorias: ${error.message}`);
    } catch (e) {
      tests.tables.categorias = false;
      tests.errors.push(`categorias: ${e}`);
    }

    // Test 2: Verificar tabla posiciones
    try {
      const { data: posiciones, error } = await supabase
        .from('posiciones')
        .select('*')
        .limit(1);

      tests.tables.posiciones = !error;
      if (error) tests.errors.push(`posiciones: ${error.message}`);
    } catch (e) {
      tests.tables.posiciones = false;
      tests.errors.push(`posiciones: ${e}`);
    }

    // Test 3: Verificar tabla equipos
    try {
      const { data: equipos, error } = await supabase
        .from('equipos')
        .select('*')
        .limit(1);

      tests.tables.equipos = !error;
      if (error) tests.errors.push(`equipos: ${error.message}`);
    } catch (e) {
      tests.tables.equipos = false;
      tests.errors.push(`equipos: ${e}`);
    }

    // Test 4: Verificar tabla jugadores
    try {
      const { data: jugadores, error } = await supabase
        .from('jugadores')
        .select('*')
        .limit(1);

      tests.tables.jugadores = !error;
      if (error) tests.errors.push(`jugadores: ${error.message}`);
    } catch (e) {
      tests.tables.jugadores = false;
      tests.errors.push(`jugadores: ${e}`);
    }

    // Test 5: Verificar tabla partidos
    try {
      const { data: partidos, error } = await supabase
        .from('partidos')
        .select('*')
        .limit(1);

      tests.tables.partidos = !error;
      if (error) tests.errors.push(`partidos: ${error.message}`);
    } catch (e) {
      tests.tables.partidos = false;
      tests.errors.push(`partidos: ${e}`);
    }

    // Test 6: Verificar tabla estadisticas_partido
    try {
      const { data: estadisticas, error } = await supabase
        .from('estadisticas_partido')
        .select('*')
        .limit(1);

      tests.tables.estadisticas_partido = !error;
      if (error) tests.errors.push(`estadisticas_partido: ${error.message}`);
    } catch (e) {
      tests.tables.estadisticas_partido = false;
      tests.errors.push(`estadisticas_partido: ${e}`);
    }

    // Determinar si la conexión general es exitosa
    tests.connection = Object.values(tests.tables).some(v => v);

    return NextResponse.json({
      success: tests.connection,
      message: tests.connection
        ? 'Conexión a Supabase exitosa'
        : 'Error de conexión a Supabase',
      tests,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en test-db:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al conectar con Supabase',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
