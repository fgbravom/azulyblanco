/**
 * Importa jugadores desde el CSV que exporta la base de Notion del formulario
 * de inscripción.
 *
 *   node scripts/importar-jugadores.mjs <archivo.csv>                  → muestra qué haría en local
 *   node scripts/importar-jugadores.mjs <archivo.csv> --aplicar        → importa en local
 *   node scripts/importar-jugadores.mjs <archivo.csv> --prod --aplicar → importa en producción
 *
 * Sin --aplicar no escribe nada. Usa la service_role de .env.local o, con
 * --prod, de .env.produccion.local.
 *
 * Un jugador que ya existe (mismo nombre y apellidos, sin importar tildes ni
 * mayúsculas) se salta: el CSV se puede volver a importar cuando lleguen
 * respuestas nuevas.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const archivo = args.find((a) => !a.startsWith('--'))
const aplicar = args.includes('--aplicar')
const prod = args.includes('--prod')

if (!archivo || !existsSync(archivo)) {
  console.error('Uso: node scripts/importar-jugadores.mjs <archivo.csv> [--prod] [--aplicar]')
  process.exit(1)
}

// Siglas del formulario que en la base se llaman distinto
const ALIAS_POSICION = { MCD: 'MDC', MCO: 'MO', PT: 'POR' }

const PIE = { derecha: 'Derecho', izquierda: 'Izquierdo' }

// Palabras que quedan en minúscula al corregir mayúsculas ("de la Fuente")
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y'])

function leerEnv(nombre) {
  const env = {}
  const ruta = new URL(`../${nombre}`, import.meta.url)
  if (!existsSync(ruta)) return env
  for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^([A-Z_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, '$2')
  }
  return env
}

/** CSV con comillas, comas y saltos de línea dentro de los campos */
function parsearCsv(texto) {
  const filas = []
  let fila = []
  let campo = ''
  let enComillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (enComillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"'
        i++
      } else if (c === '"') enComillas = false
      else campo += c
    } else if (c === '"') enComillas = true
    else if (c === ',') {
      fila.push(campo)
      campo = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      fila.push(campo)
      filas.push(fila)
      fila = []
      campo = ''
    } else campo += c
  }
  if (campo || fila.length) filas.push([...fila, campo])
  return filas.filter((f) => f.some((v) => v.trim()))
}

/** Para comparar textos: sin tildes, sin mayúsculas, sin espacios de más */
function clave(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
}

/** "gabriel benjamin " → "Gabriel Benjamin" */
function nombrePropio(texto) {
  return texto
    .trim()
    .split(/\s+/)
    .map((p, i) => (i > 0 && PARTICULAS.has(p.toLowerCase()) ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}

function piePreferido(valor) {
  const lados = [...new Set(valor.split(',').map((v) => PIE[clave(v)]).filter(Boolean))]
  if (lados.length > 1) return 'Ambidiestro'
  return lados[0] ?? null
}

// --- Conexión -----------------------------------------------------------------
const env = { ...leerEnv(prod ? '.env.produccion.local' : '.env.local'), ...process.env }
const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRole) {
  console.error(`Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en ${prod ? '.env.produccion.local' : '.env.local'}`)
  process.exit(1)
}
const supabase = createClient(url, serviceRole, { auth: { persistSession: false } })

const [posiciones, categorias, equipos, existentes] = await Promise.all([
  supabase.from('posiciones').select('id, nombre, abreviatura'),
  supabase.from('categorias').select('id, nombre'),
  supabase.from('equipos').select('id, nombre, categoria_id, temporada, activo'),
  supabase.from('jugadores').select('id, nombre, apellidos'),
])
for (const r of [posiciones, categorias, equipos, existentes]) {
  if (r.error) {
    console.error('Error al leer la base:', r.error.message)
    process.exit(1)
  }
}

const posicionPorSigla = new Map(posiciones.data.map((p) => [clave(p.abreviatura), p]))

/** Equipo activo más reciente de la serie (Primera, Honor, 35) */
function equipoDeSerie(serie) {
  const categoria = categorias.data.find((c) => clave(c.nombre) === clave(serie))
  if (!categoria) return null
  return (
    equipos.data
      .filter((e) => e.categoria_id === categoria.id && e.activo)
      .sort((a, b) => b.temporada.localeCompare(a.temporada))[0] ?? null
  )
}

// --- Lectura del CSV ----------------------------------------------------------
const [cabecera, ...filas] = parsearCsv(readFileSync(archivo, 'utf8').replace(/^﻿/, ''))
const columnas = cabecera.map(clave)
function columna(...nombres) {
  const i = columnas.findIndex((c) => nombres.includes(c))
  if (i === -1) {
    console.error(`El CSV no tiene la columna "${nombres[0]}". Columnas: ${cabecera.join(' | ')}`)
    process.exit(1)
  }
  return i
}
const COL = {
  nombres: columna('nombres'),
  paterno: columna('apellido paterno'),
  materno: columna('apellido materno'),
  pie: columna('pierna habil'),
  posiciones: [columna('posicion preferida'), columna('posicion 2'), columna('posicion 3'), columna('posicion 4')],
  serie: columna('serie'),
}

const yaEnBase = new Set(existentes.data.map((j) => clave(`${j.nombre} ${j.apellidos}`)))
const vistos = new Set()
const plan = []

for (const [n, fila] of filas.entries()) {
  const linea = n + 2
  const nombre = nombrePropio(fila[COL.nombres] ?? '')
  const apellidos = [fila[COL.paterno], fila[COL.materno]].map((a) => nombrePropio(a ?? '')).filter(Boolean).join(' ')
  const completo = `${nombre} ${apellidos}`
  const errores = []

  if (!nombre || !apellidos) errores.push('falta nombre o apellidos')

  const equipo = equipoDeSerie(fila[COL.serie] ?? '')
  if (!equipo) errores.push(`serie desconocida "${fila[COL.serie]}"`)

  const siglas = COL.posiciones.map((i) => (fila[i] ?? '').trim()).filter(Boolean)
  const ids = []
  for (const sigla of siglas) {
    const posicion = posicionPorSigla.get(clave(ALIAS_POSICION[sigla.toUpperCase()] ?? sigla))
    if (!posicion) errores.push(`posición desconocida "${sigla}"`)
    else if (!ids.includes(posicion.id)) ids.push(posicion.id)
  }
  if (siglas.length === 0) errores.push('sin posiciones')

  const k = clave(completo)
  let estado = 'nuevo'
  if (errores.length) estado = 'error'
  else if (yaEnBase.has(k)) estado = 'ya existe'
  else if (vistos.has(k)) estado = 'repetido en el CSV'
  vistos.add(k)

  plan.push({
    linea,
    estado,
    detalle: errores.join('; '),
    jugador: {
      nombre,
      apellidos,
      equipo_id: equipo?.id,
      posicion_id: ids[0],
      pie_preferido: piePreferido(fila[COL.pie] ?? ''),
      nacionalidad: 'Chile',
    },
    serie: equipo?.nombre,
    posiciones: ids.map((id) => posiciones.data.find((p) => p.id === id).abreviatura),
    ids,
  })
}

// --- Resumen ------------------------------------------------------------------
console.log(`\nBase: ${prod ? 'PRODUCCIÓN' : 'local'} (${new URL(url).host})${aplicar ? '' : ' — simulación, no se escribe nada'}\n`)
console.table(
  plan.map((p) => ({
    fila: p.linea,
    estado: p.estado,
    jugador: `${p.jugador.nombre} ${p.jugador.apellidos}`,
    serie: p.serie ?? '',
    posiciones: p.posiciones.join(', '),
    pie: p.jugador.pie_preferido ?? '',
    detalle: p.detalle,
  }))
)

const nuevos = plan.filter((p) => p.estado === 'nuevo')
const conError = plan.filter((p) => p.estado === 'error')
console.log(`${nuevos.length} nuevos, ${plan.length - nuevos.length - conError.length} saltados, ${conError.length} con error`)

if (!aplicar && nuevos.length) console.log(`\nPara importarlos: agregar --aplicar${prod ? '' : ' (y --prod para producción)'}`)

// --- Importación --------------------------------------------------------------
// process.exitCode en vez de process.exit: en Windows, salir con las
// conexiones de supabase abiertas revienta node (assertion en libuv)
let fallos = 0
for (const p of aplicar ? nuevos : []) {
  const nombre = `${p.jugador.nombre} ${p.jugador.apellidos}`
  const { data, error } = await supabase.from('jugadores').insert(p.jugador).select('id').single()
  if (error) {
    fallos++
    console.error(`✗ ${nombre}: ${error.message}`)
    continue
  }
  const { error: errorPos } = await supabase
    .from('jugador_posiciones')
    .insert(p.ids.map((posicion_id, orden) => ({ jugador_id: data.id, posicion_id, orden })))
  if (errorPos) {
    fallos++
    console.error(`✗ ${nombre}: creado (id ${data.id}) pero sin posiciones secundarias: ${errorPos.message}`)
    continue
  }
  console.log(`✓ ${nombre}`)
}

if (aplicar) console.log(`\n${nuevos.length - fallos} importados, ${fallos} fallidos`)
process.exitCode = fallos || conError.length ? 1 : 0
