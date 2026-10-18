import { afterEach, describe, expect, it, vi } from 'vitest'
import { SESSION_MAX_AGE, firmarToken, verificarToken } from '@/lib/auth/token'

const SECRETO = 'secreto-de-prueba'
const ID = '11111111-2222-4333-8444-555555555555'
const ADMIN = { rol: 'admin' } as const
const REDACTOR = { rol: 'redactor', redactorId: ID, version: 3 } as const

describe('token de sesión', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('devuelve los datos de un token de admin recién firmado', async () => {
    const token = await firmarToken(SECRETO, ADMIN)
    expect(await verificarToken(token, SECRETO)).toEqual(ADMIN)
  })

  it('devuelve rol, redactor y versión de un token de redactor', async () => {
    const token = await firmarToken(SECRETO, REDACTOR)
    expect(await verificarToken(token, SECRETO)).toEqual(REDACTOR)
  })

  it('tiene la forma "<rol>.<id|->.<version>.<expira_ms>.<firma>" y vence en SESSION_MAX_AGE', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') })
    const [rol, id, version, expira, firma] = (await firmarToken(SECRETO, ADMIN)).split('.')
    expect([rol, id, version]).toEqual(['a', '-', '0'])
    expect(Number(expira)).toBe(Date.now() + SESSION_MAX_AGE * 1000)
    expect(firma).toMatch(/^[A-Za-z0-9_-]+$/)
    expect((await firmarToken(SECRETO, REDACTOR)).split('.').slice(0, 3)).toEqual(['r', ID, '3'])
  })

  it('rechaza un token del formato anterior "<expira>.<firma>"', async () => {
    const [, , , expira, firma] = (await firmarToken(SECRETO, ADMIN)).split('.')
    expect(await verificarToken(`${expira}.${firma}`, SECRETO)).toBeNull()
  })

  it('rechaza un token firmado con otro secreto', async () => {
    const token = await firmarToken('otro-secreto', ADMIN)
    expect(await verificarToken(token, SECRETO)).toBeNull()
  })

  it('rechaza un token con la expiración alterada (la firma ya no calza)', async () => {
    const [rol, id, version, expira, firma] = (await firmarToken(SECRETO, ADMIN)).split('.')
    const alargado = [rol, id, version, Number(expira) + 1_000_000_000, firma].join('.')
    expect(await verificarToken(alargado, SECRETO)).toBeNull()
  })

  it('rechaza un token de redactor con el rol, el id o la versión alterados', async () => {
    const [, id, version, expira, firma] = (await firmarToken(SECRETO, REDACTOR)).split('.')
    // Subirse a admin con la firma de un redactor
    expect(await verificarToken(['a', '-', '0', expira, firma].join('.'), SECRETO)).toBeNull()
    expect(await verificarToken(['r', ID.replace('1111', '9999'), version, expira, firma].join('.'), SECRETO)).toBeNull()
    expect(await verificarToken(['r', id, '4', expira, firma].join('.'), SECRETO)).toBeNull()
  })

  it('rechaza un token con la firma alterada', async () => {
    const token = await firmarToken(SECRETO, ADMIN)
    const ultimo = token.at(-1) === 'A' ? 'B' : 'A'
    expect(await verificarToken(token.slice(0, -1) + ultimo, SECRETO)).toBeNull()
  })

  it('rechaza un token vencido', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') })
    const token = await firmarToken(SECRETO, ADMIN)
    vi.setSystemTime(Date.now() + SESSION_MAX_AGE * 1000 + 1)
    expect(await verificarToken(token, SECRETO)).toBeNull()
  })

  it.each([
    ['sin token', undefined],
    ['vacío', ''],
    ['sin punto', 'abc'],
    ['sin firma', 'a.-.0.99999999999999.'],
    ['con rol desconocido', 'x.-.0.99999999999999.firma'],
    ['de redactor con id que no es UUID', 'r.no-es-uuid.0.99999999999999.firma'],
    ['de redactor con versión negativa', `r.${ID}.-1.99999999999999.firma`],
    ['basura', 'no.es.un.token'],
  ])('rechaza un token %s', async (_caso, token) => {
    expect(await verificarToken(token, SECRETO)).toBeNull()
  })

  it('rechaza todo si no hay secreto configurado', async () => {
    const token = await firmarToken(SECRETO, ADMIN)
    expect(await verificarToken(token, undefined)).toBeNull()
    expect(await verificarToken(token, '')).toBeNull()
  })
})
