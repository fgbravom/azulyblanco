import { afterEach, describe, expect, it, vi } from 'vitest'
import { SESSION_MAX_AGE, firmarToken, verificarToken } from '@/lib/auth/token'

const SECRETO = 'secreto-de-prueba'
const ID = '11111111-2222-4333-8444-555555555555'
const ADMIN = { rol: 'admin', cuentaId: ID, version: 0 } as const
const COLABORADOR = { rol: 'colaborador', cuentaId: ID, version: 3 } as const

describe('token de sesión', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('devuelve rol, cuenta y versión de un token de administrador recién firmado', async () => {
    const token = await firmarToken(SECRETO, ADMIN)
    expect(await verificarToken(token, SECRETO)).toEqual(ADMIN)
  })

  it('devuelve rol, cuenta y versión de un token de colaborador', async () => {
    const token = await firmarToken(SECRETO, COLABORADOR)
    expect(await verificarToken(token, SECRETO)).toEqual(COLABORADOR)
  })

  it('tiene la forma "<letra>.<cuentaId>.<version>.<expira_ms>.<firma>" y vence en SESSION_MAX_AGE', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') })
    const [letra, id, version, expira, firma] = (await firmarToken(SECRETO, ADMIN)).split('.')
    expect([letra, id, version]).toEqual(['a', ID, '0'])
    expect(Number(expira)).toBe(Date.now() + SESSION_MAX_AGE * 1000)
    expect(firma).toMatch(/^[A-Za-z0-9_-]+$/)
    expect((await firmarToken(SECRETO, COLABORADOR)).split('.').slice(0, 3)).toEqual(['c', ID, '3'])
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
    const [letra, id, version, expira, firma] = (await firmarToken(SECRETO, ADMIN)).split('.')
    const alargado = [letra, id, version, Number(expira) + 1_000_000_000, firma].join('.')
    expect(await verificarToken(alargado, SECRETO)).toBeNull()
  })

  it('rechaza un token de colaborador con la letra, la cuenta o la versión alteradas', async () => {
    const [, id, version, expira, firma] = (await firmarToken(SECRETO, COLABORADOR)).split('.')
    // Subirse a administrador con la firma de un colaborador
    expect(await verificarToken(['a', id, version, expira, firma].join('.'), SECRETO)).toBeNull()
    expect(await verificarToken(['c', ID.replace('1111', '9999'), version, expira, firma].join('.'), SECRETO)).toBeNull()
    expect(await verificarToken(['c', id, '4', expira, firma].join('.'), SECRETO)).toBeNull()
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
    ['sin firma', `a.${ID}.0.99999999999999.`],
    ['con letra desconocida', `x.${ID}.0.99999999999999.firma`],
    ['con cuenta que no es UUID', 'a.no-es-uuid.0.99999999999999.firma'],
    ['con versión negativa', `c.${ID}.-1.99999999999999.firma`],
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
