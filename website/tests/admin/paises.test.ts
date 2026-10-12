import { describe, expect, it } from 'vitest'
import { codigoPais, NACIONALIDADES, nombrePais, PAISES } from '@/lib/jugadores/paises'

describe('codigoPais', () => {
  it.each([
    ['Argentina', 'AR'],
    ['argentino', 'AR'],
    ['Chile', 'CL'],
    ['chilena', 'CL'],
    ['Colombia', 'CO'],
    ['colombiana', 'CO'],
    ['Haití', 'HT'],
    ['  HAITIANO ', 'HT'],
    ['Perú', 'PE'],
    ['peruano', 'PE'],
    ['Venezuela', 'VE'],
    ['venezolana', 'VE'],
  ])('%j → %j', (nacionalidad, esperado) => {
    expect(codigoPais(nacionalidad)).toBe(esperado)
  })

  it('devuelve null si no hay nacionalidad o el país no es conocido', () => {
    expect(codigoPais(null)).toBeNull()
    expect(codigoPais('')).toBeNull()
    expect(codigoPais('España')).toBeNull()
  })
})

describe('nombrePais', () => {
  it('devuelve el nombre canónico a partir del país o del gentilicio', () => {
    expect(nombrePais('chilena')).toBe('Chile')
    expect(nombrePais('Perú')).toBe('Perú')
    expect(nombrePais('argentino')).toBe('Argentina')
    expect(nombrePais('COLOMBIANA')).toBe('Colombia')
  })

  it('devuelve null si no reconoce la nacionalidad', () => {
    expect(nombrePais(null)).toBeNull()
    expect(nombrePais('España')).toBeNull()
  })
})

describe('NACIONALIDADES', () => {
  it('coincide con los países que tienen bandera', () => {
    expect([...NACIONALIDADES].sort()).toEqual(Object.values(PAISES).sort())
  })
})
