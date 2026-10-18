// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const { default: LoginPage } = await import('@/app/admin/login/page')

function respuesta(status: number, body: object) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('página de login del admin', () => {
  const fetchFalso = vi.fn()
  // El login entra con una navegación completa (window.location.assign)
  const assign = vi.fn()
  const locationOriginal = window.location

  beforeAll(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: { ...locationOriginal, assign } })
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: locationOriginal })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchFalso)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('la contraseña parte oculta y el botón la muestra y la vuelve a ocultar', async () => {
    const usuario = userEvent.setup()
    render(<LoginPage />)
    const campo = screen.getByLabelText(/contraseña de acceso/i)

    expect(campo).toHaveAttribute('type', 'password')
    await usuario.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(campo).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true')
    await usuario.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(campo).toHaveAttribute('type', 'password')
  })

  it('envía la contraseña y entra al panel si es correcta', async () => {
    fetchFalso.mockResolvedValue(respuesta(200, { success: true, rol: 'admin' }))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText('Usuario'), 'ab06')
    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'clave-correcta')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    await waitFor(() => expect(assign).toHaveBeenCalledWith('/admin'))
    expect(fetchFalso).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({ usuario: 'ab06', password: 'clave-correcta' })
  })

  it('un redactor entra directo a las noticias', async () => {
    fetchFalso.mockResolvedValue(respuesta(200, { success: true, rol: 'redactor' }))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText('Usuario'), 'redactor1')
    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'clave')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    await waitFor(() => expect(assign).toHaveBeenCalledWith('/admin/noticias'))
  })

  it('el campo de usuario ayuda al gestor de contraseñas', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('autocomplete', 'username')
  })

  it('muestra el error del servidor y no entra', async () => {
    fetchFalso.mockResolvedValue(respuesta(401, { error: 'Usuario o contraseña incorrectos' }))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText('Usuario'), 'ab06')
    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'mala')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument()
    expect(assign).not.toHaveBeenCalled()
  })

  it('avisa cuando hay demasiados intentos', async () => {
    fetchFalso.mockResolvedValue(respuesta(429, { error: 'Demasiados intentos. Espera 15 minutos.' }))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText('Usuario'), 'ab06')
    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'x')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(await screen.findByText(/Demasiados intentos/)).toBeInTheDocument()
  })

  it('si la red falla muestra un error genérico y vuelve a habilitar el botón', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchFalso.mockRejectedValue(new TypeError('Failed to fetch'))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText('Usuario'), 'ab06')
    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'x')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeEnabled()
  })
})
