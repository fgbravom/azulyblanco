import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import nextConfig from '@/next.config.mjs'

describe('cabeceras de seguridad (next.config.mjs)', async () => {
  const reglas = await nextConfig.headers()
  const global = reglas.find((r: { source: string }) => r.source === '/:path*')
  const cabeceras = Object.fromEntries(
    (global?.headers ?? []).map((h: { key: string; value: string }) => [h.key.toLowerCase(), h.value])
  )

  it('se aplican a todas las rutas', () => {
    expect(global).toBeDefined()
  })

  it.each([
    ['x-frame-options', 'DENY'],
    ['content-security-policy', "frame-ancestors 'none'"],
    ['x-content-type-options', 'nosniff'],
    ['referrer-policy', 'strict-origin-when-cross-origin'],
  ])('%s: %s', (clave, valor) => {
    expect(cabeceras[clave]).toBe(valor)
  })

  it('HSTS de al menos un año', () => {
    const maxAge = Number(cabeceras['strict-transport-security']?.match(/max-age=(\d+)/)?.[1])
    expect(maxAge).toBeGreaterThanOrEqual(31536000)
  })

  it('las imágenes remotas solo vienen del storage público de Supabase', () => {
    for (const patron of nextConfig.images.remotePatterns) {
      expect(patron.pathname).toBe('/storage/v1/object/public/**')
    }
  })
})

describe('Supabase local (supabase/config.toml)', () => {
  const toml = readFileSync(path.join(process.cwd(), 'supabase', 'config.toml'), 'utf8')
  const auth = toml.split(/^\[auth\]\s*$/m)[1]?.split(/^\[/m)[0] ?? ''

  it('no permite registrarse: el sitio no usa Supabase Auth', () => {
    expect(auth).toMatch(/^enable_signup = false$/m)
  })

  it('no permite inicios de sesión anónimos', () => {
    expect(auth).toMatch(/^enable_anonymous_sign_ins = false$/m)
  })
})

describe('secretos fuera del repositorio', () => {
  const raiz = path.join(process.cwd(), '..')
  const gitignore = readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8')
  const gitignoreRaiz = readFileSync(path.join(raiz, '.gitignore'), 'utf8')

  it('git ignora los .env y los datos privados', () => {
    expect(gitignore).toMatch(/^\.env\*$/m)
    expect(gitignoreRaiz).toMatch(/^database\/privado\/$/m)
  })

  it('la documentación no publica la contraseña del admin', () => {
    for (const doc of ['README.md', 'Docs/README.md', 'Docs/ADMIN.md']) {
      expect(readFileSync(path.join(raiz, doc), 'utf8'), doc).not.toMatch(/Contraseña[^\n]*asd123/i)
    }
  })
})
