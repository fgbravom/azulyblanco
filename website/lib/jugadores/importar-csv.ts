/**
 * Importación de jugadores desde el CSV que exporta la base de Notion del
 * formulario de inscripción. Lo usan el admin (/api/jugadores/importar) y
 * scripts/importar-jugadores.mjs, que lo carga directo con Node: por eso este
 * archivo no importa nada salvo tipos.
 *
 * Un jugador que ya existe (mismo nombre y apellidos, sin importar tildes ni
 * mayúsculas) se salta: el CSV se puede volver a importar cuando lleguen
 * respuestas nuevas.
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
  existentes: { nombre: string; apellidos: string }[];
}

export type EstadoFila = 'nuevo' | 'ya existe' | 'repetido en el CSV' | 'error';

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
    .replace(/[̀-ͯ]/g, '')
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
    supabase.from('jugadores').select('nombre, apellidos'),
  ]);
  for (const r of [posiciones, categorias, equipos, existentes]) {
    if (r.error) throw new Error(`Error al leer la base: ${r.error.message}`);
  }
  return {
    posiciones: posiciones.data ?? [],
    categorias: categorias.data ?? [],
    equipos: equipos.data ?? [],
    existentes: existentes.data ?? [],
  };
}

/**
 * Decide qué pasa con cada fila del CSV sin escribir nada. Lanza un error si
 * al archivo le falta alguna columna del formulario.
 */
export function planificarImportacion(texto: string, ref: DatosReferencia): FilaImportacion[] {
  const [cabecera = [], ...filas] = parsearCsv(texto.replace(/^﻿/, ''));
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

  const yaEnBase = new Set(ref.existentes.map((j) => clave(`${j.nombre} ${j.apellidos}`)));
  const vistos = new Set<string>();

  return filas.map((fila, n) => {
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

    const k = clave(`${nombre} ${apellidos}`);
    let estado: EstadoFila = 'nuevo';
    if (errores.length) estado = 'error';
    else if (yaEnBase.has(k)) estado = 'ya existe';
    else if (vistos.has(k)) estado = 'repetido en el CSV';
    vistos.add(k);

    return {
      linea: n + 2,
      estado,
      detalle: errores.join('; '),
      jugador: {
        nombre,
        apellidos,
        equipo_id: equipo?.id ?? null,
        posicion_id: ids[0] ?? null,
        pie_preferido: piePreferido(fila[COL.pie] ?? ''),
        nacionalidad: 'Chile',
      },
      serie: equipo?.nombre ?? null,
      posiciones: ids.map((id) => ref.posiciones.find((p) => p.id === id)!.abreviatura),
      posicionesIds: ids,
    };
  });
}
