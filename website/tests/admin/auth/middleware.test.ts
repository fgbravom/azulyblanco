import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { config, middleware } from '@/middleware'
import { SESSION_COOKIE, firmarToken } from '@/lib/auth/token'

async function pedir(ruta: string, token?: string) {
  const req = new NextRequest(`https://azulyblanco.com${ruta}`)
  if (token) req.cookies.set(SESSION_COOKIE, token)
  return middleware(req)
}

// NextResponse.next() marca la respuesta con este encabezado
const dejaPasar = (res: Response) => res.headers.get('x-middleware-next') === '1'

describe('middleware', () => {
  it('cubre /admin y /api', () => {
    expect(config.matcher).toEqual(['/admin/:path*', '/api/:path*'])
  })

  it('sin sesión redirige el panel al login', async () => {
    for (const ruta of ['/admin', '/admin/jugadores', '/admin/cuotas']) {
      const res = await pedir(ruta)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('https://azulyblanco.com/admin/login')
    }
  })

  it('sin sesión las APIs responden 401 en JSON, sin redirigir', async () => {
    for (const ruta of ['/api/jugadores', '/api/jugadores/1', '/api/equipos', '/api/estadisticas']) {
      const res = await pedir(ruta)
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'No autorizado' })
    }
  })

  it('deja abiertos el login y las rutas de autenticación', async () => {
    expect(dejaPasar(await pedir('/admin/login'))).toBe(true)
    expect(dejaPasar(await pedir('/api/auth/login'))).toBe(true)
    expect(dejaPasar(await pedir('/api/auth/logout'))).toBe(true)
  })

  it('con sesión válida deja pasar al panel y a las APIs', async () => {
    const token = await firmarToken(process.env.SESSION_SECRET!)
    expect(dejaPasar(await pedir('/admin/jugadores', token))).toBe(true)
    expect(dejaPasar(await pedir('/api/jugadores', token))).toBe(true)
  })

  it('rechaza una cookie firmada con otro secreto', async () => {
    const falsa = await firmarToken('secreto-adivinado')
    expect((await pedir('/api/jugadores', falsa)).status).toBe(401)
  })

  it('una ruta parecida a /admin/login no queda abierta', async () => {
    expect((await pedir('/admin/login-falso')).status).toBe(307)
    expect((await pedir('/api/authx/jugadores')).status).toBe(401)
  })
})
