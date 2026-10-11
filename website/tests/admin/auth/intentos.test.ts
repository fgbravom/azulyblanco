import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { argsDe, crearSupabaseFalso, type Responder } from '../../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { ipDe, limpiarIntentos, loginBloqueado, registrarFallo } = await import('@/lib/auth/intentos')

function conBase(responder?: Responder) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

function peticion(headers: Record<string, string>) {
  return new NextRequest('https://azulyblanco.com/api/auth/login', { method: 'POST', headers })
}

describe('ipDe', () => {
  it('prefiere x-real-ip', () => {
    expect(ipDe(peticion({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }))).toBe('1.1.1.1')
  })

  it('usa la primera IP de x-forwarded-for', () => {
    expect(ipDe(peticion({ 'x-forwarded-for': '3.3.3.3, 10.0.0.1' }))).toBe('3.3.3.3')
  })

  it('sin cabeceras devuelve un valor fijo (todas comparten el mismo contador)', () => {
    expect(ipDe(peticion({}))).toBe('desconocida')
  })
})

describe('loginBloqueado', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') })
    return () => vi.useRealTimers()
  })

  it('no bloquea con menos de 10 fallos', async () => {
    conBase(() => ({ count: 9 }))
    expect(await loginBloqueado('1.1.1.1')).toBe(false)
  })

  it('bloquea desde el fallo número 10', async () => {
    conBase(() => ({ count: 10 }))
    expect(await loginBloqueado('1.1.1.1')).toBe(true)
  })

  it('cuenta solo los fallos de esa IP en los últimos 15 minutos', async () => {
    const base = conBase(() => ({ count: 0 }))
    await loginBloqueado('1.1.1.1')
    const [consulta] = base.a('login_intentos')
    expect(argsDe(consulta, 'eq')).toEqual(['ip', '1.1.1.1'])
    expect(argsDe(consulta, 'gte')).toEqual(['created_at', '2026-10-11T11:45:00.000Z'])
  })

  it('si la tabla no existe (migración pendiente) no bloquea, para no cerrar el admin', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    conBase(() => ({ error: { message: 'relation "login_intentos" does not exist' } }))
    expect(await loginBloqueado('1.1.1.1')).toBe(false)
  })
})

describe('registrarFallo y limpiarIntentos', () => {
  it('registrarFallo guarda la IP y borra lo que ya no cuenta', async () => {
    const base = conBase()
    await registrarFallo('1.1.1.1')
    const [insercion, limpieza] = base.a('login_intentos')
    expect(argsDe(insercion, 'insert')).toEqual([{ ip: '1.1.1.1' }])
    expect(argsDe(limpieza, 'delete')).toEqual([])
    expect(argsDe(limpieza, 'lt')?.[0]).toBe('created_at')
  })

  it('limpiarIntentos borra solo los de esa IP', async () => {
    const base = conBase()
    await limpiarIntentos('1.1.1.1')
    expect(argsDe(base.a('login_intentos')[0], 'eq')).toEqual(['ip', '1.1.1.1'])
  })
})
