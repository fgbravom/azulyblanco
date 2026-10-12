/**
 * Importación de jugadores desde el CSV que exporta la base de Notion del
 * formulario de inscripción. Lo usan el admin (/api/jugadores/importar) y
 * scripts/importar-jugadores.mjs, que lo carga directo con Node: por eso este
 * archivo no importa nada salvo tipos.
 *
 * Un jugador que ya existe (mismo nombre y apellidos, sin importar tildes ni
 * mayúsculas) no se crea de nuevo: se le actualizan la serie, las posiciones y
 * el pie hábil si cambiaron en el formulario. El nombre y el resto de la ficha
 * no se tocan. Así el CSV completo se puede volver a importar cada vez que
 * lleguen respuestas nuevas o alguien corrija las suyas.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

// Siglas del formulario que en la base se llaman distinto
const ALIAS_POSICION: Record<string, string> = { MCD: 'MDC', MCO: 'MO', PT: 'POR' };

const PIE: Record<string, 'Derecho' | 'Izquierdo'> = { derecha: 'Derecho', izquierda: 'Izquierdo' };

// Palabras que quedan en minúscula al corregir mayúsculas ("de la Fuente")
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y']);

export interface DatosReferencia {
  posiciones: { id: number; abreviatura: string }[];
  categorias: { id: number; nombre: string }[];
  equipos: { id: number; nombre: string; categoria_id: number; temporada: string; activo: boolean }[];
  existentes: JugadorExistente[];
}

export interface JugadorExistente {
  id: number;
  nombre: string;
  apellidos: string;
  equipo_id: number;
  pie_preferido: 'Derecho' | 'Izquierdo' | 'Ambidiestro' | null;
  /** Ids de posición en orden; el primero es el principal */
  posiciones: number[];
}

export type EstadoFila = 'nuevo' | 'actualizar' | 'sin cambios' | 'repetido en el CSV' | 'error';

export interface FilaImportacion {
  /** Línea del archivo (la cabecera es la 1) */
  linea: number;
  estado: EstadoFila;
  detalle: string;
  jugador: {
    nombre: string;
    apellidos: string;
    equipo_id: number | null;
    posicion_id: number | null;
    pie_preferido: 'Derecho' | 'Izquierdo' | 'Ambidiestro' | null;
    nacionalidad: string;
  };
  /** Nombre del equipo, para mostrar */
  serie: string | null;
  /** Siglas en el orden del formulario, para mostrar */
  posiciones: string[];
  /** Ids de posición; el primero es el principal */
  posicionesIds: number[];
  /** Jugador del plantel que coincide con la fila ('actualizar' y 'sin cambios') */
  jugadorId: number | null;
  /** Qué cambia en un jugador que ya existe, para mostrar ("Serie: Primera → 35") */
  cambios: string[];
  /** Lo que hay que escribir en un jugador que ya existe; solo lo que cambió */
  actualizacion: {
    campos: { equipo_id?: number; pie_preferido?: 'Derecho' | 'Izquierdo' | 'Ambidiestro' };
    posicionesIds?: number[];
  } | null;
}

/** CSV con comillas, comas y saltos de línea dentro de los campos */
export function parsearCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') enComillas = false;
      else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ',') {
      fila.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else campo += c;
  }
  if (campo || fila.length) filas.push([...fila, campo]);
  return filas.filter((f) => f.some((v) => v.trim()));
}

/** Para comparar textos: sin tildes, sin mayúsculas, sin espacios de más */
export function clave(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** "gabriel benjamin " → "Gabriel Benjamin" */
export function nombrePropio(texto: string): string {
  return texto
    .trim()
    .split(/\s+/)
    .map((p, i) => (i > 0 && PARTICULAS.has(p.toLowerCase()) ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
}

function piePreferido(valor: string): FilaImportacion['jugador']['pie_preferido'] {
  const lados = [...new Set(valor.split(',').map((v) => PIE[clave(v)]).filter(Boolean))];
  if (lados.length > 1) return 'Ambidiestro';
  return lados[0] ?? null;
}

/** Lee de la base lo necesario para resolver series y posiciones y detectar repetidos */
export async function cargarDatosReferencia(supabase: SupabaseClient): Promise<DatosReferencia> {
  const [posiciones, categorias, equipos, existentes] = await Promise.all([
    supabase.from('posiciones').select('id, abreviatura'),
    supabase.from('categorias').select('id, nombre'),
    supabase.from('equipos').select('id, nombre, categoria_id, temporada, activo'),
    supabase
      .from('jugadores')
      .select('id, nombre, apellidos, equipo_id, pie_preferido, posicion_id, jugador_posiciones(posicion_id, orden)'),
  ]);
  for (const r of [posiciones, categorias, equipos, existentes]) {
    if (r.error) throw new Error(`Error al leer la base: ${r.error.message}`);
  }
  return {
    posiciones: posiciones.data ?? [],
    categorias: categorias.data ?? [],
    equipos: equipos.data ?? [],
    existentes: (existentes.data ?? []).map(({ jugador_posiciones, posicion_id, ...j }) => {
      const orden = [...(jugador_posiciones as { posicion_id: number; orden: number }[])].sort((a, b) => a.orden - b.orden);
      return { ...j, posiciones: orden.length ? orden.map((p) => p.posicion_id) : posicion_id ? [posicion_id] : [] };
    }),
  };
}

/**
 * Decide qué pasa con cada fila del CSV sin escribir nada. Lanza un error si
 * al archivo le falta alguna columna del formulario.
 */
export function planificarImportacion(texto: string, ref: DatosReferencia): FilaImportacion[] {
  const [cabecera = [], ...filas] = parsearCsv(texto.replace(/^\uFEFF/, ''));
  const columnas = cabecera.map(clave);
  const columna = (nombre: string) => {
    const i = columnas.indexOf(nombre);
    if (i === -1) {
      throw new Error(
        `Al CSV le falta la columna "${nombre}". ¿Es el export de la base de Notion del formulario? Columnas: ${cabecera.join(' | ')}`
      );
    }
    return i;
  };
  const COL = {
    nombres: columna('nombres'),
    paterno: columna('apellido paterno'),
    materno: columna('apellido materno'),
    pie: columna('pierna habil'),
    posiciones: [columna('posicion preferida'), columna('posicion 2'), columna('posicion 3'), columna('posicion 4')],
    serie: columna('serie'),
  };

  const posicionPorSigla = new Map(ref.posiciones.map((p) => [clave(p.abreviatura), p]));

  /** Equipo activo más reciente de la serie (Primera, Honor, 35) */
  const equipoDeSerie = (serie: string) => {
    const categoria = ref.categorias.find((c) => clave(c.nombre) === clave(serie));
    if (!categoria) return null;
    return (
      ref.equipos
        .filter((e) => e.categoria_id === categoria.id && e.activo)
        .sort((a, b) => b.temporada.localeCompare(a.temporada))[0] ?? null
    );
  };

  const enBase = new Map<string, JugadorExistente[]>();
  for (const j of ref.existentes) {
    const k = clave(`${j.nombre} ${j.apellidos}`);
    enBase.set(k, [...(enBase.get(k) ?? []), j]);
  }

  const sigla = (id: number) => ref.posiciones.find((p) => p.id === id)?.abreviatura ?? '?';
  const nombreEquipo = (id: number) => {
    const equipo = ref.equipos.find((e) => e.id === id);
    if (!equipo) return '—';
    // Dos equipos de la misma serie solo se distinguen por la temporada
    const homonimos = ref.equipos.filter((e) => e.nombre === equipo.nombre).length > 1;
    return homonimos ? `${equipo.nombre} (${equipo.temporada})` : equipo.nombre;
  };

  // Primera pasada: leer cada fila por separado
  const leidas = filas.map((fila, n) => {
    const nombre = nombrePropio(fila[COL.nombres] ?? '');
    const apellidos = [fila[COL.paterno], fila[COL.materno]]
      .map((a) => nombrePropio(a ?? ''))
      .filter(Boolean)
      .join(' ');
    const errores: string[] = [];

    if (!nombre || !apellidos) errores.push('falta nombre o apellidos');

    const equipo = equipoDeSerie(fila[COL.serie] ?? '');
    if (!equipo) errores.push(`serie desconocida "${(fila[COL.serie] ?? '').trim()}"`);

    const siglas = COL.posiciones.map((i) => (fila[i] ?? '').trim()).filter(Boolean);
    const ids: number[] = [];
    for (const sigla of siglas) {
      const posicion = posicionPorSigla.get(clave(ALIAS_POSICION[sigla.toUpperCase()] ?? sigla));
      if (!posicion) errores.push(`posición desconocida "${sigla}"`);
      else if (!ids.includes(posicion.id)) ids.push(posicion.id);
    }
    if (siglas.length === 0) errores.push('sin posiciones');

    const pie = piePreferido(fila[COL.pie] ?? '');
    return { linea: n + 2, nombre, apellidos, equipo, ids, pie, errores, k: clave(`${nombre} ${apellidos}`) };
  });

  // Quien respondió el formulario más de una vez: Notion no exporta las filas
  // siempre en el mismo orden ni con la fecha de respuesta, así que si las
  // respuestas difieren no hay cómo saber cuál vale y no se toca al jugador
  const respuestas = new Map<string, typeof leidas>();
  for (const r of leidas.filter((r) => !r.errores.length)) respuestas.set(r.k, [...(respuestas.get(r.k) ?? []), r]);
  for (const grupo of respuestas.values()) {
    const firmas = new Set(grupo.map((r) => `${r.equipo!.id}|${r.pie}|${r.ids.join()}`));
    if (firmas.size === 1) continue;
    for (const r of grupo) {
      r.errores.push(
        `respondió ${grupo.length} veces con datos distintos (filas ${grupo.map((g) => g.linea).join(', ')}); deja una sola respuesta en Notion`
      );
    }
  }

  // Segunda pasada: decidir qué hacer con cada fila
  const vistos = new Set<string>();
  return leidas.map(({ linea, nombre, apellidos, equipo, ids, pie, errores, k }) => {
    const coincidencias = enBase.get(k) ?? [];
    if (!errores.length && !vistos.has(k) && coincidencias.length > 1) {
      errores.push(`hay ${coincidencias.length} jugadores con este nombre en el plantel; actualízalo a mano`);
    }

    let estado: EstadoFila = 'nuevo';
    let existente: JugadorExistente | null = null;
    const cambios: string[] = [];
    let actualizacion: FilaImportacion['actualizacion'] = null;
    if (errores.length) estado = 'error';
    else if (vistos.has(k)) estado = 'repetido en el CSV';
    else if (coincidencias.length === 1) {
      existente = coincidencias[0];
      actualizacion = { campos: {} };
      if (existente.equipo_id !== equipo!.id) {
        actualizacion.campos.equipo_id = equipo!.id;
        cambios.push(`Serie: ${nombreEquipo(existente.equipo_id)} → ${nombreEquipo(equipo!.id)}`);
      }
      // Sin pie en el formulario se conserva el que ya tenía
      if (pie && existente.pie_preferido !== pie) {
        actualizacion.campos.pie_preferido = pie;
        cambios.push(`Pie: ${existente.pie_preferido ?? '—'} → ${pie}`);
      }
      if (existente.posiciones.join() !== ids.join()) {
        actualizacion.posicionesIds = ids;
        cambios.push(
          `Posiciones: ${existente.posiciones.map(sigla).join(', ') || '—'} → ${ids.map(sigla).join(', ')}`
        );
      }
      estado = cambios.length ? 'actualizar' : 'sin cambios';
      if (!cambios.length) actualizacion = null;
    }
    vistos.add(k);

    return {
      linea,
      estado,
      detalle: errores.join('; '),
      jugador: {
        nombre,
        apellidos,
        equipo_id: equipo?.id ?? null,
        posicion_id: ids[0] ?? null,
        pie_preferido: pie,
        nacionalidad: 'Chile',
      },
      serie: equipo?.nombre ?? null,
      posiciones: ids.map(sigla),
      posicionesIds: ids,
      jugadorId: existente?.id ?? null,
      cambios,
      actualizacion,
    };
  });
}
