import { afterEach, describe, expect, it, vi } from 'vitest'
import { CODIGO_VALIDO, etiquetaCuota, formatoCLP, nombreMes, periodoDe } from '@/lib/cuotas/tipos'
import { estiloCuota, textoCelda } from '@/components/admin/cuotas/CeldaCuota'
import type { Cuota } from '@/lib/cuotas/tipos'

// Intl usa espacios especiales (NBSP) según la versión de ICU
const sinEspacios = (s: string) => s.replace(/\s/g, '')

function cuota(parcial: Partial<Cuota>): Cuota {
  return {
    id: 'c1',
    jugador_id: 1,
    equipo_id: 1,
    periodo: '2026-03-01',
    monto: 15000,
    exencion: null,
    nota: null,
    pagado: 0,
    saldo: 15000,
    estado: 'pendiente',
    ...parcial,
  }
}

describe('formatoCLP', () => {
  it('formatea pesos chilenos con punto de miles y sin decimales', () => {
    expect(sinEspacios(formatoCLP(15000))).toBe('$15.000')
    expect(sinEspacios(formatoCLP(1234567))).toBe('$1.234.567')
    expect(sinEspacios(formatoCLP(0))).toBe('$0')
  })
})

describe('nombreMes', () => {
  it('devuelve el mes en español con mayúscula inicial', () => {
    expect(nombreMes('2026-03-01')).toBe('Marzo')
    expect(nombreMes('2026-12-01')).toBe('Diciembre')
  })

  it('en formato corto no deja el punto de la abreviatura', () => {
    expect(nombreMes('2026-09-01', 'short')).not.toContain('.')
    expect(nombreMes('2026-09-01', 'short').toLowerCase()).toMatch(/^sep/)
  })

  it('no se corre de mes por la zona horaria', () => {
    expect(nombreMes('2026-01-01')).toBe('Enero')
  })
})

describe('periodoDe', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('devuelve el primer día del mes', () => {
    expect(periodoDe(new Date('2026-07-15T12:00:00Z'))).toBe('2026-07-01')
  })

  it('usa la hora de Chile: la noche del 31 en Santiago sigue siendo ese mes', () => {
    // 2026-11-01 02:00 UTC = 2026-10-31 23:00 en Santiago (UTC-3)
    expect(periodoDe(new Date('2026-11-01T02:00:00Z'))).toBe('2026-10-01')
  })

  it('sin argumento usa la fecha actual', () => {
    vi.useFakeTimers({ now: new Date('2026-10-11T15:00:00Z') })
    expect(periodoDe()).toBe('2026-10-01')
  })
})

describe('etiqueta y estilo de una cuota', () => {
  it.each([
    ['pagada', null, 'Pagada'],
    ['parcial', null, 'Abono'],
    ['pendiente', null, 'Debe'],
    ['exenta', 'lesion', 'Lesión'],
    ['exenta', 'becado', 'Becado'],
    ['exenta', null, 'Exento'],
  ] as const)('%s / %s → %s', (estado, exencion, esperado) => {
    expect(etiquetaCuota({ estado, exencion })).toBe(esperado)
  })

  it('cada estado tiene un color distinto', () => {
    const colores = new Set(
      (['pagada', 'parcial', 'pendiente'] as const).map((estado) => estiloCuota({ estado, exencion: null }))
    )
    expect(colores.size).toBe(3)
    expect(estiloCuota({ estado: 'pendiente', exencion: null })).toContain('red')
    expect(estiloCuota({ estado: 'pagada', exencion: null })).toContain('green')
  })

  it('la celda muestra lo pagado si hubo pago, y el motivo si no', () => {
    expect(sinEspacios(textoCelda(cuota({ estado: 'parcial', pagado: 5000, saldo: 10000 })))).toBe('$5.000')
    expect(textoCelda(cuota({ estado: 'pendiente' }))).toBe('Debe')
    expect(textoCelda(cuota({ estado: 'exenta', exencion: 'retiro', saldo: 0 }))).toBe('Retiro')
  })
})

describe('CODIGO_VALIDO del link personal', () => {
  it('acepta 32 caracteres hexadecimales en minúscula', () => {
    expect(CODIGO_VALIDO.test(crypto.randomUUID().replace(/-/g, ''))).toBe(true)
  })

  it.each([
    'abc',
    'A'.repeat(32),
    'g'.repeat(32),
    'a'.repeat(31),
    'a'.repeat(33),
    `${'a'.repeat(31)}'`,
    `${'a'.repeat(32)}/../admin`,
    '',
  ])('rechaza %j', (codigo) => {
    expect(CODIGO_VALIDO.test(codigo)).toBe(false)
  })
})
