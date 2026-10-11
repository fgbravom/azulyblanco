import { afterEach, describe, expect, it, vi } from 'vitest'
import { SESSION_MAX_AGE, firmarToken, verificarToken } from '@/lib/auth/token'

const SECRETO = 'secreto-de-prueba'

describe('token de sesión', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('acepta un token recién firmado con el mismo secreto', async () => {
    const token = await firmarToken(SECRETO)
    expect(await verificarToken(token, SECRETO)).toBe(true)
  })

  it('tiene la forma "<expira_ms>.<firma>" y vence en SESSION_MAX_AGE', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') })
    const [expira, firma] = (await firmarToken(SECRETO)).split('.')
    expect(Number(expira)).toBe(Date.now() + SESSION_MAX_AGE * 1000)
    expect(firma).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('rechaza un token firmado con otro secreto', async () => {
    const token = await firmarToken('otro-secreto')
    expect(await verificarToken(token, SECRETO)).toBe(false)
  })

  it('rechaza un token con la expiración alterada (la firma ya no calza)', async () => {
    const [expira, firma] = (await firmarToken(SECRETO)).split('.')
    const alargado = `${Number(expira) + 1_000_000_000}.${firma}`
    expect(await verificarToken(alargado, SECRETO)).toBe(false)
  })

  it('rechaza un token con la firma alterada', async () => {
    const token = await firmarToken(SECRETO)
    const ultimo = token.at(-1) === 'A' ? 'B' : 'A'
    expect(await verificarToken(token.slice(0, -1) + ultimo, SECRETO)).toBe(false)
  })

  it('rechaza un token vencido', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-11T12:00:00Z') })
    const token = await firmarToken(SECRETO)
    vi.setSystemTime(Date.now() + SESSION_MAX_AGE * 1000 + 1)
    expect(await verificarToken(token, SECRETO)).toBe(false)
  })

  it.each([
    ['sin token', undefined],
    ['vacío', ''],
    ['sin punto', 'abc'],
    ['sin firma', '99999999999999.'],
    ['basura', 'no.es.un.token'],
  ])('rechaza un token %s', async (_caso, token) => {
    expect(await verificarToken(token, SECRETO)).toBe(false)
  })

  it('rechaza todo si no hay secreto configurado', async () => {
    const token = await firmarToken(SECRETO)
    expect(await verificarToken(token, undefined)).toBe(false)
    expect(await verificarToken(token, '')).toBe(false)
  })
})
