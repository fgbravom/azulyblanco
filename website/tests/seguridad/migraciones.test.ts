import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guardianes del esquema: leen las migraciones en orden y fallan si un
 * cambio futuro vuelve a exponer datos personales a la clave pública.
 */

const DIR = path.join(process.cwd(), 'supabase', 'migrations')
const archivos = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort()
const sql = archivos.map((f) => readFileSync(path.join(DIR, f), 'utf8')).join('\n')
// Sin comentarios, para que una línea comentada no cuente como SQL activo
const activo = sql.replace(/--.*$/gm, '')

const SENSIBLES = [
  'dni', 'email', 'telefono', 'direccion', 'fecha_nacimiento', 'edad', 'tipo_sangre', 'contacto_emergencia',
  'telefono_emergencia', 'alergias', 'lesiones_cronicas', 'peso_kg', 'altura_cm', 'codigo_cuotas', 'cuota_condicion',
]

function ultimaDefinicion(vista: string) {
  const definiciones = [...activo.matchAll(new RegExp(`CREATE (?:OR REPLACE )?VIEW ${vista} AS\\s+SELECT([\\s\\S]*?)\\bFROM\\b([\\s\\S]*?);`, 'gi'))]
  expect(definiciones.length, `no se encontró la vista ${vista}`).toBeGreaterThan(0)
  const [, columnas, resto] = definiciones.at(-1)!
  return { columnas: columnas.split(',').map((c) => c.trim().toLowerCase()), resto }
}

describe('vista_plantel_publico (la única vista de jugadores para la clave pública)', () => {
  const { columnas, resto } = ultimaDefinicion('vista_plantel_publico')

  it('no incluye columnas con datos personales ni un comodín', () => {
    for (const col of columnas) {
      expect(SENSIBLES, `columna sensible: ${col}`).not.toContain(col)
      expect(col).not.toMatch(/\*/)
    }
  })

  it('solo muestra jugadores activos', () => {
    expect(resto).toMatch(/WHERE\s+activo/i)
  })
})

describe('permisos de la clave pública', () => {
  it('toda tabla creada tiene RLS activado', () => {
    const tablas = [...activo.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/gi)].map((m) => m[1])
    expect(tablas.length).toBeGreaterThan(5)
    for (const tabla of tablas) {
      expect(activo, `${tabla} sin RLS`).toMatch(new RegExp(`ALTER TABLE ${tabla} ENABLE ROW LEVEL SECURITY`, 'i'))
    }
  })

  it('jugadores, cuotas, pagos y login_intentos no tienen políticas de lectura', () => {
    for (const tabla of ['jugadores', 'cuotas', 'pagos', 'login_intentos', 'jugador_posiciones', 'medios']) {
      const politicas = [...activo.matchAll(new RegExp(`CREATE POLICY "[^"]+" ON ${tabla}\\b[\\s\\S]*?;`, 'gi'))]
        .map((m) => m[0])
        // Las de migraciones anteriores a la 003 se borran después
        .filter((p) => !p.includes('auth.role()') && !/Lectura pública de jugadores/.test(p))
      expect(politicas, tabla).toEqual([])
    }
  })

  it('cuentas_redactores y noticias_despublicaciones tienen RLS y ninguna política (solo service_role)', () => {
    for (const tabla of ['cuentas_redactores', 'noticias_despublicaciones']) {
      expect(activo, `${tabla} sin RLS`).toMatch(new RegExp(`ALTER TABLE ${tabla} ENABLE ROW LEVEL SECURITY`, 'i'))
      expect(activo, `${tabla} con política`).not.toMatch(new RegExp(`CREATE POLICY "[^"]+" ON ${tabla}\\b`, 'i'))
    }
  })

  it('las vistas internas quedan fuera del alcance de anon y authenticated', () => {
    for (const vista of ['vista_jugadores_completa', 'vista_cuotas', 'vista_estadisticas_jugador', 'vista_partidos_completa']) {
      expect(activo, vista).toMatch(new RegExp(`REVOKE ALL ON ${vista} FROM anon, authenticated`, 'i'))
    }
  })

  it('solo vista_plantel_publico se concede a anon', () => {
    const concedidas = [...activo.matchAll(/GRANT SELECT ON (\w+) TO anon/gi)].map((m) => m[1])
    expect(new Set(concedidas)).toEqual(new Set(['vista_plantel_publico']))
  })

  it('equipos se lee por columnas y sin los datos de pago', () => {
    const grant = activo.match(/GRANT SELECT \(([\s\S]*?)\) ON equipos TO anon/i)
    expect(grant).not.toBeNull()
    expect(grant![1]).not.toMatch(/cuota/)
    expect(activo).toMatch(/REVOKE SELECT ON equipos FROM anon, authenticated/i)
  })

  it('la migración 005 borra toda política de escritura o que dependa de estar autenticado', () => {
    const m005 = readFileSync(path.join(DIR, archivos.find((f) => f.includes('_seguridad'))!), 'utf8')
    expect(m005).toMatch(/cmd <> 'SELECT'/)
    expect(m005).toMatch(/'authenticated' = ANY \(roles\)/)
    expect(m005).toMatch(/DROP POLICY/)
  })

  it('después de la 005 ninguna migración vuelve a crear políticas de escritura', () => {
    const indice = archivos.findIndex((f) => f.includes('_seguridad'))
    for (const f of archivos.slice(indice + 1)) {
      const contenido = readFileSync(path.join(DIR, f), 'utf8').replace(/--.*$/gm, '')
      expect(contenido, f).not.toMatch(/CREATE POLICY[\s\S]*?FOR (INSERT|UPDATE|DELETE|ALL)/i)
      expect(contenido, f).not.toMatch(/TO (anon|authenticated)[\s\S]*?WITH CHECK/i)
    }
  })
})
