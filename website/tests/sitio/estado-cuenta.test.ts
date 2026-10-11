import { beforeEach, describe, expect, it, vi } from 'vitest'
import { argsDe, crearSupabaseFalso, type Responder } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { getEstadoCuenta } = await import('@/lib/cuotas/estado-cuenta')

const CODIGO = '0123456789abcdef0123456789abcdef'

// Lo que devolvería la base si alguien pidiera de más: la función no debe dejarlo pasar
const JUGADOR = {
  id: 7,
  nombre_completo: 'Juan Pérez',
  activo: true,
  equipo_id: 3,
  categoria: '35',
}

function conBase(responder: Responder) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

function baseCompleta() {
  return conBase((c) => {
    if (c.tabla === 'vista_jugadores_completa') return { data: JUGADOR }
    if (c.tabla === 'equipos') return { data: { cuota_datos_pago: 'Banco Estado, cuenta 123' } }
    if (c.tabla === 'vista_cuotas')
      return {
        data: [
          { id: 'c3', periodo: '2026-03-01', saldo: 15000, estado: 'pendiente' },
          { id: 'c2', periodo: '2026-02-01', saldo: 5000, estado: 'parcial' },
          { id: 'c1', periodo: '2026-01-01', saldo: 0, estado: 'pagada' },
        ],
      }
    if (c.tabla === 'pagos')
      return {
        data: [
          { id: 'p2', cuota_id: 'c2', monto: 10000, fecha: '2026-02-10', medio: 'efectivo', cuota: { jugador_id: 7 } },
          { id: 'p1', cuota_id: 'c1', monto: 15000, fecha: '2026-01-05', medio: 'transferencia', cuota: { jugador_id: 7 } },
        ],
      }
  })
}

describe('getEstadoCuenta (link personal /cuotas/<código>)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each(['', 'abc', 'A'.repeat(32), `${CODIGO}x`, "' or 1=1 --"])(
    'con un código mal formado (%j) devuelve null sin consultar la base',
    async (codigo) => {
      expect(await getEstadoCuenta(codigo)).toBeNull()
      expect(createAdminClient).not.toHaveBeenCalled()
    }
  )

  it('con un código que no existe devuelve null', async () => {
    conBase(() => ({ data: null }))
    expect(await getEstadoCuenta(CODIGO)).toBeNull()
  })

  it('busca al jugador por su código y pide solo columnas no sensibles', async () => {
    const falso = baseCompleta()
    await getEstadoCuenta(CODIGO)
    const [consulta] = falso.a('vista_jugadores_completa')
    expect(argsDe(consulta, 'eq')).toEqual(['codigo_cuotas', CODIGO])
    const columnas = String(argsDe(consulta, 'select')?.[0]).split(',').map((c) => c.trim())
    expect(columnas).toEqual(['id', 'nombre_completo', 'activo', 'equipo_id', 'categoria'])
  })

  it('suma la deuda y arma el detalle', async () => {
    baseCompleta()
    const cuenta = await getEstadoCuenta(CODIGO)
    expect(cuenta).not.toBeNull()
    expect(cuenta!.nombre).toBe('Juan Pérez')
    expect(cuenta!.serie).toBe('Serie 35')
    expect(cuenta!.deuda).toBe(20000)
    expect(cuenta!.datos_pago).toBe('Banco Estado, cuenta 123')
    expect(cuenta!.cuotas).toHaveLength(3)
  })

  it('los pagos llevan el mes de su cuota y nada del join', async () => {
    baseCompleta()
    const { pagos } = (await getEstadoCuenta(CODIGO))!
    expect(pagos).toEqual([
      { id: 'p2', monto: 10000, fecha: '2026-02-10', medio: 'efectivo', periodo: '2026-02-01' },
      { id: 'p1', monto: 15000, fecha: '2026-01-05', medio: 'transferencia', periodo: '2026-01-01' },
    ])
  })

  it('solo muestra pagos aprobados de ese jugador', async () => {
    const falso = baseCompleta()
    await getEstadoCuenta(CODIGO)
    const [consulta] = falso.a('pagos')
    expect(consulta.ops).toEqual(
      expect.arrayContaining([
        { metodo: 'eq', args: ['cuota.jugador_id', 7] },
        { metodo: 'eq', args: ['estado', 'aprobado'] },
      ])
    )
  })

  it('no expone ningún dato personal de la ficha', async () => {
    baseCompleta()
    const cuenta = (await getEstadoCuenta(CODIGO))!
    expect(Object.keys(cuenta).sort()).toEqual(['activo', 'cuotas', 'datos_pago', 'deuda', 'nombre', 'pagos', 'serie'])
    const texto = JSON.stringify(cuenta)
    for (const campo of ['dni', 'telefono', 'email', 'direccion', 'alergias', 'codigo_cuotas', 'referencia', 'registrado_por']) {
      expect(texto).not.toContain(campo)
    }
  })
})
