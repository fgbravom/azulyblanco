import type { CSSProperties } from 'react'

/**
 * Recorte de las fotos: la parte de la foto que se ve al mostrarla en un marco.
 *
 * El punto fijo (0 a 100 en cada eje) es el de la foto que queda en ese mismo
 * punto del marco, igual que object-position. `ancho` es el ancho de la foto
 * respecto al marco, en %: con null se muestra el recorte de cobertura (como
 * object-cover) y con un valor mayor se acerca la foto. El recorte es solo de
 * visualización: la foto original no se toca.
 */

/** Punto fijo de una foto, de 0 a 100 en cada eje */
export interface FocoPortada {
  x: number
  y: number
}

/** Recorte completo de una foto: punto fijo y tamaño dentro del marco */
export interface RecorteFoto extends FocoPortada {
  /** Ancho de la foto respecto al marco, en %; null = sin acercar */
  ancho: number | null
}

/** Recorte sin ajustar: el centro de la foto */
export const FOCO_CENTRO: FocoPortada = { x: 50, y: 50 }

/** Recorte automático de las fichas de persona (object-top): desde arriba */
export const FOCO_ARRIBA: FocoPortada = { x: 50, y: 0 }

/** Punto fijo guardado en la base, o null si la foto está sin ajustar */
export function focoDe(x: number | null | undefined, y: number | null | undefined): FocoPortada | null {
  return typeof x === 'number' && typeof y === 'number' ? { x, y } : null
}

/** Recorte guardado en la base, o null si la foto está sin ajustar */
export function recorteDe(
  x: number | null | undefined,
  y: number | null | undefined,
  ancho: number | null | undefined
): RecorteFoto | null {
  const foco = focoDe(x, y)
  return foco ? { ...foco, ancho: typeof ancho === 'number' ? ancho : null } : null
}

/** Valor de object-position para un punto fijo, p. ej. "35% 80%".
 *  Undefined si no hay encuadre (una foto sin ajustar o una fila anterior a la migración). */
export function posicionCSS(foco: { x?: number | null; y?: number | null } | null | undefined): string | undefined {
  if (typeof foco?.x !== 'number' || typeof foco?.y !== 'number') return undefined
  return `${foco.x}% ${foco.y}%`
}

/**
 * Estilos para mostrar la foto con su recorte dentro de un marco con
 * overflow-hidden: la foto mide `ancho`% del marco y su punto fijo queda en
 * ese mismo punto del marco. Con el recorte de cobertura da el mismo resultado
 * que object-cover con object-position.
 */
export function estiloRecorte(recorte: RecorteFoto): CSSProperties {
  return {
    width: `${recorte.ancho}%`,
    height: 'auto',
    left: `${recorte.x}%`,
    top: `${recorte.y}%`,
    right: 'auto',
    bottom: 'auto',
    transform: `translate(${-recorte.x}%, ${-recorte.y}%)`,
  }
}

/** Tamaño en que se muestra la foto dentro del marco, en píxeles */
export function tamanoDesplegado(
  recorte: { ancho: number | null } | null,
  marco: { ancho: number; alto: number },
  foto: { ancho: number; alto: number }
): { ancho: number; alto: number } {
  if (foto.ancho <= 0 || foto.alto <= 0 || marco.ancho <= 0 || marco.alto <= 0) return { ancho: 0, alto: 0 }
  // Sin acercar, la foto se escala para cubrir el marco entero (object-cover)
  const escala =
    recorte?.ancho != null
      ? ((recorte.ancho / 100) * marco.ancho) / foto.ancho
      : Math.max(marco.ancho / foto.ancho, marco.alto / foto.alto)
  return { ancho: foto.ancho * escala, alto: foto.alto * escala }
}

/** Cuánto se puede mover la foto dentro del marco, en píxeles por eje (0 si no sobra) */
export function margenMovimiento(
  desplegado: { ancho: number; alto: number },
  marco: { ancho: number; alto: number }
): { x: number; y: number } {
  return { x: Math.max(0, desplegado.ancho - marco.ancho), y: Math.max(0, desplegado.alto - marco.alto) }
}

const dentroDeRango = (v: number) => Math.min(100, Math.max(0, v))

/**
 * Punto fijo tras arrastrar la foto dx píxeles a la derecha y dy hacia abajo:
 * la foto se mueve, el punto fijo no. En un eje donde la foto no sobra el
 * marco, arrastrarla no cambia nada (ese recorte no tiene dónde moverse).
 */
export function arrastrarFoco(
  foco: FocoPortada,
  dx: number,
  dy: number,
  margen: { x: number; y: number }
): FocoPortada {
  return {
    x: margen.x > 0 ? dentroDeRango(Math.round(foco.x - (dx / margen.x) * 100)) : foco.x,
    y: margen.y > 0 ? dentroDeRango(Math.round(foco.y - (dy / margen.y) * 100)) : foco.y,
  }
}
