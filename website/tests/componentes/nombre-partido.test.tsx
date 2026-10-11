// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const { NombrePartido } = await import('@/components/calendario/NombrePartido')
const { default: CeldaCuota } = await import('@/components/admin/cuotas/CeldaCuota')

describe('NombrePartido', () => {
  it('AYB local: escudo antes del nombre y rival sin destacar', () => {
    const { container } = render(<NombrePartido rivalText="AYB VS Club América" />)
    expect(screen.getAllByAltText('Azul y Blanco')).toHaveLength(1)
    expect(screen.getByText('AYB')).toHaveClass('font-bold')
    expect(screen.getByText('Club América')).not.toHaveClass('font-bold')
    expect(container.textContent).toBe('AYBVSClub América')
  })

  it('AYB visitante: el escudo va al final', () => {
    const { container } = render(<NombrePartido rivalText="Unión VS Serie Honor" />)
    expect(container.querySelector('div > :last-child img')).not.toBeNull()
    expect(screen.getByText('Serie Honor')).toHaveClass('font-bold')
  })

  it('partido interno: dos escudos', () => {
    render(<NombrePartido rivalText="Serie Honor vs Serie 35" />)
    expect(screen.getAllByAltText('Azul y Blanco')).toHaveLength(2)
  })

  it('puede ocultar el "VS"', () => {
    render(<NombrePartido rivalText="AYB VS Club América" mostrarVS={false} />)
    expect(screen.queryByText('VS')).toBeNull()
  })

  it('escapa el texto: un rival con HTML no se interpreta', () => {
    const { container } = render(<NombrePartido rivalText={'AYB VS <img src=x onerror=alert(1)>'} />)
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
  })
})

describe('CeldaCuota', () => {
  const base = {
    id: 'c1', jugador_id: 1, equipo_id: 1, periodo: '2026-03-01', monto: 15000,
    exencion: null, nota: null, pagado: 0, saldo: 15000, estado: 'pendiente' as const,
  }

  it('sin cuota muestra un guion y avisa que no hay cuota ese mes', () => {
    render(<CeldaCuota onClick={() => {}} />)
    expect(screen.getByRole('button', { name: '—' })).toHaveAttribute('title', 'Sin cuota este mes')
  })

  it('un abono muestra lo pagado y el total en el título', () => {
    render(<CeldaCuota cuota={{ ...base, estado: 'parcial', pagado: 5000, saldo: 10000 }} onClick={() => {}} />)
    const boton = screen.getByRole('button')
    expect(boton.textContent?.replace(/\s/g, '')).toBe('$5.000')
    expect(boton.getAttribute('title')?.replace(/\s/g, '')).toBe('Abonó$5.000de$15.000')
  })

  it('al hacer clic avisa al tablero', () => {
    const onClick = vi.fn()
    render(<CeldaCuota cuota={base} onClick={onClick} />)
    screen.getByRole('button').click()
    expect(onClick).toHaveBeenCalledOnce()
  })
})
