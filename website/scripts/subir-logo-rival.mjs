// Sube el logo de un rival a la base Supabase local (bucket "medios") y actualiza su logo_url.
//
//   node scripts/subir-logo-rival.mjs <ruta-archivo> <sigla-o-nombre-del-rival>
//   node scripts/subir-logo-rival.mjs "%USERPROFILE%\Downloads\sanmartin.webp" SM
//
// Usa las claves de .env.local (Supabase local en Docker, puerto 54321).
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { extname, basename } from 'node:path'
import { randomUUID } from 'node:crypto'

const [ruta, busqueda] = process.argv.slice(2)
if (!ruta || !busqueda) {
  console.error('Uso: node scripts/subir-logo-rival.mjs <ruta-archivo> <sigla-o-nombre>')
  process.exit(1)
}

const archivo = ruta.startsWith('~/')
  ? process.env.USERPROFILE + ruta.slice(1).replace(/\//g, '\\')
  : ruta
if (!existsSync(archivo)) {
  console.error('No existe el archivo:', archivo)
  process.exit(1)
}

// Lee .env.local (Next.js no lo carga fuera del server)
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const ext = extname(basename(archivo)).slice(1).toLowerCase()
const tipos = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' }
if (!tipos[ext]) {
  console.error('Formato no soportado:', ext)
  process.exit(1)
}

const morir = (contexto, error) => {
  console.error(`${contexto}:`, error.message)
  process.exit(1)
}

// 1. Busca el rival por sigla o por nombre
const { data: rivales, error: eBusca } = await supabase
  .from('rivales')
  .select('id, nombre, sigla, logo_url')
  .or(`sigla.ilike."${busqueda}",nombre.ilike."*${busqueda}*"`)
if (eBusca) morir('Buscando rival', eBusca)

if (!rivales?.length) {
  const { data: todos } = await supabase.from('rivales').select('sigla, nombre')
  console.error('No encontré ningún rival con:', busqueda)
  console.error('Disponibles:', todos?.map((r) => `${r.sigla} (${r.nombre})`).join(', ') ?? '-')
  process.exit(1)
}
if (rivales.length > 1) {
  console.error('Coinciden varios rivales, sé más específico:', rivales.map((r) => r.sigla).join(', '))
  process.exit(1)
}
const rival = rivales[0]

// 2. Sube la imagen a rivales/<uuid>.<ext>
const clave = `rivales/${randomUUID()}.${ext}`
const { error: eSube } = await supabase.storage
  .from('medios')
  .upload(clave, readFileSync(archivo), { contentType: tipos[ext], upsert: false })
if (eSube) morir('Subiendo imagen', eSube)

const { data: pub } = supabase.storage.from('medios').getPublicUrl(clave)

// 3. Actualiza el rival
const { error: eUpdate } = await supabase
  .from('rivales')
  .update({ logo_url: pub.publicUrl })
  .eq('id', rival.id)
if (eUpdate) morir('Actualizando rival', eUpdate)

// 4. Borra el logo anterior si estaba en la carpeta rivales/
const anterior = rival.logo_url?.split('/object/public/medios/')[1]
if (anterior?.startsWith('rivales/')) {
  await supabase.storage.from('medios').remove([anterior])
}

console.log(`OK · ${rival.nombre} (${rival.sigla})`)
console.log('  antes:', rival.logo_url ?? '(sin logo)')
console.log('  ahora:', pub.publicUrl)
