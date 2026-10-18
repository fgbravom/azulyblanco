// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MotivoDespublicacion from '@/components/admin/noticias/MotivoDespublicacion'

function abrir(onConfirmar = vi.fn(async () => {})) {
  const onCancelar = vi.fn()
  render(<MotivoDespublicacion titulo="Gran final" onConfirmar={onConfirmar} onCancelar={onCancelar} />)
  return { onConfirmar, onCancelar }
}

describe('diálogo de motivo al despublicar', () => {
  it('no deja confirmar con menos de 10 caracteres y muestra el contador', async () => {
    const usuario = userEvent.setup()
    abrir()
    const boton = screen.getByRole('button', { name: 'Despublicar' })

    expect(boton).toBeDisabled()
    await usuario.type(screen.getByLabelText(/motivo/i), 'muy corto')
    expect(boton).toBeDisabled()
    expect(screen.getByText(/9\/500/)).toBeInTheDocument()
  })

  it('con un motivo válido lo envía recortado', async () => {
    const usuario = userEvent.setup()
    const { onConfirmar } = abrir()

    await usuario.type(screen.getByLabelText(/motivo/i), '  Hay un dato incorrecto  ')
    await usuario.click(screen.getByRole('button', { name: 'Despublicar' }))

    await waitFor(() => expect(onConfirmar).toHaveBeenCalledWith('Hay un dato incorrecto'))
  })

  it('cancelar cierra sin enviar nada', async () => {
    const usuario = userEvent.setup()
    const { onConfirmar, onCancelar } = abrir()

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancelar).toHaveBeenCalled()
    expect(onConfirmar).not.toHaveBeenCalled()
  })
})
