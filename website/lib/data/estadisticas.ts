/**
 * Funciones de acceso a datos para Estadísticas de Partidos
 */

import { createClient } from '@/lib/supabase/server';
import type {
  EstadisticaPartido,
  EstadisticaPartidoInsert,
  EstadisticaPartidoUpdate,
  EstadisticasJugador,
  EstadisticasFilter,
} from '@/types/database';

// ============================================================================
// OBTENER ESTADÍSTICAS
// ============================================================================

/**
 * Obtiene estadísticas de un partido específico
 */
export async function getEstadisticasPartido(
  partidoId: number
): Promise<EstadisticaPartido[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('estadisticas_partido')
    .select(`
      *,
      jugador:jugador_id (
        nombre,
        apellidos,
        dorsal,
        posicion:posicion_id (nombre, abreviatura)
      )
    `)
    .eq('partido_id', partidoId)
    .order('titular', { ascending: false })
    .order('minutos_jugados', { ascending: false });

  if (error) {
    console.error('Error al obtener estadísticas del partido:', error);
    throw new Error('Error al obtener estadísticas del partido');
  }

  return data || [];
}

/**
 * Obtiene estadísticas de un jugador en un partido
 */
export async function getEstadisticaJugadorPartido(
  partidoId: number,
  jugadorId: number
): Promise<EstadisticaPartido | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('estadisticas_partido')
    .select('*')
    .eq('partido_id', partidoId)
    .eq('jugador_id', jugadorId)
    .single();

  if (error) {
    console.error('Error al obtener estadística:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene estadísticas acumuladas de un jugador
 */
export async function getEstadisticasJugador(
  jugadorId: number
): Promise<EstadisticasJugador | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vista_estadisticas_jugador')
    .select('*')
    .eq('jugador_id', jugadorId)
    .single();

  if (error) {
    console.error('Error al obtener estadísticas del jugador:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene estadísticas de todos los jugadores de un equipo
 */
export async function getEstadisticasEquipo(equipoId: number): Promise<EstadisticasJugador[]> {
  const supabase = await createClient();

  // Primero obtenemos el equipo
  const { data: equipo, error: equipoError } = await supabase
    .from('equipos')
    .select('nombre')
    .eq('id', equipoId)
    .single();

  if (equipoError) {
    console.error('Error al obtener equipo:', equipoError);
    return [];
  }

  // Luego las estadísticas
  const { data, error } = await supabase
    .from('vista_estadisticas_jugador')
    .select('*')
    .eq('equipo', equipo.nombre)
    .order('goles_totales', { ascending: false });

  if (error) {
    console.error('Error al obtener estadísticas del equipo:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene histórico de estadísticas de un jugador
 */
export async function getHistoricoJugador(
  jugadorId: number,
  limit?: number
): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from('estadisticas_partido')
    .select(`
      *,
      partido:partido_id (
        fecha,
        equipo_local,
        equipo_visitante,
        goles_local,
        goles_visitante,
        competicion
      )
    `)
    .eq('jugador_id', jugadorId)
    .order('partido.fecha', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener histórico:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// CREAR ESTADÍSTICAS
// ============================================================================

/**
 * Crea estadísticas para un jugador en un partido
 */
export async function createEstadisticaPartido(
  estadistica: EstadisticaPartidoInsert
): Promise<EstadisticaPartido> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('estadisticas_partido')
    .insert(estadistica)
    .select()
    .single();

  if (error) {
    console.error('Error al crear estadística:', error);
    throw new Error(`Error al crear estadística: ${error.message}`);
  }

  return data;
}

/**
 * Crea estadísticas para múltiples jugadores en un partido
 */
export async function createEstadisticasPartido(
  estadisticas: EstadisticaPartidoInsert[]
): Promise<EstadisticaPartido[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('estadisticas_partido')
    .insert(estadisticas)
    .select();

  if (error) {
    console.error('Error al crear estadísticas:', error);
    throw new Error(`Error al crear estadísticas: ${error.message}`);
  }

  return data || [];
}

// ============================================================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================================================

/**
 * Actualiza estadísticas de un jugador en un partido
 */
export async function updateEstadisticaPartido(
  id: number,
  updates: EstadisticaPartidoUpdate
): Promise<EstadisticaPartido> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('estadisticas_partido')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar estadística:', error);
    throw new Error(`Error al actualizar estadística: ${error.message}`);
  }

  return data;
}

/**
 * Actualiza estadísticas de un jugador por partido y jugador ID
 */
export async function updateEstadisticaJugadorPartido(
  partidoId: number,
  jugadorId: number,
  updates: EstadisticaPartidoUpdate
): Promise<EstadisticaPartido> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('estadisticas_partido')
    .update(updates)
    .eq('partido_id', partidoId)
    .eq('jugador_id', jugadorId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar estadística:', error);
    throw new Error(`Error al actualizar estadística: ${error.message}`);
  }

  return data;
}

// ============================================================================
// ELIMINAR ESTADÍSTICAS
// ============================================================================

/**
 * Elimina estadísticas de un jugador en un partido
 */
export async function deleteEstadisticaPartido(id: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('estadisticas_partido')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar estadística:', error);
    throw new Error(`Error al eliminar estadística: ${error.message}`);
  }
}

/**
 * Elimina todas las estadísticas de un partido
 */
export async function deleteEstadisticasPartido(partidoId: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('estadisticas_partido')
    .delete()
    .eq('partido_id', partidoId);

  if (error) {
    console.error('Error al eliminar estadísticas:', error);
    throw new Error(`Error al eliminar estadísticas: ${error.message}`);
  }
}

// ============================================================================
// FUNCIONES AUXILIARES Y ANÁLISIS
// ============================================================================

/**
 * Obtiene los máximos goleadores
 */
export async function getMaximosGoleadores(
  equipoId?: number,
  limit: number = 10
): Promise<EstadisticasJugador[]> {
  const supabase = await createClient();

  let query = supabase
    .from('vista_estadisticas_jugador')
    .select('*')
    .order('goles_totales', { ascending: false })
    .limit(limit);

  if (equipoId) {
    const { data: equipo } = await supabase
      .from('equipos')
      .select('nombre')
      .eq('id', equipoId)
      .single();

    if (equipo) {
      query = query.eq('equipo', equipo.nombre);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener goleadores:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene los jugadores con más asistencias
 */
export async function getMaximosAsistentes(
  equipoId?: number,
  limit: number = 10
): Promise<EstadisticasJugador[]> {
  const supabase = await createClient();

  let query = supabase
    .from('vista_estadisticas_jugador')
    .select('*')
    .order('asistencias_totales', { ascending: false })
    .limit(limit);

  if (equipoId) {
    const { data: equipo } = await supabase
      .from('equipos')
      .select('nombre')
      .eq('id', equipoId)
      .single();

    if (equipo) {
      query = query.eq('equipo', equipo.nombre);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener asistentes:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene los jugadores con mejor valoración promedio
 */
export async function getMejoresValorados(
  equipoId?: number,
  minPartidos: number = 3,
  limit: number = 10
): Promise<EstadisticasJugador[]> {
  const supabase = await createClient();

  let query = supabase
    .from('vista_estadisticas_jugador')
    .select('*')
    .gte('partidos_jugados', minPartidos)
    .not('valoracion_promedio', 'is', null)
    .order('valoracion_promedio', { ascending: false })
    .limit(limit);

  if (equipoId) {
    const { data: equipo } = await supabase
      .from('equipos')
      .select('nombre')
      .eq('id', equipoId)
      .single();

    if (equipo) {
      query = query.eq('equipo', equipo.nombre);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener mejores valorados:', error);
    return [];
  }

  return data || [];
}

/**
 * Registra gol en un partido
 */
export async function registrarGol(
  partidoId: number,
  jugadorId: number,
  minuto?: number
): Promise<void> {
  const estadistica = await getEstadisticaJugadorPartido(partidoId, jugadorId);

  if (estadistica) {
    await updateEstadisticaPartido(estadistica.id, {
      goles: estadistica.goles + 1,
    });
  } else {
    await createEstadisticaPartido({
      partido_id: partidoId,
      jugador_id: jugadorId,
      goles: 1,
      minutos_jugados: 0,
    });
  }
}

/**
 * Registra asistencia en un partido
 */
export async function registrarAsistencia(
  partidoId: number,
  jugadorId: number
): Promise<void> {
  const estadistica = await getEstadisticaJugadorPartido(partidoId, jugadorId);

  if (estadistica) {
    await updateEstadisticaPartido(estadistica.id, {
      asistencias: estadistica.asistencias + 1,
    });
  } else {
    await createEstadisticaPartido({
      partido_id: partidoId,
      jugador_id: jugadorId,
      asistencias: 1,
      minutos_jugados: 0,
    });
  }
}

/**
 * Registra tarjeta en un partido
 */
export async function registrarTarjeta(
  partidoId: number,
  jugadorId: number,
  tipo: 'amarilla' | 'roja'
): Promise<void> {
  const estadistica = await getEstadisticaJugadorPartido(partidoId, jugadorId);

  const update = tipo === 'amarilla'
    ? { tarjetas_amarillas: (estadistica?.tarjetas_amarillas || 0) + 1 }
    : { tarjetas_rojas: (estadistica?.tarjetas_rojas || 0) + 1 };

  if (estadistica) {
    await updateEstadisticaPartido(estadistica.id, update);
  } else {
    await createEstadisticaPartido({
      partido_id: partidoId,
      jugador_id: jugadorId,
      ...update,
      minutos_jugados: 0,
    });
  }
}

/**
 * Calcula estadísticas por posición en un equipo
 */
export async function getEstadisticasPorPosicion(equipoId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jugadores')
    .select(`
      posicion:posicion_id (nombre),
      estadisticas:estadisticas_partido (
        goles,
        asistencias,
        minutos_jugados,
        valoracion
      )
    `)
    .eq('equipo_id', equipoId)
    .eq('activo', true);

  if (error) {
    console.error('Error al obtener estadísticas por posición:', error);
    return {};
  }

  // Agrupar por posición
  const agrupado: Record<string, any> = {};

  data?.forEach((item: any) => {
    const posicion = item.posicion.nombre;
    if (!agrupado[posicion]) {
      agrupado[posicion] = {
        goles: 0,
        asistencias: 0,
        minutos: 0,
        partidos: 0,
        valoraciones: [],
      };
    }

    item.estadisticas.forEach((est: any) => {
      agrupado[posicion].goles += est.goles || 0;
      agrupado[posicion].asistencias += est.asistencias || 0;
      agrupado[posicion].minutos += est.minutos_jugados || 0;
      agrupado[posicion].partidos += 1;
      if (est.valoracion) {
        agrupado[posicion].valoraciones.push(est.valoracion);
      }
    });
  });

  // Calcular promedios
  Object.keys(agrupado).forEach((posicion) => {
    const stats = agrupado[posicion];
    stats.valoracion_promedio = stats.valoraciones.length > 0
      ? (stats.valoraciones.reduce((a: number, b: number) => a + b, 0) / stats.valoraciones.length).toFixed(2)
      : null;
    delete stats.valoraciones;
  });

  return agrupado;
}
