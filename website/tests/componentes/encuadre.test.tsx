// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { MarcoEncuadre } from '@/components/admin/medios/Encuadre'

const { default: Encuadre } = await import('@/components/admin/medios/Encuadre')
const { FOCO_ARRIBA } = await import('@/lib/contenido/foco')

// jsdom no implementa la captura de puntero que usa el arrastre
Element.prototype.setPointerCapture = () => {}

// Proporción real del artículo (16/9) y de las tarjetas del inicio (3/4) de una noticia
const MARCOS_NOTICIA: MarcoEncuadre[] = [
  { etiqueta: 'En el artículo', clase: 'aspect-video rounded-lg' },
  { etiqueta: 'En las tarjetas del inicio', clase: 'aspect-[3/4] rounded-lg', ancho: 'w-28' },
]

// La ficha de persona del sitio se corta desde arriba cuando no hay ajuste
const MARCOS_FICHA: MarcoEncuadre[] = [
  { etiqueta: 'En la ficha de la serie', clase: 'aspect-[3/4] rounded-2xl', defecto: FOCO_ARRIBA },
  { etiqueta: 'Avatar', clase: 'aspect-square rounded-full', ancho: 'w-24' },
]

function preparar({
  foco = { x: 50, y: 50 },
  marcos = MARCOS_NOTICIA,
  onQuitar,
}: { foco?: { x: number; y: number } | null; marcos?: MarcoEncuadre[]; onQuitar?: () => void } = {}) {
  const onChange = vi.fn()
  render(<Encuadre url="https://x/foto.webp" foco={foco} onChange={onChange} onQuitar={onQuitar} marcos={marcos} />)
  return { onChange }
}

/** Marco de ancho × alto con una foto cuadrada de 200 × 200: sobra solo lo que dicta el marco */
function medirComo(boton: HTMLElement, ancho: number, alto: number) {
  boton.getBoundingClientRect = () =>
    ({ width: ancho, height: alto, top: 0, left: 0, right: ancho, bottom: alto, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
  const img = boton.querySelector('img')!
  Object.defineProperty(img, 'naturalWidth', { value: 200 })
  Object.defineProperty(img, 'naturalHeight', { value: 200 })
}

const encuadreDe = (boton: HTMLElement) => (boton.querySelector('img') as HTMLImageElement).style.objectPosition

describe('Encuadre', () => {
  it('muestra el encuadre en todos los marcos', () => {
    preparar({ foco: { x: 30, y: 70 } })
    for (const etiqueta of ['En el artículo', 'En las tarjetas del inicio']) {
      const boton = screen.getByRole('button', { name: new RegExp(etiqueta) })
      expect(encuadreDe(boton)).toBe('30% 70%')
    }
  })

  it('sin ajuste, cada marco muestra el recorte automático de su lugar', () => {
    preparar({ foco: null, marcos: MARCOS_FICHA })
    // La ficha se corta desde arriba y el avatar, al centro
    expect(encuadreDe(screen.getByRole('button', { name: /En la ficha de la serie/ }))).toBe('50% 0%')
    expect(encuadreDe(screen.getByRole('button', { name: /Avatar/ }))).toBe('50% 50%')
  })

  it('Centrar vuelve al centro de la foto', () => {
    const { onChange } = preparar({ foco: { x: 30, y: 70 } })
    fireEvent.click(screen.getByRole('button', { name: 'Centrar' }))
    expect(onChange).toHaveBeenCalledWith({ x: 50, y: 50 })
  })

  it('Quitar ajuste devuelve la foto a los recortes automáticos', () => {
    const onQuitar = vi.fn()
    preparar({ foco: { x: 30, y: 70 }, marcos: MARCOS_FICHA, onQuitar })
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ajuste' }))
    expect(onQuitar).toHaveBeenCalledOnce()
  })

  it('Quitar ajuste está disponible solo cuando hay un ajuste', () => {
    preparar({ foco: null, marcos: MARCOS_FICHA, onQuitar: vi.fn() })
    expect(screen.getByRole('button', { name: 'Quitar ajuste' })).toBeDisabled()
  })

  it('arrastrar la foto cambia el encuadre del eje donde ella sobra', () => {
    // En 16:9 la foto cuadrada sobra en alto: el arrastre mueve el eje vertical
    const { onChange } = preparar()
    const articulo = screen.getByRole('button', { name: /En el artículo/ })
    medirComo(articulo, 160, 90)

    fireEvent.pointerDown(articulo, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(articulo, { clientX: 40, clientY: -7 })

    expect(onChange).toHaveBeenCalledWith({ x: 50, y: 60 })
  })

  it('en 3:4 la foto sobra en ancho y el arrastre mueve el eje horizontal', () => {
    const { onChange } = preparar()
    const inicio = screen.getByRole('button', { name: /En las tarjetas del inicio/ })
    medirComo(inicio, 120, 160)

    fireEvent.pointerDown(inicio, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(inicio, { clientX: -8, clientY: 30 })

    expect(onChange).toHaveBeenCalledWith({ x: 70, y: 50 })
  })

  it('las flechas mueven la foto, con pasos largos con Shift', () => {
    const { onChange } = preparar()
    const articulo = screen.getByRole('button', { name: /En el artículo/ })
    medirComo(articulo, 160, 60)

    fireEvent.keyDown(articulo, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith({ x: 50, y: 53 })

    fireEvent.keyDown(articulo, { key: 'ArrowDown', shiftKey: true })
    expect(onChange).toHaveBeenLastCalledWith({ x: 50, y: 40 })
  })

  it('sin ajuste, el arrastre parte del recorte automático del marco', () => {
    const { onChange } = preparar({ foco: null, marcos: MARCOS_FICHA })
    const ficha = screen.getByRole('button', { name: /En la ficha de la serie/ })
    medirComo(ficha, 120, 160)

    fireEvent.pointerDown(ficha, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(ficha, { clientX: -8, clientY: 0 })

    // El arrastre parte de 50% 0% (el recorte de la ficha) y no del centro
    expect(onChange).toHaveBeenCalledWith({ x: 70, y: 0 })
  })
})
