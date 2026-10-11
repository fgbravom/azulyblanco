// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const router = { push: vi.fn(), refresh: vi.fn() }
vi.mock('next/navigation', () => ({ useRouter: () => router }))
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
    fetchFalso.mockResolvedValue(respuesta(200, { success: true }))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'clave-correcta')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin'))
    expect(fetchFalso).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({ password: 'clave-correcta' })
  })

  it('muestra el error del servidor y no entra', async () => {
    fetchFalso.mockResolvedValue(respuesta(401, { error: 'Contraseña incorrecta' }))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'mala')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(await screen.findByText('Contraseña incorrecta')).toBeInTheDocument()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('avisa cuando hay demasiados intentos', async () => {
    fetchFalso.mockResolvedValue(respuesta(429, { error: 'Demasiados intentos. Espera 15 minutos.' }))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'x')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(await screen.findByText(/Demasiados intentos/)).toBeInTheDocument()
  })

  it('si la red falla muestra un error genérico y vuelve a habilitar el botón', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchFalso.mockRejectedValue(new TypeError('Failed to fetch'))
    const usuario = userEvent.setup()
    render(<LoginPage />)

    await usuario.type(screen.getByLabelText(/contraseña de acceso/i), 'x')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeEnabled()
  })
})
