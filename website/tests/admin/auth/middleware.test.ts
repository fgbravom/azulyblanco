import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { config, middleware } from '@/middleware'
import { SESSION_COOKIE, firmarToken } from '@/lib/auth/token'
import { REDACTOR_ID } from '../../helpers/sesion'

async function pedir(ruta: string, token?: string) {
  const req = new NextRequest(`https://azulyblanco.com${ruta}`)
  if (token) req.cookies.set(SESSION_COOKIE, token)
  return middleware(req)
}

// NextResponse.next() marca la respuesta con este encabezado
const dejaPasar = (res: Response) => res.headers.get('x-middleware-next') === '1'

const tokenAdmin = () => firmarToken(process.env.SESSION_SECRET!, { rol: 'admin' })
const tokenRedactor = () =>
  firmarToken(process.env.SESSION_SECRET!, { rol: 'redactor', redactorId: REDACTOR_ID, version: 0 })

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
    const token = await tokenAdmin()
    expect(dejaPasar(await pedir('/admin/jugadores', token))).toBe(true)
    expect(dejaPasar(await pedir('/api/jugadores', token))).toBe(true)
  })

  it('rechaza una cookie firmada con otro secreto', async () => {
    const falsa = await firmarToken('secreto-adivinado', { rol: 'admin' })
    expect((await pedir('/api/jugadores', falsa)).status).toBe(401)
  })

  it('una ruta parecida a /admin/login no queda abierta', async () => {
    expect((await pedir('/admin/login-falso')).status).toBe(307)
    expect((await pedir('/api/authx/jugadores')).status).toBe(401)
  })

  it('rechaza un token del formato anterior, sin rol', async () => {
    const [, , , expira, firma] = (await tokenAdmin()).split('.')
    expect((await pedir('/api/jugadores', `${expira}.${firma}`)).status).toBe(401)
    expect((await pedir('/admin', `${expira}.${firma}`)).status).toBe(307)
  })

  describe('con sesión de redactor', () => {
    it('deja pasar noticias y su cuenta', async () => {
      const token = await tokenRedactor()
      for (const ruta of ['/admin/noticias', '/admin/noticias/nueva', '/admin/noticias/abc/editar', '/admin/cuenta']) {
        expect(dejaPasar(await pedir(ruta, token)), ruta).toBe(true)
      }
    })

    it('redirige a /admin/noticias cualquier otra ruta del panel', async () => {
      const token = await tokenRedactor()
      for (const ruta of ['/admin', '/admin/jugadores', '/admin/redactores', '/admin/noticiasx', '/admin/cuenta-falsa']) {
        const res = await pedir(ruta, token)
        expect(res.status, ruta).toBe(307)
        expect(res.headers.get('location')).toBe('https://azulyblanco.com/admin/noticias')
      }
    })

    it('responde 401 en toda la /api', async () => {
      const token = await tokenRedactor()
      for (const ruta of ['/api/jugadores', '/api/equipos', '/api/estadisticas']) {
        const res = await pedir(ruta, token)
        expect(res.status).toBe(401)
        expect(await res.json()).toEqual({ error: 'No autorizado' })
      }
    })

    it('el login y logout siguen abiertos', async () => {
      const token = await tokenRedactor()
      expect(dejaPasar(await pedir('/admin/login', token))).toBe(true)
      expect(dejaPasar(await pedir('/api/auth/logout', token))).toBe(true)
    })
  })
})
