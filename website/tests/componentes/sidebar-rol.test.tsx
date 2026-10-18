// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/noticias',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const { default: AdminSidebar } = await import('@/components/admin/layout/AdminSidebar')

describe('menú lateral según el rol', () => {
  it('un redactor solo ve Noticias y Mi cuenta, con su nombre', () => {
    render(<AdminSidebar cuotas rol="redactor" nombre="Ana Pérez" />)
    const aside = screen.getAllByRole('list')[0]
    const enlaces = Array.from(aside.querySelectorAll('a')).map((a) => a.textContent)

    expect(enlaces).toEqual(['Noticias', 'Mi cuenta'])
    expect(screen.getAllByText('Ana Pérez').length).toBeGreaterThan(0)
    expect(screen.queryByText('Jugadores')).not.toBeInTheDocument()
    expect(screen.queryByText('Redactores')).not.toBeInTheDocument()
    expect(screen.getAllByText('Cerrar sesión').length).toBeGreaterThan(0)
  })

  it('el admin conserva todo el menú', () => {
    render(<AdminSidebar cuotas rol="admin" />)
    for (const nombre of ['Inicio', 'Noticias', 'Redactores', 'Plantel', 'Cuotas']) {
      expect(screen.getAllByText(nombre).length).toBeGreaterThan(0)
    }
    expect(screen.queryByText('Mi cuenta')).not.toBeInTheDocument()
  })
})
