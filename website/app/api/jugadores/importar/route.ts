/**
 * API Route: /api/jugadores/importar
 * Importa jugadores desde el CSV del formulario de inscripción (export de Notion)
 */

import { NextRequest, NextResponse } from 'next/server';
import { rechazarSinPermiso } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { createJugador, setPosicionesJugador, updateJugador } from '@/lib/data/jugadores';
import { revalidarSitio } from '@/lib/admin/revalidar';
import { cargarDatosReferencia, planificarImportacion } from '@/lib/jugadores/importar-csv';

// El formulario completo pesa unos pocos KB: esto deja margen de sobra
const TAMANO_MAXIMO = 1024 * 1024;

/**
 * POST /api/jugadores/importar
 * Body: { csv: string, aplicar?: boolean }
 *
 * Sin aplicar devuelve qué pasaría con cada fila. Con aplicar vuelve a
 * planificar contra la base (no confía en la vista previa del navegador),
 * crea los nuevos y actualiza los que cambiaron.
 */
export async function POST(request: NextRequest) {
  const denegado = await rechazarSinPermiso('plantel');
  if (denegado) return denegado;

  try {
    const body = await request.json();
    if (typeof body.csv !== 'string' || !body.csv.trim()) {
      return NextResponse.json({ success: false, data: null, error: 'El archivo está vacío' }, { status: 400 });
    }
    if (body.csv.length > TAMANO_MAXIMO) {
      return NextResponse.json({ success: false, data: null, error: 'El archivo es demasiado grande' }, { status: 400 });
    }

    const referencia = await cargarDatosReferencia(createAdminClient());
    let filas;
    try {
      filas = planificarImportacion(body.csv, referencia);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo leer el CSV';
      return NextResponse.json({ success: false, data: null, error: mensaje }, { status: 400 });
    }

    const fallidos: { linea: number; error: string }[] = [];
    let importados = 0;
    let actualizados = 0;

    if (body.aplicar === true) {
      for (const fila of filas.filter((f) => f.estado === 'nuevo' || f.estado === 'actualizar')) {
        try {
          if (fila.estado === 'actualizar') {
            const { campos, posicionesIds } = fila.actualizacion!;
            if (Object.keys(campos).length) await updateJugador(fila.jugadorId!, campos);
            if (posicionesIds) await setPosicionesJugador(fila.jugadorId!, posicionesIds);
            actualizados++;
            continue;
          }

          // Una fila 'nuevo' siempre trae equipo y al menos una posición
          const { equipo_id, posicion_id, pie_preferido, ...resto } = fila.jugador;
          const jugador = await createJugador({
            ...resto,
            equipo_id: equipo_id!,
            posicion_id: posicion_id!,
            pie_preferido: pie_preferido ?? undefined,
          });
          await setPosicionesJugador(jugador.id, fila.posicionesIds);
          importados++;
        } catch (error) {
          fallidos.push({ linea: fila.linea, error: error instanceof Error ? error.message : 'Error al guardar jugador' });
        }
      }
      if (importados + actualizados > 0) revalidarSitio('series');
    }

    return NextResponse.json({
      success: true,
      data: { filas, importados, actualizados, fallidos },
      error: null,
    });
  } catch (error) {
    console.error('Error en POST /api/jugadores/importar:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error al importar jugadores',
      },
      { status: 500 }
    );
  }
}
