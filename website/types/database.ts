/**
 * Tipos TypeScript para el esquema de base de datos
 * Club Azul y Blanco
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export type EstadoJugador = 'Activo' | 'Lesionado' | 'Sancionado' | 'Inactivo';
export type EstadoPartido = 'Programado' | 'En curso' | 'Finalizado' | 'Suspendido' | 'Cancelado';
export type UbicacionPartido = 'Local' | 'Visitante';
export type TipoCompeticion = 'Liga' | 'Copa' | 'Amistoso';
export type PiePreferido = 'Derecho' | 'Izquierdo' | 'Ambidiestro';
export type ResultadoPartido = 'Victoria' | 'Empate' | 'Derrota' | 'Sin resultado';

// ============================================================================
// CATEGORÍAS
// ============================================================================

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

/** Lo que se lee de equipos con la clave pública: sin los datos de pago (migración 005) */
export type EquipoPublico = Omit<Equipo, 'cuota_monto' | 'cuota_datos_pago'>;

export interface CategoriaInsert {
  nombre: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

// ============================================================================
// POSICIONES
// ============================================================================

export interface Posicion {
  id: number;
  nombre: string;
  abreviatura: string;
  created_at: string;
}

export interface PosicionInsert {
  nombre: string;
  abreviatura: string;
}

// ============================================================================
// EQUIPOS
// ============================================================================

export interface Equipo {
  id: number;
  categoria_id: number;
  nombre: string;
  temporada: string;
  entrenador: string | null;
  asistente_tecnico: string | null;
  preparador_fisico: string | null;
  /** Fotos del cuerpo técnico (migración 007) */
  entrenador_foto_url: string | null;
  asistente_tecnico_foto_url: string | null;
  preparador_fisico_foto_url: string | null;
  /** Encuadre de cada foto, de 0 a 100 por eje (migración 018); null = sin ajustar */
  entrenador_foco_x: number | null;
  entrenador_foco_y: number | null;
  asistente_tecnico_foco_x: number | null;
  asistente_tecnico_foco_y: number | null;
  preparador_fisico_foco_x: number | null;
  preparador_fisico_foco_y: number | null;
  /** Cuota mensual y datos de transferencia (migración 004) */
  cuota_monto: number;
  cuota_datos_pago: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipoInsert {
  categoria_id: number;
  nombre: string;
  temporada: string;
  entrenador?: string;
  asistente_tecnico?: string;
  preparador_fisico?: string;
  activo?: boolean;
}

export interface EquipoUpdate {
  categoria_id?: number;
  nombre?: string;
  temporada?: string;
  entrenador?: string;
  asistente_tecnico?: string;
  preparador_fisico?: string;
  activo?: boolean;
}

// ============================================================================
// JUGADORES
// ============================================================================

export interface Jugador {
  id: number;

  // Información personal
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string | null;
  nacionalidad: string;
  dni: string | null;
  foto_url: string | null;
  /** Encuadre de la foto, de 0 a 100 por eje (migración 018); null = sin ajustar */
  foto_foco_x: number | null;
  foto_foco_y: number | null;

  // Información deportiva
  equipo_id: number;
  posicion_id: number | null;
  dorsal: number | null;
  altura_cm: number | null;
  peso_kg: number | null;
  pie_preferido: PiePreferido | null;

  // Información de contacto
  email: string | null;
  telefono: string | null;
  direccion: string | null;

  // Información médica
  tipo_sangre: string | null;
  contacto_emergencia: string | null;
  telefono_emergencia: string | null;
  alergias: string | null;
  lesiones_cronicas: string | null;

  // Estado
  estado: EstadoJugador;
  fecha_alta: string;
  fecha_baja: string | null;

  // Cuotas (migración 004)
  cuota_condicion: 'regular' | 'refuerzo' | 'becado';
  /** Llave del link personal /cuotas/<código> */
  codigo_cuotas: string;

  // Metadata
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface JugadorInsert {
  // Información personal (requerida)
  nombre: string;
  apellidos: string;
  equipo_id: number;
  posicion_id: number;

  // Información personal (opcional)
  fecha_nacimiento?: string;
  nacionalidad?: string;
  dni?: string;
  foto_url?: string;
  foto_foco_x?: number | null;
  foto_foco_y?: number | null;

  // Información deportiva
  dorsal?: number;
  altura_cm?: number;
  peso_kg?: number;
  pie_preferido?: PiePreferido;

  // Información de contacto
  email?: string;
  telefono?: string;
  direccion?: string;

  // Información médica
  tipo_sangre?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  alergias?: string;
  lesiones_cronicas?: string;

  // Estado
  estado?: EstadoJugador;
  fecha_alta?: string;
  fecha_baja?: string;
  activo?: boolean;
}

export interface JugadorUpdate {
  nombre?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  nacionalidad?: string;
  dni?: string;
  foto_url?: string;
  foto_foco_x?: number | null;
  foto_foco_y?: number | null;
  equipo_id?: number;
  posicion_id?: number;
  dorsal?: number;
  altura_cm?: number;
  peso_kg?: number;
  pie_preferido?: PiePreferido;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipo_sangre?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  alergias?: string;
  lesiones_cronicas?: string;
  estado?: EstadoJugador;
  fecha_alta?: string;
  fecha_baja?: string;
  activo?: boolean;
}

// ============================================================================
// PARTIDOS
// ============================================================================

export interface Partido {
  id: number;
  equipo_id: number;
  fecha: string;
  hora: string | null;
  ubicacion: UbicacionPartido;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: EstadoPartido;
  competicion: string | null;
  jornada: number | null;
  estadio: string | null;
  arbitro: string | null;
  asistencia: number | null;
  resumen: string | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartidoInsert {
  equipo_id: number;
  fecha: string;
  ubicacion: UbicacionPartido;
  equipo_local: string;
  equipo_visitante: string;
  hora?: string;
  goles_local?: number;
  goles_visitante?: number;
  estado?: EstadoPartido;
  competicion?: string;
  jornada?: number;
  estadio?: string;
  arbitro?: string;
  asistencia?: number;
  resumen?: string;
  observaciones?: string;
}

export interface PartidoUpdate {
  equipo_id?: number;
  fecha?: string;
  hora?: string;
  ubicacion?: UbicacionPartido;
  equipo_local?: string;
  equipo_visitante?: string;
  goles_local?: number;
  goles_visitante?: number;
  estado?: EstadoPartido;
  competicion?: string;
  jornada?: number;
  estadio?: string;
  arbitro?: string;
  asistencia?: number;
  resumen?: string;
  observaciones?: string;
}

// ============================================================================
// ESTADÍSTICAS POR PARTIDO
// ============================================================================

export interface EstadisticaPartido {
  id: number;
  partido_id: number;
  jugador_id: number;

  // Participación
  titular: boolean;
  minutos_jugados: number;
  minuto_entrada: number | null;
  minuto_salida: number | null;

  // Estadísticas ofensivas
  goles: number;
  asistencias: number;
  tiros_totales: number;
  tiros_puerta: number;
  regates_exitosos: number;
  pases_clave: number;

  // Estadísticas defensivas
  tackles_exitosos: number;
  intercepciones: number;
  despejes: number;
  duelos_ganados: number;
  duelos_perdidos: number;

  // Disciplina
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  faltas_cometidas: number;
  faltas_recibidas: number;

  // Portero
  paradas: number;
  goles_encajados: number;
  penales_detenidos: number;

  // Valoración
  valoracion: number | null;
  observaciones: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface EstadisticaPartidoInsert {
  partido_id: number;
  jugador_id: number;
  titular?: boolean;
  minutos_jugados?: number;
  minuto_entrada?: number;
  minuto_salida?: number;
  goles?: number;
  asistencias?: number;
  tiros_totales?: number;
  tiros_puerta?: number;
  regates_exitosos?: number;
  pases_clave?: number;
  tackles_exitosos?: number;
  intercepciones?: number;
  despejes?: number;
  duelos_ganados?: number;
  duelos_perdidos?: number;
  tarjetas_amarillas?: number;
  tarjetas_rojas?: number;
  faltas_cometidas?: number;
  faltas_recibidas?: number;
  paradas?: number;
  goles_encajados?: number;
  penales_detenidos?: number;
  valoracion?: number;
  observaciones?: string;
}

export interface EstadisticaPartidoUpdate {
  titular?: boolean;
  minutos_jugados?: number;
  minuto_entrada?: number;
  minuto_salida?: number;
  goles?: number;
  asistencias?: number;
  tiros_totales?: number;
  tiros_puerta?: number;
  regates_exitosos?: number;
  pases_clave?: number;
  tackles_exitosos?: number;
  intercepciones?: number;
  despejes?: number;
  duelos_ganados?: number;
  duelos_perdidos?: number;
  tarjetas_amarillas?: number;
  tarjetas_rojas?: number;
  faltas_cometidas?: number;
  faltas_recibidas?: number;
  paradas?: number;
  goles_encajados?: number;
  penales_detenidos?: number;
  valoracion?: number;
  observaciones?: string;
}

// ============================================================================
// VISTAS (Tipos extendidos con relaciones)
// ============================================================================

export interface JugadorCompleto extends Jugador {
  nombre_completo: string;
  edad: number | null;
  /** Posición principal (jugadores.posicion_id); null si está por definir (migración 004) */
  posicion: string | null;
  posicion_abr: string | null;
  /** Todas sus posiciones, la principal primero (migración 003) */
  posiciones_ids: number[];
  posiciones: string[];
  posiciones_abr: string[];
  equipo: string;
  categoria: string;
}

export interface EstadisticasJugador {
  jugador_id: number;
  jugador: string;
  equipo: string;
  partidos_jugados: number;
  minutos_totales: number;
  goles_totales: number;
  asistencias_totales: number;
  amarillas_totales: number;
  rojas_totales: number;
  valoracion_promedio: number | null;
}

export interface PartidoCompleto extends Partido {
  equipo: string;
  categoria: string;
  resultado: ResultadoPartido;
}

// ============================================================================
// TIPOS DE RESPUESTA DE API
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// FILTROS Y OPCIONES DE CONSULTA
// ============================================================================

export interface JugadoresFilter {
  equipo_id?: number;
  categoria_id?: number;
  posicion_id?: number;
  estado?: EstadoJugador;
  activo?: boolean;
  busqueda?: string; // Para buscar por nombre
}

export interface PartidosFilter {
  equipo_id?: number;
  categoria_id?: number;
  estado?: EstadoPartido;
  competicion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  ubicacion?: UbicacionPartido;
}

export interface EstadisticasFilter {
  jugador_id?: number;
  partido_id?: number;
  equipo_id?: number;
  temporada?: string;
}

export interface SortOptions {
  campo: string;
  orden: 'asc' | 'desc';
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sort?: SortOptions;
}
