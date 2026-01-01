/**
 * Funciones de acceso a datos para Partidos
 */

import { createClient } from '@/lib/supabase/server';
import type {
  Partido,
  PartidoInsert,
  PartidoUpdate,
  PartidoCompleto,
  PartidosFilter,
  QueryOptions,
  PaginatedResponse,
} from '@/types/database';

// ============================================================================
// OBTENER PARTIDOS
// ============================================================================

/**
 * Obtiene todos los partidos con filtros opcionales
 */
export async function getPartidos(
  filter?: PartidosFilter,
  options?: QueryOptions
): Promise<PaginatedResponse<PartidoCompleto>> {
  const supabase = await createClient();

  let query = supabase
    .from('vista_partidos_completa')
    .select('*', { count: 'exact' });

  // Aplicar filtros
  if (filter?.equipo_id) {
    query = query.eq('equipo_id', filter.equipo_id);
  }
  if (filter?.estado) {
    query = query.eq('estado', filter.estado);
  }
  if (filter?.competicion) {
    query = query.eq('competicion', filter.competicion);
  }
  if (filter?.ubicacion) {
    query = query.eq('ubicacion', filter.ubicacion);
  }
  if (filter?.fecha_desde) {
    query = query.gte('fecha', filter.fecha_desde);
  }
  if (filter?.fecha_hasta) {
    query = query.lte('fecha', filter.fecha_hasta);
  }

  // Ordenamiento
  if (options?.sort) {
    query = query.order(options.sort.campo, { ascending: options.sort.orden === 'asc' });
  } else {
    query = query.order('fecha', { ascending: false });
  }

  // Paginación
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error al obtener partidos:', error);
    throw new Error('Error al obtener partidos');
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Obtiene un partido por ID con información completa
 */
export async function getPartidoById(id: number): Promise<PartidoCompleto | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vista_partidos_completa')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener partido:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene próximos partidos (programados y en futuro)
 */
export async function getProximosPartidos(
  equipoId?: number,
  limit: number = 5
): Promise<PartidoCompleto[]> {
  const supabase = await createClient();

  let query = supabase
    .from('vista_partidos_completa')
    .select('*')
    .eq('estado', 'Programado')
    .gte('fecha', new Date().toISOString())
    .order('fecha', { ascending: true })
    .limit(limit);

  if (equipoId) {
    query = query.eq('equipo_id', equipoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener próximos partidos:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene últimos partidos finalizados
 */
export async function getUltimosPartidos(
  equipoId?: number,
  limit: number = 5
): Promise<PartidoCompleto[]> {
  const supabase = await createClient();

  let query = supabase
    .from('vista_partidos_completa')
    .select('*')
    .eq('estado', 'Finalizado')
    .order('fecha', { ascending: false })
    .limit(limit);

  if (equipoId) {
    query = query.eq('equipo_id', equipoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener últimos partidos:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene partidos por equipo
 */
export async function getPartidosByEquipo(
  equipoId: number,
  limit?: number
): Promise<PartidoCompleto[]> {
  const result = await getPartidos(
    { equipo_id: equipoId },
    { pageSize: limit || 50 }
  );
  return result.data;
}

/**
 * Obtiene partidos de una competición
 */
export async function getPartidosByCompeticion(
  competicion: string
): Promise<PartidoCompleto[]> {
  const result = await getPartidos({ competicion });
  return result.data;
}

// ============================================================================
// CREAR PARTIDO
// ============================================================================

/**
 * Crea un nuevo partido
 */
export async function createPartido(partido: PartidoInsert): Promise<Partido> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('partidos')
    .insert(partido)
    .select()
    .single();

  if (error) {
    console.error('Error al crear partido:', error);
    throw new Error(`Error al crear partido: ${error.message}`);
  }

  return data;
}

// ============================================================================
// ACTUALIZAR PARTIDO
// ============================================================================

/**
 * Actualiza un partido existente
 */
export async function updatePartido(
  id: number,
  updates: PartidoUpdate
): Promise<Partido> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('partidos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar partido:', error);
    throw new Error(`Error al actualizar partido: ${error.message}`);
  }

  return data;
}

/**
 * Actualiza el resultado de un partido
 */
export async function updateResultadoPartido(
  id: number,
  golesLocal: number,
  golesVisitante: number
): Promise<Partido> {
  return updatePartido(id, {
    goles_local: golesLocal,
    goles_visitante: golesVisitante,
    estado: 'Finalizado',
  });
}

/**
 * Actualiza el estado de un partido
 */
export async function updateEstadoPartido(
  id: number,
  estado: 'Programado' | 'En curso' | 'Finalizado' | 'Suspendido' | 'Cancelado'
): Promise<Partido> {
  return updatePartido(id, { estado });
}

// ============================================================================
// ELIMINAR PARTIDO
// ============================================================================

/**
 * Elimina un partido permanentemente
 */
export async function deletePartido(id: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('partidos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar partido:', error);
    throw new Error(`Error al eliminar partido: ${error.message}`);
  }
}

// ============================================================================
// ESTADÍSTICAS Y ANÁLISIS
// ============================================================================

/**
 * Obtiene estadísticas generales de un equipo
 */
export async function getEstadisticasEquipo(equipoId: number, temporada?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('vista_partidos_completa')
    .select('*')
    .eq('equipo_id', equipoId)
    .eq('estado', 'Finalizado');

  if (temporada) {
    // Filtrar por temporada si se proporciona
    const equipoQuery = await supabase
      .from('equipos')
      .select('id')
      .eq('id', equipoId)
      .eq('temporada', temporada)
      .single();

    if (equipoQuery.data) {
      query = query.eq('equipo_id', equipoQuery.data.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }

  const partidos = data || [];

  // Calcular estadísticas
  let victorias = 0;
  let empates = 0;
  let derrotas = 0;
  let golesAFavor = 0;
  let golesEnContra = 0;

  partidos.forEach((partido: PartidoCompleto) => {
    if (partido.resultado === 'Victoria') victorias++;
    else if (partido.resultado === 'Empate') empates++;
    else if (partido.resultado === 'Derrota') derrotas++;

    // Sumar goles
    if (partido.ubicacion === 'Local') {
      golesAFavor += partido.goles_local || 0;
      golesEnContra += partido.goles_visitante || 0;
    } else {
      golesAFavor += partido.goles_visitante || 0;
      golesEnContra += partido.goles_local || 0;
    }
  });

  const partidosJugados = partidos.length;
  const puntos = victorias * 3 + empates;
  const diferenciaGoles = golesAFavor - golesEnContra;

  return {
    partidosJugados,
    victorias,
    empates,
    derrotas,
    puntos,
    golesAFavor,
    golesEnContra,
    diferenciaGoles,
    promedioPuntos: partidosJugados > 0 ? (puntos / partidosJugados).toFixed(2) : '0.00',
    porcentajeVictorias: partidosJugados > 0
      ? ((victorias / partidosJugados) * 100).toFixed(1)
      : '0.0',
  };
}

/**
 * Obtiene racha de resultados recientes
 */
export async function getRachaEquipo(
  equipoId: number,
  limit: number = 5
): Promise<string[]> {
  const partidos = await getUltimosPartidos(equipoId, limit);

  return partidos.map((partido) => {
    if (partido.resultado === 'Victoria') return 'V';
    if (partido.resultado === 'Empate') return 'E';
    if (partido.resultado === 'Derrota') return 'D';
    return '-';
  });
}

/**
 * Obtiene el calendario completo de un equipo
 */
export async function getCalendarioEquipo(
  equipoId: number,
  temporada?: string
): Promise<PartidoCompleto[]> {
  const filter: PartidosFilter = { equipo_id: equipoId };

  if (temporada) {
    // Obtener el equipo de la temporada específica
    const supabase = await createClient();
    const { data: equipo } = await supabase
      .from('equipos')
      .select('id')
      .eq('id', equipoId)
      .eq('temporada', temporada)
      .single();

    if (equipo) {
      filter.equipo_id = equipo.id;
    }
  }

  const result = await getPartidos(filter, {
    sort: { campo: 'fecha', orden: 'asc' },
    pageSize: 100,
  });

  return result.data;
}

/**
 * Verifica si hay conflictos de horario para un equipo
 */
export async function verificarConflictoHorario(
  equipoId: number,
  fecha: string,
  partidoId?: number
): Promise<boolean> {
  const supabase = await createClient();

  // Buscar partidos en la misma fecha
  let query = supabase
    .from('partidos')
    .select('id')
    .eq('equipo_id', equipoId)
    .gte('fecha', `${fecha}T00:00:00`)
    .lt('fecha', `${fecha}T23:59:59`);

  // Si estamos actualizando, excluir el partido actual
  if (partidoId) {
    query = query.neq('id', partidoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al verificar conflictos:', error);
    return false;
  }

  return (data?.length || 0) > 0;
}
