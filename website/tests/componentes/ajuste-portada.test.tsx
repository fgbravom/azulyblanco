// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { default: AjustePortada } = await import('@/components/admin/noticias/AjustePortada')

// jsdom no implementa la captura de puntero que usa el arrastre
Element.prototype.setPointerCapture = () => {}

function preparar(foco = { x: 50, y: 50 }) {
  const onChange = vi.fn()
  const { container } = render(<AjustePortada url="https://x/foto.webp" foco={foco} onChange={onChange} />)
  return {
    container,
    onChange,
    articulo: screen.getByRole('button', { name: /En el artículo/ }),
    inicio: screen.getByRole('button', { name: /En las tarjetas del inicio/ }),
  }
}

/** Marco de ancho × alto con una foto cuadrada de 200 × 200: sobra solo lo que dicta el marco */
function medirComo(boton: HTMLElement, ancho: number, alto: number) {
  boton.getBoundingClientRect = () =>
    ({ width: ancho, height: alto, top: 0, left: 0, right: ancho, bottom: alto, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
  const img = boton.querySelector('img')!
  Object.defineProperty(img, 'naturalWidth', { value: 200 })
  Object.defineProperty(img, 'naturalHeight', { value: 200 })
}

describe('AjustePortada', () => {
  it('muestra el encuadre en los dos marcos', () => {
    const { container } = preparar({ x: 30, y: 70 })
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(2)
    for (const img of imgs) expect((img as HTMLImageElement).style.objectPosition).toBe('30% 70%')
  })

  it('Centrar vuelve al centro de la foto', () => {
    const { onChange } = preparar({ x: 30, y: 70 })
    fireEvent.click(screen.getByRole('button', { name: 'Centrar' }))
    expect(onChange).toHaveBeenCalledWith({ x: 50, y: 50 })
  })

  it('arrastrar la foto cambia el encuadre del eje donde ella sobra', () => {
    // En 16:9 la foto cuadrada sobra en alto: el arrastre mueve el eje vertical
    const { onChange, articulo } = preparar()
    medirComo(articulo, 160, 90)

    fireEvent.pointerDown(articulo, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(articulo, { clientX: 40, clientY: -7 })

    expect(onChange).toHaveBeenCalledWith({ x: 50, y: 60 })
  })

  it('en 3:4 la foto sobra en ancho y el arrastre mueve el eje horizontal', () => {
    const { onChange, inicio } = preparar()
    medirComo(inicio, 120, 160)

    fireEvent.pointerDown(inicio, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(inicio, { clientX: -8, clientY: 30 })

    expect(onChange).toHaveBeenCalledWith({ x: 70, y: 50 })
  })

  it('las flechas mueven la foto, con pasos largos con Shift', () => {
    const { onChange, articulo } = preparar()
    medirComo(articulo, 160, 60)

    fireEvent.keyDown(articulo, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith({ x: 50, y: 53 })

    fireEvent.keyDown(articulo, { key: 'ArrowDown', shiftKey: true })
    expect(onChange).toHaveBeenLastCalledWith({ x: 50, y: 40 })
  })
})
