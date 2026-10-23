import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CUENTA_ADMIN_ID, simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso, type Responder } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { crearCuenta, cambiarRol, restablecerPassword, cambiarEstado, listarCuentas } = await import(
  '@/app/(admin)/admin/usuarios/actions'
)

const ID_REDACTOR = '44444444-5555-4666-8777-888888888888'
const OTRA_CUENTA = '55555555-6666-4777-8888-999999999999'

function conBase(responder: Responder = () => ({ data: null })) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

describe('crearCuenta', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion('admin')
  })

  it('un colaborador crea su redactor (su firma) y la cuenta enlazada, con contraseña temporal', async () => {
    const falso = conBase((c) => (c.tabla === 'redactores' ? { data: { id: ID_REDACTOR } } : undefined))

    const res = await crearCuenta({ usuario: 'Ana.Perez', rol: 'colaborador', nombre: '  Ana Pérez ' })

    expect(res.usuario).toBe('ana.perez')
    expect(res.passwordTemporal).toMatch(/^[^0Ol1]{12}$/)
    expect(argsDe(falso.a('redactores')[0], 'insert')?.[0]).toEqual({ nombre: 'Ana Pérez' })
    const cuenta = argsDe(falso.a('cuentas_panel')[0], 'insert')?.[0] as Record<string, unknown>
    expect(cuenta).toMatchObject({ usuario: 'ana.perez', rol: 'colaborador', redactor_id: ID_REDACTOR, debe_cambiar_password: true })
    expect(cuenta.password_hash).toMatch(/^\$2[aby]\$/)
  })

  it('un colaborador sin nombre no crea nada', async () => {
    const falso = conBase()
    await expect(crearCuenta({ usuario: 'ana', rol: 'colaborador', nombre: '  ' })).rejects.toThrow('Indica el nombre del colaborador')
    expect(falso.consultas).toHaveLength(0)
  })

  it('un administrador no crea redactor ni queda enlazado a uno', async () => {
    const falso = conBase()
    await crearCuenta({ usuario: 'nuevo.admin', rol: 'admin' })
    expect(falso.a('redactores')).toHaveLength(0)
    const cuenta = argsDe(falso.a('cuentas_panel')[0], 'insert')?.[0] as Record<string, unknown>
    expect(cuenta).toMatchObject({ usuario: 'nuevo.admin', rol: 'admin' })
    expect(cuenta).not.toHaveProperty('redactor_id')
  })

  it('el usuario reservado del admin no se puede dar a nadie', async () => {
    const falso = conBase()
    await expect(crearCuenta({ usuario: 'ab06', rol: 'admin' })).rejects.toThrow('reservado')
    expect(falso.consultas).toHaveLength(0)
  })

  it('si la cuenta del colaborador no se puede crear, borra el redactor que se creó', async () => {
    const falso = conBase((c) => {
      if (c.tabla === 'redactores' && uso(c, 'insert')) return { data: { id: ID_REDACTOR } }
      if (c.tabla === 'cuentas_panel' && uso(c, 'insert')) return { error: { code: '23505', message: 'duplicate' } }
    })
    await expect(crearCuenta({ usuario: 'ana', rol: 'colaborador', nombre: 'Ana' })).rejects.toThrow('Ya existe una cuenta con ese usuario')
    expect(falso.a('redactores').some((c) => uso(c, 'delete'))).toBe(true)
  })
})

describe('cambios sobre una cuenta', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion('admin')
  })

  it('no se puede cambiar el rol, restablecer ni desactivar la propia cuenta', async () => {
    const falso = conBase()
    await expect(cambiarRol(CUENTA_ADMIN_ID, 'colaborador', 'Yo')).rejects.toThrow('No puedes cambiar tu propio rol')
    await expect(restablecerPassword(CUENTA_ADMIN_ID)).rejects.toThrow('Para cambiar tu contraseña usa Mi cuenta')
    await expect(cambiarEstado(CUENTA_ADMIN_ID, false)).rejects.toThrow('No puedes desactivar tu propia cuenta')
    expect(falso.a('cuentas_panel').some((c) => uso(c, 'update'))).toBe(false)
  })

  it('restablecer genera una contraseña temporal, exige cambiarla y cierra sus sesiones', async () => {
    const falso = conBase((c) => (c.tabla === 'cuentas_panel' && uso(c, 'select') ? { data: { version_sesion: 3 } } : undefined))
    const { passwordTemporal } = await restablecerPassword(OTRA_CUENTA)

    expect(passwordTemporal).toMatch(/^[^0Ol1]{12}$/)
    const update = argsDe(falso.a('cuentas_panel').find((c) => uso(c, 'update'))!, 'update')?.[0] as Record<string, unknown>
    expect(update).toMatchObject({ debe_cambiar_password: true, version_sesion: 4 })
  })

  it('desactivar cierra sus sesiones; reactivar no toca la versión', async () => {
    const falso = conBase((c) => (c.tabla === 'cuentas_panel' && uso(c, 'select') ? { data: { version_sesion: 1 } } : undefined))

    await cambiarEstado(OTRA_CUENTA, false)
    const desactivar = argsDe(falso.a('cuentas_panel').find((c) => uso(c, 'update'))!, 'update')?.[0] as Record<string, unknown>
    expect(desactivar).toEqual({ activa: false, version_sesion: 2 })

    const reactivar = conBase()
    await cambiarEstado(OTRA_CUENTA, true)
    expect(argsDe(reactivar.a('cuentas_panel')[0], 'update')?.[0]).toEqual({ activa: true })
  })

  it('pasar a colaborador exige nombre y pide contraseña nueva al ingresar', async () => {
    const falso = conBase((c) =>
      c.tabla === 'redactores' && uso(c, 'insert')
        ? { data: { id: ID_REDACTOR } }
        : c.tabla === 'cuentas_panel' && uso(c, 'select')
          ? { data: { rol: 'admin', version_sesion: 0 } }
          : undefined
    )
    await expect(cambiarRol(OTRA_CUENTA, 'colaborador', ' ')).rejects.toThrow('Indica el nombre del colaborador')

    await cambiarRol(OTRA_CUENTA, 'colaborador', 'Beto Ruiz')
    const cambio = argsDe(falso.a('cuentas_panel').find((c) => uso(c, 'update'))!, 'update')?.[0] as Record<string, unknown>
    expect(cambio).toMatchObject({ rol: 'colaborador', redactor_id: ID_REDACTOR, debe_cambiar_password: true, version_sesion: 1 })
  })
})

describe('listarCuentas', () => {
  it('solo el administrador la ve; un colaborador recibe No autorizado sin consultar contenido', async () => {
    await simularSesion('colaborador')
    const falso = conBase()
    await expect(listarCuentas()).rejects.toThrow('No autorizado')
    expect(falso.consultas).toHaveLength(0)
  })
})
