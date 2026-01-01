/**
 * Funciones de acceso a datos para Equipos y Categorías
 */

import { createClient } from '@/lib/supabase/server';
import type {
  Equipo,
  EquipoInsert,
  EquipoUpdate,
  Categoria,
  CategoriaInsert,
  CategoriaUpdate,
  Posicion,
  PosicionInsert,
} from '@/types/database';

// ============================================================================
// CATEGORÍAS
// ============================================================================

/**
 * Obtiene todas las categorías activas
 */
export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene una categoría por ID
 */
export async function getCategoriaById(id: number): Promise<Categoria | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener categoría:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene una categoría por nombre
 */
export async function getCategoriaByNombre(nombre: string): Promise<Categoria | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('nombre', nombre)
    .single();

  if (error) {
    console.error('Error al obtener categoría:', error);
    return null;
  }

  return data;
}

/**
 * Crea una nueva categoría
 */
export async function createCategoria(categoria: CategoriaInsert): Promise<Categoria> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categorias')
    .insert(categoria)
    .select()
    .single();

  if (error) {
    console.error('Error al crear categoría:', error);
    throw new Error(`Error al crear categoría: ${error.message}`);
  }

  return data;
}

/**
 * Actualiza una categoría
 */
export async function updateCategoria(
  id: number,
  updates: CategoriaUpdate
): Promise<Categoria> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categorias')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar categoría:', error);
    throw new Error(`Error al actualizar categoría: ${error.message}`);
  }

  return data;
}

// ============================================================================
// EQUIPOS
// ============================================================================

/**
 * Obtiene todos los equipos activos
 */
export async function getEquipos(): Promise<Equipo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipos')
    .select(`
      *,
      categoria:categoria_id (nombre, orden)
    `)
    .eq('activo', true)
    .order('categoria.orden', { ascending: true });

  if (error) {
    console.error('Error al obtener equipos:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene un equipo por ID
 */
export async function getEquipoById(id: number): Promise<Equipo | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipos')
    .select(`
      *,
      categoria:categoria_id (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener equipo:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene equipos por categoría
 */
export async function getEquiposByCategoria(categoriaId: number): Promise<Equipo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipos')
    .select('*')
    .eq('categoria_id', categoriaId)
    .eq('activo', true)
    .order('temporada', { ascending: false });

  if (error) {
    console.error('Error al obtener equipos por categoría:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene equipos por temporada
 */
export async function getEquiposByTemporada(temporada: string): Promise<Equipo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipos')
    .select(`
      *,
      categoria:categoria_id (nombre, orden)
    `)
    .eq('temporada', temporada)
    .eq('activo', true)
    .order('categoria.orden', { ascending: true });

  if (error) {
    console.error('Error al obtener equipos por temporada:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene la temporada actual
 */
export function getTemporadaActual(): string {
  const hoy = new Date();
  const mes = hoy.getMonth();
  const año = hoy.getFullYear();

  // Si estamos entre enero y junio, la temporada comenzó el año pasado
  if (mes < 6) {
    return `${año - 1}-${año}`;
  } else {
    return `${año}-${año + 1}`;
  }
}

/**
 * Obtiene equipos de la temporada actual
 */
export async function getEquiposTemporadaActual(): Promise<Equipo[]> {
  const temporadaActual = getTemporadaActual();
  return getEquiposByTemporada(temporadaActual);
}

/**
 * Crea un nuevo equipo
 */
export async function createEquipo(equipo: EquipoInsert): Promise<Equipo> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipos')
    .insert(equipo)
    .select()
    .single();

  if (error) {
    console.error('Error al crear equipo:', error);
    throw new Error(`Error al crear equipo: ${error.message}`);
  }

  return data;
}

/**
 * Actualiza un equipo
 */
export async function updateEquipo(
  id: number,
  updates: EquipoUpdate
): Promise<Equipo> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar equipo:', error);
    throw new Error(`Error al actualizar equipo: ${error.message}`);
  }

  return data;
}

/**
 * Marca un equipo como activo/inactivo
 */
export async function toggleEquipoActivo(id: number): Promise<Equipo> {
  const equipo = await getEquipoById(id);
  if (!equipo) {
    throw new Error('Equipo no encontrado');
  }

  return updateEquipo(id, { activo: !equipo.activo });
}

// ============================================================================
// POSICIONES
// ============================================================================

/**
 * Obtiene todas las posiciones
 */
export async function getPosiciones(): Promise<Posicion[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posiciones')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error al obtener posiciones:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene una posición por ID
 */
export async function getPosicionById(id: number): Promise<Posicion | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posiciones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener posición:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene una posición por nombre
 */
export async function getPosicionByNombre(nombre: string): Promise<Posicion | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posiciones')
    .select('*')
    .eq('nombre', nombre)
    .single();

  if (error) {
    console.error('Error al obtener posición:', error);
    return null;
  }

  return data;
}

/**
 * Crea una nueva posición
 */
export async function createPosicion(posicion: PosicionInsert): Promise<Posicion> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posiciones')
    .insert(posicion)
    .select()
    .single();

  if (error) {
    console.error('Error al crear posición:', error);
    throw new Error(`Error al crear posición: ${error.message}`);
  }

  return data;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene resumen de equipos con conteo de jugadores
 */
export async function getResumenEquipos() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipos')
    .select(`
      *,
      categoria:categoria_id (nombre),
      jugadores:jugadores(count)
    `)
    .eq('activo', true)
    .order('categoria.orden', { ascending: true });

  if (error) {
    console.error('Error al obtener resumen de equipos:', error);
    return [];
  }

  return data?.map((equipo: any) => ({
    ...equipo,
    total_jugadores: equipo.jugadores[0]?.count || 0,
  })) || [];
}

/**
 * Verifica si existe un equipo en una categoría y temporada
 */
export async function existeEquipo(
  categoriaId: number,
  temporada: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipos')
    .select('id')
    .eq('categoria_id', categoriaId)
    .eq('temporada', temporada)
    .single();

  return data !== null && !error;
}

/**
 * Crea equipos para una nueva temporada
 */
export async function crearEquiposTemporada(temporada: string): Promise<Equipo[]> {
  const categorias = await getCategorias();
  const equiposCreados: Equipo[] = [];

  for (const categoria of categorias) {
    // Verificar si ya existe
    const existe = await existeEquipo(categoria.id, temporada);
    if (!existe) {
      const equipo = await createEquipo({
        categoria_id: categoria.id,
        nombre: `Azul y Blanco - ${categoria.nombre}`,
        temporada,
        activo: true,
      });
      equiposCreados.push(equipo);
    }
  }

  return equiposCreados;
}
