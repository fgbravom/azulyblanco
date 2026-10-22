/**
 * Encuadre de la portada de una noticia: la parte de la foto que se ve al
 * recortarla. Va de 0 a 100 en cada eje y se aplica como object-position en el
 * artículo, el listado y las tarjetas del inicio (50/50 es el centro).
 */

export interface FocoPortada {
  x: number
  y: number
}

/** Encuadre sin ajustar: el centro de la foto */
export const FOCO_CENTRO: FocoPortada = { x: 50, y: 50 }

/** Recorte automático de las fichas de persona (object-top): desde arriba */
export const FOCO_ARRIBA: FocoPortada = { x: 50, y: 0 }

/** Encuadre guardado en la base, o null si la foto está sin ajustar */
export function focoDe(x: number | null | undefined, y: number | null | undefined): FocoPortada | null {
  return typeof x === 'number' && typeof y === 'number' ? { x, y } : null
}

/** Valor de object-position para el encuadre, p. ej. "35% 80%".
 *  Undefined si no hay encuadre (una foto sin ajustar o una fila anterior a la migración). */
export function posicionCSS(foco: { x?: number | null; y?: number | null } | null | undefined): string | undefined {
  if (typeof foco?.x !== 'number' || typeof foco?.y !== 'number') return undefined
  return `${foco.x}% ${foco.y}%`
}

/** Qué tanto sobresale la foto al cubrir el marco, en píxeles por eje (0 si no sobra) */
export function desbordeImagen(
  anchoFoto: number,
  altoFoto: number,
  anchoMarco: number,
  altoMarco: number
): { x: number; y: number } {
  if (anchoFoto <= 0 || altoFoto <= 0 || anchoMarco <= 0 || altoMarco <= 0) return { x: 0, y: 0 }
  // object-cover escala la foto para cubrir el marco entero
  const escala = Math.max(anchoMarco / anchoFoto, altoMarco / altoFoto)
  return {
    x: Math.max(0, anchoFoto * escala - anchoMarco),
    y: Math.max(0, altoFoto * escala - altoMarco),
  }
}

const dentroDeRango = (v: number) => Math.min(100, Math.max(0, v))

/**
 * Encuadre tras arrastrar la foto dx píxeles a la derecha y dy hacia abajo:
 * la foto se mueve, el encuadre no. En un eje donde la foto no sobra el
 * marco, arrastrarla no cambia nada (ese recorte no tiene dónde moverse).
 */
export function arrastrarFoco(
  foco: FocoPortada,
  dx: number,
  dy: number,
  desborde: { x: number; y: number }
): FocoPortada {
  return {
    x: desborde.x > 0 ? dentroDeRango(Math.round(foco.x - (dx / desborde.x) * 100)) : foco.x,
    y: desborde.y > 0 ? dentroDeRango(Math.round(foco.y - (dy / desborde.y) * 100)) : foco.y,
  }
}
