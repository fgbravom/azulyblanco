import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso, type Responder } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { listarRedactores, crearCuenta, cambiarUsuario, restablecerPassword, cambiarEstadoCuenta } = await import(
  '@/app/(admin)/admin/redactores/actions'
)

const ID = '11111111-2222-4333-8444-555555555555'

function conBase(responder: Responder) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

const actualizacion = (falso: ReturnType<typeof conBase>) =>
  argsDe(falso.a('cuentas_panel').find((c) => uso(c, 'update'))!, 'update')?.[0] as Record<string, unknown>

describe('administración de cuentas de redactores', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion('admin')
  })

  describe('listarRedactores', () => {
    it('devuelve la cuenta sin el hash, o null si no tiene', async () => {
      const falso = conBase(() => ({
        data: [
          { id: 'r1', nombre: 'Ana', cuentas_panel: { usuario: 'ana', activa: true, ultimo_ingreso: null, debe_cambiar_password: true } },
          { id: 'r2', nombre: 'Beto', cuentas_panel: null },
        ],
      }))
      const lista = await listarRedactores()

      expect(lista[0].cuenta).toEqual({ usuario: 'ana', activa: true, ultimo_ingreso: null, debe_cambiar_password: true })
      expect(lista[1].cuenta).toBeNull()
      expect(lista[0]).not.toHaveProperty('cuentas_panel')
      expect(String(argsDe(falso.a('redactores')[0], 'select')?.[0])).not.toMatch(/password_hash|\*\)/)
    })
  })

  describe('crearCuenta', () => {
    it('guarda el usuario en minúscula con un hash, y devuelve la contraseña temporal una vez', async () => {
      const falso = conBase(() => ({ data: null }))
      const { usuario, passwordTemporal } = await crearCuenta(ID, '  Ana.Perez ')

      expect(usuario).toBe('ana.perez')
      expect(passwordTemporal).toHaveLength(12)
      const fila = argsDe(falso.a('cuentas_panel')[0], 'insert')?.[0] as Record<string, unknown>
      expect(fila).toMatchObject({ redactor_id: ID, usuario: 'ana.perez', debe_cambiar_password: true })
      expect(fila.password_hash).not.toBe(passwordTemporal)
      expect(await bcrypt.compare(passwordTemporal, fila.password_hash as string)).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith('/admin/redactores')
    })

    it.each([
      ['el usuario del admin', 'ab06', 'reservado'],
      ['el usuario del admin en mayúsculas', 'AB06', 'reservado'],
      ['un usuario muy corto', 'ab', '3 a 32'],
      ['un usuario muy largo', 'a'.repeat(33), '3 a 32'],
      ['caracteres no permitidos', 'ana perez', '3 a 32'],
      ['una tilde', 'ánder', '3 a 32'],
    ])('rechaza %s', async (_caso, usuario, mensaje) => {
      const falso = conBase(() => ({ data: null }))
      await expect(crearCuenta(ID, usuario)).rejects.toThrow(mensaje)
      expect(falso.consultas).toHaveLength(0)
    })

    it('explica el error si el usuario ya existe', async () => {
      conBase(() => ({ error: { message: 'duplicate key value violates unique constraint "idx_cuentas_redactores_usuario_unico"', code: '23505' } }))
      await expect(crearCuenta(ID, 'ana')).rejects.toThrow('Ya existe una cuenta con ese usuario')
    })

    it('explica el error si el redactor ya tiene acceso', async () => {
      conBase(() => ({ error: { message: 'duplicate key value violates unique constraint "cuentas_redactores_pkey"', code: '23505' } }))
      await expect(crearCuenta(ID, 'ana')).rejects.toThrow('ya tiene acceso')
    })
  })

  describe('cambiarUsuario', () => {
    it('aplica las mismas validaciones y guarda en minúscula', async () => {
      const falso = conBase(() => ({ data: { usuario: 'nuevo' } }))
      await expect(cambiarUsuario(ID, 'ab06')).rejects.toThrow('reservado')
      await expect(cambiarUsuario(ID, 'x')).rejects.toThrow('3 a 32')
      expect(falso.consultas).toHaveLength(0)

      expect(await cambiarUsuario(ID, 'Nuevo')).toEqual({ usuario: 'nuevo' })
      expect(actualizacion(falso)).toEqual({ usuario: 'nuevo' })
      expect(argsDe(falso.a('cuentas_panel')[0], 'eq')).toEqual(['redactor_id', ID])
    })

    it('si el usuario ya existe lo explica', async () => {
      conBase(() => ({ error: { message: 'duplicate', code: '23505' } }))
      await expect(cambiarUsuario(ID, 'ana')).rejects.toThrow('Ya existe una cuenta con ese usuario')
    })
  })

  describe('restablecerPassword', () => {
    it('genera otra temporal, exige cambiarla y sube la versión de sesión', async () => {
      const falso = conBase((c) => (uso(c, 'single') ? { data: { version_sesion: 3 } } : { data: null }))
      const { passwordTemporal } = await restablecerPassword(ID)

      const cambio = actualizacion(falso)
      expect(cambio).toMatchObject({ debe_cambiar_password: true, version_sesion: 4 })
      expect(await bcrypt.compare(passwordTemporal, cambio.password_hash as string)).toBe(true)
    })

    it('falla si el redactor no tiene cuenta', async () => {
      conBase(() => ({ error: { message: 'no rows', code: 'PGRST116' } }))
      await expect(restablecerPassword(ID)).rejects.toThrow('no tiene acceso')
    })
  })

  describe('cambiarEstadoCuenta', () => {
    it('al desactivar sube la versión de sesión', async () => {
      const falso = conBase((c) => (uso(c, 'single') ? { data: { version_sesion: 7 } } : { data: null }))
      await cambiarEstadoCuenta(ID, false)
      expect(actualizacion(falso)).toEqual({ activa: false, version_sesion: 8 })
    })

    it('al activar no toca la versión', async () => {
      const falso = conBase(() => ({ data: null }))
      await cambiarEstadoCuenta(ID, true)
      expect(actualizacion(falso)).toEqual({ activa: true })
    })
  })
})
