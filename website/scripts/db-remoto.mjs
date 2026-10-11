/**
 * Corre un comando de la CLI de Supabase contra la base de producción.
 *
 *   npm run db:pendientes
 *   npm run db:push
 *   npm run db:reparar -- --status applied <versión>...
 *
 * Usa --db-url en vez de `supabase link`: en este proyecto el link falla al
 * crear su usuario temporal (cli_login_postgres, "permission denied to alter
 * role"). La URL sale de SUPABASE_DB_URL, o de esa línea en
 * .env.produccion.local (ignorado por git). Ver Docs/ADMIN.md#migraciones.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

function leerUrl() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL.trim()

  const archivo = new URL('../.env.produccion.local', import.meta.url)
  if (!existsSync(archivo)) return null
  const linea = readFileSync(archivo, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('SUPABASE_DB_URL='))
  return linea ? linea.slice('SUPABASE_DB_URL='.length).trim().replace(/^(["'])(.*)\1$/, '$2') : null
}

/**
 * Codifica la contraseña de la URL: con # $ @ / ? % sin codificar la CLI no
 * puede leerla. Si ya venía codificada, queda igual.
 */
function codificarClave(url) {
  const m = url.match(/^(postgres(?:ql)?:\/\/[^:/@]+:)(.*)@([^@]+)$/)
  if (!m) return url
  let clave = m[2]
  try {
    clave = decodeURIComponent(clave)
  } catch {
    // Tenía un % suelto: no estaba codificada
  }
  return `${m[1]}${encodeURIComponent(clave)}@${m[3]}`
}

const url = leerUrl() && codificarClave(leerUrl())
if (!url) {
  console.error(
    'Falta SUPABASE_DB_URL en website/.env.produccion.local.\n' +
      'Cópiala de Supabase → Connect → Session pooler y reemplaza [YOUR-PASSWORD].'
  )
  process.exit(1)
}

// npx sin shell: en Windows un shell rompería los % y & de la URL
if (!process.env.npm_execpath) {
  console.error('Córrelo con npm run (db:pendientes, db:push, db:reparar).')
  process.exit(1)
}
const npx = path.join(path.dirname(process.env.npm_execpath), 'npx-cli.js')

const { status } = spawnSync(process.execPath, [npx, '-y', 'supabase@2', ...process.argv.slice(2), '--db-url', url], {
  stdio: 'inherit',
})
process.exit(status ?? 1)
