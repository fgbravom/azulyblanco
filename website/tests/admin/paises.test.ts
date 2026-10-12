import { describe, expect, it } from 'vitest'
import { codigoPais } from '@/lib/jugadores/paises'

describe('codigoPais', () => {
  it.each([
    ['Chile', 'CL'],
    ['chilena', 'CL'],
    ['Haití', 'HT'],
    ['  HAITIANO ', 'HT'],
    ['Venezuela', 'VE'],
    ['venezolana', 'VE'],
    ['Perú', 'PE'],
    ['peruano', 'PE'],
  ])('%j → %j', (nacionalidad, esperado) => {
    expect(codigoPais(nacionalidad)).toBe(esperado)
  })

  it('devuelve null si no hay nacionalidad o el país no es conocido', () => {
    expect(codigoPais(null)).toBeNull()
    expect(codigoPais('')).toBeNull()
    expect(codigoPais('España')).toBeNull()
  })
})
