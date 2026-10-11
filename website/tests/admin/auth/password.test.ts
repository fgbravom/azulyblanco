import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { verifyPassword } from '@/lib/auth/password'

// Costo bajo: la seguridad del hash no es lo que se prueba aquí
const HASH = bcrypt.hashSync('clave-larga-del-club', 4)

describe('verifyPassword', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('acepta la contraseña correcta con el hash tal cual', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', HASH)
    expect(await verifyPassword('clave-larga-del-club')).toBe(true)
    expect(await verifyPassword('otra')).toBe(false)
  })

  it('acepta el hash en base64 (los "$" se rompen en algunos .env)', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', Buffer.from(HASH).toString('base64'))
    expect(await verifyPassword('clave-larga-del-club')).toBe(true)
  })

  it('ignora espacios alrededor del hash', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', `  ${HASH}\n`)
    expect(await verifyPassword('clave-larga-del-club')).toBe(true)
  })

  it('en producción sin ADMIN_PASSWORD_HASH el login queda cerrado, incluso con la contraseña de desarrollo', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', '')
    vi.stubEnv('NODE_ENV', 'production')
    expect(await verifyPassword('asd123')).toBe(false)
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('ADMIN_PASSWORD_HASH'))
  })

  it('en desarrollo sin ADMIN_PASSWORD_HASH rige la contraseña de desarrollo', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', '')
    vi.stubEnv('NODE_ENV', 'development')
    expect(await verifyPassword('asd123')).toBe(true)
    expect(await verifyPassword('otra')).toBe(false)
  })

  it('en producción con ADMIN_PASSWORD_HASH la contraseña de desarrollo no sirve', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', HASH)
    vi.stubEnv('NODE_ENV', 'production')
    expect(await verifyPassword('asd123')).toBe(false)
  })
})
