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
  it('un colaborador ve sus secciones y Mi cuenta, con su nombre, y no los mantenedores ni usuarios', () => {
    render(<AdminSidebar cuotas rol="colaborador" nombre="Ana Pérez" />)
    const enlaces = Array.from(document.querySelectorAll('nav a')).map((a) => a.textContent)

    expect(enlaces).toEqual(['Noticias', 'Mi cuenta', 'Portada', 'Programación', 'Galerías', 'Imágenes', 'Plantel', 'Series'])
    expect(screen.getAllByText('Ana Pérez').length).toBeGreaterThan(0)
    expect(screen.queryByText('Cuotas')).not.toBeInTheDocument()
    expect(screen.queryByText('Redactores')).not.toBeInTheDocument()
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument()
    expect(screen.getAllByText('Cerrar sesión').length).toBeGreaterThan(0)
  })

  it('el admin conserva todo el menú, con Usuarios y Mi cuenta', () => {
    render(<AdminSidebar cuotas rol="admin" />)
    for (const nombre of ['Inicio', 'Noticias', 'Redactores', 'Usuarios', 'Plantel', 'Cuotas', 'Mi cuenta']) {
      expect(screen.getAllByText(nombre).length).toBeGreaterThan(0)
    }
  })
})
