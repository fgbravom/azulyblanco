/**
 * Funciones de acceso a datos para Jugadores
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Jugador,
  JugadorInsert,
  JugadorUpdate,
  JugadorCompleto,
  JugadoresFilter,
  QueryOptions,
  PaginatedResponse,
} from '@/types/database';

// ============================================================================
// OBTENER JUGADORES
// ============================================================================

/**
 * Obtiene todos los jugadores con filtros opcionales
 */
export async function getJugadores(
  filter?: JugadoresFilter,
  options?: QueryOptions
): Promise<PaginatedResponse<JugadorCompleto>> {
  const supabase = await createClient();

  let query = supabase
    .from('vista_jugadores_completa')
    .select('*', { count: 'exact' });

  // Aplicar filtros
  if (filter?.equipo_id) {
    query = query.eq('equipo_id', filter.equipo_id);
  }
  if (filter?.posicion_id) {
    query = query.eq('posicion_id', filter.posicion_id);
  }
  if (filter?.estado) {
    query = query.eq('estado', filter.estado);
  }
  if (filter?.activo !== undefined) {
    query = query.eq('activo', filter.activo);
  }
  if (filter?.busqueda) {
    query = query.or(`nombre.ilike.%${filter.busqueda}%,apellidos.ilike.%${filter.busqueda}%`);
  }

  // Ordenamiento
  if (options?.sort) {
    query = query.order(options.sort.campo, { ascending: options.sort.orden === 'asc' });
  } else {
    query = query.order('dorsal', { ascending: true });
  }

  // Paginación
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error al obtener jugadores:', error);
    throw new Error('Error al obtener jugadores');
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
 * Obtiene un jugador por ID con información completa
 */
export async function getJugadorById(id: number): Promise<JugadorCompleto | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vista_jugadores_completa')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener jugador:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene jugadores por equipo
 */
export async function getJugadoresByEquipo(equipoId: number): Promise<JugadorCompleto[]> {
  const result = await getJugadores({ equipo_id: equipoId, activo: true });
  return result.data;
}

/**
 * Obtiene jugadores por posición
 */
export async function getJugadoresByPosicion(posicionId: number): Promise<JugadorCompleto[]> {
  const result = await getJugadores({ posicion_id: posicionId, activo: true });
  return result.data;
}

/**
 * Busca jugadores por nombre
 */
export async function buscarJugadores(busqueda: string): Promise<JugadorCompleto[]> {
  const result = await getJugadores({ busqueda });
  return result.data;
}

// ============================================================================
// CREAR JUGADOR
// ============================================================================

/**
 * Crea un nuevo jugador
 */
export async function createJugador(jugador: JugadorInsert): Promise<Jugador> {
  // Usar cliente admin para bypass RLS
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('jugadores')
    .insert(jugador)
    .select()
    .single();

  if (error) {
    console.error('Error al crear jugador:', error);
    throw new Error(`Error al crear jugador: ${error.message}`);
  }

  return data;
}

// ============================================================================
// ACTUALIZAR JUGADOR
// ============================================================================

/**
 * Actualiza un jugador existente
 */
export async function updateJugador(
  id: number,
  updates: JugadorUpdate
): Promise<Jugador> {
  // Usar cliente admin para bypass RLS
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('jugadores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar jugador:', error);
    throw new Error(`Error al actualizar jugador: ${error.message}`);
  }

  return data;
}

/**
 * Actualiza el estado de un jugador
 */
export async function updateEstadoJugador(
  id: number,
  estado: 'Activo' | 'Lesionado' | 'Sancionado' | 'Inactivo'
): Promise<Jugador> {
  return updateJugador(id, { estado });
}

/**
 * Marca un jugador como activo/inactivo
 */
export async function toggleJugadorActivo(id: number): Promise<Jugador> {
  const jugador = await getJugadorById(id);
  if (!jugador) {
    throw new Error('Jugador no encontrado');
  }

  return updateJugador(id, { activo: !jugador.activo });
}

// ============================================================================
// ELIMINAR JUGADOR
// ============================================================================

/**
 * Elimina un jugador (soft delete - marca como inactivo)
 */
export async function deleteJugador(id: number): Promise<void> {
  await updateJugador(id, { activo: false, estado: 'Inactivo' });
}

/**
 * Elimina un jugador permanentemente
 */
export async function deleteJugadorPermanente(id: number): Promise<void> {
  // Usar cliente admin para bypass RLS
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('jugadores')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar jugador:', error);
    throw new Error(`Error al eliminar jugador: ${error.message}`);
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Verifica si un dorsal está disponible en un equipo
 */
export async function isDorsalDisponible(
  equipoId: number,
  dorsal: number,
  jugadorId?: number
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from('jugadores')
    .select('id')
    .eq('equipo_id', equipoId)
    .eq('dorsal', dorsal)
    .eq('activo', true);

  // Si estamos actualizando, excluir el jugador actual
  if (jugadorId) {
    query = query.neq('id', jugadorId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al verificar dorsal:', error);
    return false;
  }

  return data.length === 0;
}

/**
 * Obtiene el siguiente dorsal disponible en un equipo
 */
export async function getNextDorsalDisponible(equipoId: number): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jugadores')
    .select('dorsal')
    .eq('equipo_id', equipoId)
    .eq('activo', true)
    .order('dorsal', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 1;
  }

  const maxDorsal = data[0].dorsal || 0;
  return maxDorsal + 1;
}

/**
 * Obtiene el conteo de jugadores por equipo
 */
export async function getConteoJugadoresPorEquipo(equipoId: number): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('jugadores')
    .select('*', { count: 'exact', head: true })
    .eq('equipo_id', equipoId)
    .eq('activo', true);

  if (error) {
    console.error('Error al contar jugadores:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Obtiene jugadores convocados para un partido
 */
export async function getJugadoresConvocados(partidoId: number): Promise<JugadorCompleto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('estadisticas_partido')
    .select(`
      jugador_id,
      jugadores:jugador_id (
        *,
        posiciones:posicion_id (*),
        equipos:equipo_id (
          *,
          categorias:categoria_id (*)
        )
      )
    `)
    .eq('partido_id', partidoId);

  if (error) {
    console.error('Error al obtener jugadores convocados:', error);
    return [];
  }

  // Transformar los datos al formato esperado
  return data.map((item: any) => {
    const jugador = item.jugadores;
    const posicion = jugador.posiciones;
    const equipo = jugador.equipos;
    const categoria = equipo.categorias;

    return {
      ...jugador,
      nombre_completo: `${jugador.nombre} ${jugador.apellidos}`,
      edad: jugador.fecha_nacimiento
        ? new Date().getFullYear() - new Date(jugador.fecha_nacimiento).getFullYear()
        : null,
      posicion: posicion.nombre,
      posicion_abr: posicion.abreviatura,
      equipo: equipo.nombre,
      categoria: categoria.nombre,
    };
  });
}
