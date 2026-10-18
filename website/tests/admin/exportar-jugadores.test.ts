import { describe, expect, it } from 'vitest'
import { jugadoresACsv } from '@/lib/jugadores/exportar-csv'
import type { JugadorCompleto } from '@/types/database'

const jugador = {
  nombre: 'Pedro',
  apellidos: 'Crisosto San Martín',
  categoria: '35',
  estado: 'Activo',
  dorsal: 10,
  posiciones: ['Volante', 'Defensa central'],
  pie_preferido: null,
  direccion: 'Calle "Larga"; depto 2',
  edad: 40,
} as unknown as JugadorCompleto

describe('jugadoresACsv', () => {
  const lineas = jugadoresACsv([jugador]).split('\r\n')

  it('parte con BOM y una fila de títulos', () => {
    expect(lineas[0].startsWith('﻿Nombre;Apellidos;Serie;')).toBe(true)
    expect(lineas).toHaveLength(2)
  })

  it('escribe una fila por jugador y deja vacíos los datos que faltan', () => {
    expect(lineas[1].startsWith('Pedro;Crisosto San Martín;35;Activo;10;Volante, Defensa central;;')).toBe(true)
  })

  it('escapa comillas y separadores', () => {
    expect(lineas[1]).toContain(';"Calle ""Larga""; depto 2";')
  })

  it('no exporta el código del link de cuotas', () => {
    expect(jugadoresACsv([{ ...jugador, codigo_cuotas: 'secreto123' }])).not.toContain('secreto123')
  })
})
