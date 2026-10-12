/**
 * Importa jugadores desde el CSV que exporta la base de Notion del formulario
 * de inscripción. Lo mismo se puede hacer desde el admin (Plantel → Importar
 * CSV); la lógica es la de lib/jugadores/importar-csv.ts.
 *
 *   node scripts/importar-jugadores.mjs <archivo.csv>                  → muestra qué haría en local
 *   node scripts/importar-jugadores.mjs <archivo.csv> --aplicar        → importa en local
 *   node scripts/importar-jugadores.mjs <archivo.csv> --prod --aplicar → importa en producción
 *
 * Sin --aplicar no escribe nada. Usa la service_role de .env.local o, con
 * --prod, de .env.produccion.local. Necesita Node 22.18+ (carga el .ts directo).
 */
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { cargarDatosReferencia, planificarImportacion } from '../lib/jugadores/importar-csv.ts'

const args = process.argv.slice(2)
const archivo = args.find((a) => !a.startsWith('--'))
const aplicar = args.includes('--aplicar')
const prod = args.includes('--prod')

if (!archivo || !existsSync(archivo)) {
  console.error('Uso: node scripts/importar-jugadores.mjs <archivo.csv> [--prod] [--aplicar]')
  process.exit(1)
}

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

// --- Conexión -----------------------------------------------------------------
const env = { ...leerEnv(prod ? '.env.produccion.local' : '.env.local'), ...process.env }
const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRole) {
  console.error(`Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en ${prod ? '.env.produccion.local' : '.env.local'}`)
  process.exit(1)
}
const supabase = createClient(url, serviceRole, { auth: { persistSession: false } })

let plan
try {
  plan = planificarImportacion(readFileSync(archivo, 'utf8'), await cargarDatosReferencia(supabase))
} catch (error) {
  console.error(error.message)
  process.exit(1)
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
    detalle: p.detalle || p.cambios.join('; '),
  }))
)

const nuevos = plan.filter((p) => p.estado === 'nuevo')
const cambiados = plan.filter((p) => p.estado === 'actualizar')
const conError = plan.filter((p) => p.estado === 'error')
const sinCambios = plan.length - nuevos.length - cambiados.length - conError.length
console.log(`${nuevos.length} nuevos, ${cambiados.length} con cambios, ${sinCambios} sin cambios, ${conError.length} con error`)

if (!aplicar && nuevos.length + cambiados.length) {
  console.log(`\nPara aplicarlo: agregar --aplicar${prod ? '' : ' (y --prod para producción)'}`)
}

/** Reemplaza las posiciones; la primera se copia a jugadores.posicion_id */
async function guardarPosiciones(id, ids) {
  const borrado = await supabase.from('jugador_posiciones').delete().eq('jugador_id', id)
  if (borrado.error) return borrado.error
  const alta = await supabase
    .from('jugador_posiciones')
    .insert(ids.map((posicion_id, orden) => ({ jugador_id: id, posicion_id, orden })))
  if (alta.error) return alta.error
  return (await supabase.from('jugadores').update({ posicion_id: ids[0] }).eq('id', id)).error
}

// --- Importación --------------------------------------------------------------
// process.exitCode en vez de process.exit: en Windows, salir con las
// conexiones de supabase abiertas revienta node (assertion en libuv)
let fallos = 0
for (const p of aplicar ? cambiados : []) {
  const nombre = `${p.jugador.nombre} ${p.jugador.apellidos}`
  const { campos, posicionesIds } = p.actualizacion
  const error =
    (Object.keys(campos).length && (await supabase.from('jugadores').update(campos).eq('id', p.jugadorId)).error) ||
    (posicionesIds && (await guardarPosiciones(p.jugadorId, posicionesIds)))
  if (error) {
    fallos++
    console.error(`✗ ${nombre}: ${error.message}`)
    continue
  }
  console.log(`↻ ${nombre}`)
}
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
    .insert(p.posicionesIds.map((posicion_id, orden) => ({ jugador_id: data.id, posicion_id, orden })))
  if (errorPos) {
    fallos++
    console.error(`✗ ${nombre}: creado (id ${data.id}) pero sin posiciones secundarias: ${errorPos.message}`)
    continue
  }
  console.log(`✓ ${nombre}`)
}

if (aplicar) console.log(`\n${nuevos.length + cambiados.length - fallos} guardados, ${fallos} fallidos`)
process.exitCode = fallos || conError.length ? 1 : 0
