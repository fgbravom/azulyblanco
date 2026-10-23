import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../../helpers/sesion'
import { argsDe, crearSupabaseFalso, type Responder } from '../../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const acciones = await import('@/app/(admin)/admin/cuotas/actions')

function conBase(responder: Responder) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

const PAGO = {
  jugador_id: 1,
  equipo_id: 2,
  periodo: '2026-03-01',
  monto: 15000,
  fecha: '2026-03-05',
  medio: 'transferencia' as const,
}

describe('cuotas: interruptor CUOTAS_HABILITADAS', () => {
  it('con sesión pero el sistema apagado, toda acción se rechaza sin consultar cuotas', async () => {
    vi.stubEnv('CUOTAS_HABILITADAS', 'false')
    const { base } = await simularSesion(true)
    await expect(acciones.obtenerTablero()).rejects.toThrow('no está habilitado')
    await expect(acciones.registrarPago(PAGO)).rejects.toThrow('no está habilitado')
    expect(base!.consultas).toHaveLength(0)
  })

  it('solo "true" lo enciende', async () => {
    vi.stubEnv('CUOTAS_HABILITADAS', 'TRUE')
    await simularSesion(true)
    await expect(acciones.generarCuotas(1, '2026-03-01')).rejects.toThrow('no está habilitado')
  })
})

describe('cuotas con sesión y sistema encendido', () => {
  let baseSesion: ReturnType<typeof crearSupabaseFalso> | undefined

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.stubEnv('CUOTAS_HABILITADAS', 'true')
    ;({ base: baseSesion } = await simularSesion(true))
  })

  describe('generarCuotas', () => {
    function base(jugadores: object[], montoSerie = 15000) {
      return conBase((c) => {
        if (c.tabla === 'equipos') return { data: { cuota_monto: montoSerie } }
        if (c.tabla === 'jugadores') return { data: jugadores }
        if (c.tabla === 'cuotas') return { data: (argsDe(c, 'upsert')?.[0] as object[]).map((_, i) => ({ id: `c${i}` })) }
      })
    }

    it('crea una cuota por jugador activo; refuerzos, becados y lesionados quedan exentos', async () => {
      const falso = base([
        { id: 1, estado: 'Activo', cuota_condicion: 'regular' },
        { id: 2, estado: 'Lesionado', cuota_condicion: 'regular' },
        { id: 3, estado: 'Activo', cuota_condicion: 'refuerzo' },
        { id: 4, estado: 'Lesionado', cuota_condicion: 'becado' },
        { id: 5, estado: 'Sancionado', cuota_condicion: 'regular' },
      ])

      expect(await acciones.generarCuotas(7, '2026-03-01')).toBe(5)

      const [filas, opciones] = argsDe(falso.a('cuotas')[0], 'upsert') as [Array<Record<string, unknown>>, object]
      expect(filas.map((f) => [f.jugador_id, f.exencion])).toEqual([
        [1, null],
        [2, 'lesion'],
        [3, 'refuerzo'],
        [4, 'becado'],
        [5, null],
      ])
      expect(filas.every((f) => f.monto === 15000 && f.equipo_id === 7 && f.periodo === '2026-03-01')).toBe(true)
      // Volver a generar el mes no duplica ni pisa lo editado a mano
      expect(opciones).toEqual({ onConflict: 'jugador_id,periodo', ignoreDuplicates: true })
    })

    it('solo considera jugadores activos de esa serie y no los inactivos', async () => {
      const falso = base([])
      await acciones.generarCuotas(7, '2026-03-01')
      const consulta = falso.a('jugadores')[0]
      expect(consulta.ops).toEqual(
        expect.arrayContaining([
          { metodo: 'eq', args: ['equipo_id', 7] },
          { metodo: 'eq', args: ['activo', true] },
          { metodo: 'neq', args: ['estado', 'Inactivo'] },
        ])
      )
    })

    it('sin jugadores no inserta nada', async () => {
      const falso = base([])
      expect(await acciones.generarCuotas(7, '2026-03-01')).toBe(0)
      expect(falso.a('cuotas')).toHaveLength(0)
    })

    it('exige que la serie tenga monto definido', async () => {
      base([{ id: 1, estado: 'Activo', cuota_condicion: 'regular' }], 0)
      await expect(acciones.generarCuotas(7, '2026-03-01')).rejects.toThrow('monto')
    })

    it.each(['2026-03-15', '2026-3-01', 'marzo', "2026-03-01'; drop table cuotas;--"])(
      'rechaza el periodo %j',
      async (periodo) => {
        await expect(acciones.generarCuotas(7, periodo)).rejects.toThrow('Mes inválido')
        expect(baseSesion!.consultas).toHaveLength(0)
      }
    )
  })

  describe('registrarPago', () => {
    it('crea la cuota del mes si no existe y le asocia el pago', async () => {
      const falso = conBase((c) => {
        if (c.tabla === 'equipos') return { data: { cuota_monto: 15000 } }
        if (c.tabla === 'cuotas' && argsDe(c, 'insert')) return { data: { id: 'nueva' } }
        if (c.tabla === 'cuotas') return { data: null }
        return { data: null }
      })

      await acciones.registrarPago({ ...PAGO, referencia: '  123  ', nota: '' })

      const pago = argsDe(falso.a('pagos')[0], 'insert')?.[0]
      expect(pago).toEqual({
        cuota_id: 'nueva',
        monto: 15000,
        fecha: '2026-03-05',
        medio: 'transferencia',
        referencia: '123',
        registrado_por: null,
        nota: null,
      })
    })

    it('reutiliza la cuota existente del mes', async () => {
      const falso = conBase((c) => (c.tabla === 'cuotas' ? { data: { id: 'existente' } } : { data: null }))
      await acciones.registrarPago(PAGO)
      expect(argsDe(falso.a('pagos')[0], 'insert')?.[0]).toMatchObject({ cuota_id: 'existente' })
      expect(falso.a('cuotas').some((c) => argsDe(c, 'insert'))).toBe(false)
    })

    it.each([
      ['monto con decimales', { monto: 1500.5 }, 'sin decimales'],
      ['monto cero', { monto: 0 }, 'mayor a 0'],
      ['monto negativo', { monto: -100 }, 'mayor a 0'],
      ['fecha inválida', { fecha: '05/03/2026' }, 'Fecha inválida'],
      ['periodo que no es día 1', { periodo: '2026-03-05' }, 'Mes inválido'],
    ])('rechaza %s', async (_caso, cambio, mensaje) => {
      conBase(() => ({ data: null }))
      await expect(acciones.registrarPago({ ...PAGO, ...cambio })).rejects.toThrow(mensaje)
    })

    it('no deja registrar a mano medios de la pasarela de pago', async () => {
      conBase(() => ({ data: null }))
      // @ts-expect-error mercadopago solo lo registra la pasarela
      await expect(acciones.registrarPago({ ...PAGO, medio: 'mercadopago' })).rejects.toThrow()
    })
  })

  it('anularPago marca el pago como anulado en vez de borrarlo', async () => {
    const falso = conBase(() => ({ data: null }))
    await acciones.anularPago('p1')
    const [consulta] = falso.a('pagos')
    expect(argsDe(consulta, 'update')).toEqual([{ estado: 'anulado' }])
    expect(argsDe(consulta, 'eq')).toEqual(['id', 'p1'])
    expect(consulta.ops.some((o) => o.metodo === 'delete')).toBe(false)
  })

  it('eliminarCuota se niega si la cuota tiene pagos aprobados', async () => {
    const falso = conBase((c) => (c.tabla === 'pagos' ? { count: 1 } : { data: null }))
    await expect(acciones.eliminarCuota('c1')).rejects.toThrow('Anúlalos')
    expect(falso.a('cuotas')).toHaveLength(0)
  })

  it('eliminarCuota borra una cuota sin pagos', async () => {
    const falso = conBase((c) => (c.tabla === 'pagos' ? { count: 0 } : { data: null }))
    await acciones.eliminarCuota('c1')
    expect(argsDe(falso.a('cuotas')[0], 'delete')).toEqual([])
  })

  it('guardarCondicion solo acepta regular, refuerzo o becado', async () => {
    const falso = conBase(() => ({ data: null }))
    await acciones.guardarCondicion(1, 'becado')
    expect(argsDe(falso.a('jugadores')[0], 'update')).toEqual([{ cuota_condicion: 'becado' }])
    // @ts-expect-error valor fuera del enum
    await expect(acciones.guardarCondicion(1, 'vip')).rejects.toThrow()
  })

  it('regenerarCodigo entrega un código nuevo de 128 bits y lo guarda', async () => {
    const falso = conBase(() => ({ data: null }))
    const codigo = await acciones.regenerarCodigo(1)
    expect(codigo).toMatch(/^[0-9a-f]{32}$/)
    expect(argsDe(falso.a('jugadores')[0], 'update')).toEqual([{ codigo_cuotas: codigo }])
    expect(await acciones.regenerarCodigo(1)).not.toBe(codigo)
  })

  it('guardarConfigCuotas rechaza montos con decimales o negativos', async () => {
    conBase(() => ({ data: null }))
    await expect(acciones.guardarConfigCuotas(1, { cuota_monto: 100.5 })).rejects.toThrow('sin decimales')
    await expect(acciones.guardarConfigCuotas(1, { cuota_monto: -1 })).rejects.toThrow()
  })
})
