import { esTemporizado, type Paso } from './pasos'

// Estado del modo entrenamiento. El tiempo se guarda como la hora en que
// termina el paso (finEn) y no como un contador: si el celular suspende la
// pestaña, al volver el temporizador sigue en la hora correcta.

export interface EstadoEntrenamiento {
  indice: number
  /** Hora (ms) en que termina el paso temporizado; null si no corre o está en pausa */
  finEn: number | null
  /** Segundos que quedaban al pausar */
  restantePausado: number | null
  /** Última hora conocida; el render calcula lo que falta a partir de ella */
  ahora: number
}

export type AccionEntrenamiento =
  | { tipo: 'ir'; indice: number; ahora: number }
  | { tipo: 'tick'; ahora: number }
  | { tipo: 'pausar'; ahora: number }
  | { tipo: 'reanudar'; ahora: number }
  | { tipo: 'sumar'; segundos: number; ahora: number }

export function entrarPaso(pasos: Paso[], indice: number, ahora: number): EstadoEntrenamiento {
  const acotado = Math.min(Math.max(indice, 0), pasos.length - 1)
  const paso = pasos[acotado]
  return {
    indice: acotado,
    finEn: esTemporizado(paso) ? ahora + paso.segundos * 1000 : null,
    restantePausado: null,
    ahora,
  }
}

export function reducirEntrenamiento(
  pasos: Paso[],
  estado: EstadoEntrenamiento,
  accion: AccionEntrenamiento,
): EstadoEntrenamiento {
  switch (accion.tipo) {
    case 'ir':
      return entrarPaso(pasos, accion.indice, accion.ahora)
    case 'tick':
      if (estado.finEn !== null && accion.ahora >= estado.finEn) {
        return entrarPaso(pasos, estado.indice + 1, accion.ahora)
      }
      return { ...estado, ahora: accion.ahora }
    case 'pausar':
      if (estado.finEn === null) return estado
      return { ...estado, finEn: null, restantePausado: Math.max(0, (estado.finEn - accion.ahora) / 1000), ahora: accion.ahora }
    case 'reanudar':
      if (estado.restantePausado === null) return estado
      return { ...estado, finEn: accion.ahora + estado.restantePausado * 1000, restantePausado: null, ahora: accion.ahora }
    case 'sumar':
      if (estado.restantePausado !== null) {
        return { ...estado, restantePausado: estado.restantePausado + accion.segundos }
      }
      if (estado.finEn === null) return estado
      return { ...estado, finEn: estado.finEn + accion.segundos * 1000, ahora: accion.ahora }
  }
}

/** Segundos que faltan del paso actual (0 si no es temporizado) */
export function segundosRestantes(estado: EstadoEntrenamiento): number {
  if (estado.restantePausado !== null) return estado.restantePausado
  if (estado.finEn === null) return 0
  return Math.max(0, (estado.finEn - estado.ahora) / 1000)
}
