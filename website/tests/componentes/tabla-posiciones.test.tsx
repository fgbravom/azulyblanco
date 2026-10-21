// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { claveEquipo, getPosicionesSerie } from '@/lib/data/posiciones'

const { TablaPosiciones } = await import('@/app/series/_components/TablaPosiciones')

const primera = getPosicionesSerie('primera')

describe('TablaPosiciones', () => {
  it('muestra la fecha, la fuente y las 13 filas de la serie', () => {
    render(<TablaPosiciones tabla={primera!} />)
    expect(screen.getByRole('heading', { name: 'Tabla de posiciones' })).toBeInTheDocument()
    expect(screen.getByText('Campeonato ANFA 2026 · Clausura · Fecha N°23')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(14)
    expect(screen.getByText(/Asociación de Fútbol Curicó Aguas Negras/)).toBeInTheDocument()
  })

  it('respeta el orden y los valores de la tabla oficial', () => {
    render(<TablaPosiciones tabla={primera!} />)
    const filas = screen.getAllByRole('row').slice(1)
    expect(within(filas[0]).getByText('J. Valvanera')).toBeInTheDocument()
    expect(within(filas[0]).getByText('7')).toBeInTheDocument()
    expect(within(filas[0]).getByText('+4')).toBeInTheDocument()
    expect(within(filas[12]).getByText('U de Chile')).toBeInTheDocument()
    expect(within(filas[12]).getByText('-6')).toBeInTheDocument()
  })

  it('destaca la fila de Azul y Blanco', () => {
    render(<TablaPosiciones tabla={primera!} />)
    const fila = screen.getByRole('row', { name: /Azul y Blanco/ })
    expect(fila).toHaveClass('bg-azul-primario/5')
    expect(within(fila).getByText('(nuestro club)')).toHaveClass('sr-only')
  })

  it('explica las siglas con el título de la columna', () => {
    render(<TablaPosiciones tabla={primera!} />)
    expect(screen.getByTitle('Partidos jugados')).toHaveTextContent('PJ')
    expect(screen.getByTitle('Diferencia de gol (tal como figura en la imagen)')).toHaveTextContent('DG')
  })
  it('muestra el escudo entre la posición y el equipo, con el logo del catálogo cruzado sin tildes', () => {
    const escudos = { [claveEquipo('San Martín')]: 'https://ejemplo.test/sm.png' }
    render(<TablaPosiciones tabla={getPosicionesSerie('honor')!} escudos={escudos} />)
    const fila = screen.getAllByRole('row')[1]
    const celdas = within(fila).getAllByRole('cell')
    expect(celdas[0]).toHaveTextContent('1')
    expect(celdas[1].querySelector('img')).not.toBeNull()
    expect(celdas[2]).toHaveTextContent('San Martin')
  })

  it('usa el escudo del club en Azul y Blanco y una inicial en los equipos sin logo', () => {
    render(<TablaPosiciones tabla={primera!} />)
    const ayb = screen.getByRole('row', { name: /Azul y Blanco/ })
    expect(ayb.querySelector('img')?.getAttribute('src')).toContain('escudoazulyblanco')
    const sinLogo = screen.getByRole('row', { name: /U de Chile/ })
    expect(sinLogo.querySelector('img')).toBeNull()
    expect(within(sinLogo).getByText('U')).toBeInTheDocument()
  })
  it('cruza con el catálogo los equipos cuyo nombre difiere (J. Valvanera → CD Valvanera)', () => {
    const escudos = { [claveEquipo('CD Valvanera')]: 'https://ejemplo.test/val.png' }
    render(<TablaPosiciones tabla={primera!} escudos={escudos} />)
    const fila = screen.getByRole('row', { name: /J\. Valvanera/ })
    expect(fila.querySelector('img')).not.toBeNull()
  })
})
