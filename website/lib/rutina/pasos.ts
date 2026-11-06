import type { Ejercicio, Estiramiento, Movilidad, Rutina } from '@/lib/data/entrenamiento'

// Secuencia que recorre el modo entrenamiento, paso a paso. Salvo la pantalla
// inicial, todo corre con temporizador y avanza solo al llegar a cero: el
// jugador deja el celular apoyado y entrena guiado por los pitidos.

export type Lado = 'derecho' | 'izquierdo'

/** Lo que viene después de un descanso o una pausa */
export interface Siguiente {
  titulo: string
  detalle: string | null
  /** Video y explicación, cuando lo que viene es un ejercicio o estiramiento nuevo */
  video?: { id: string; titulo: string; descripcion: string }
}

export type Paso =
  | { tipo: 'inicio' }
  | { tipo: 'movilidad'; bloque: Movilidad; indiceBloque: number; segundos: number; siguiente: Siguiente | null }
  | { tipo: 'serie'; ejercicio: Ejercicio; indiceEjercicio: number; serie: number; lado: Lado | null; segundos: number }
  | { tipo: 'cambio'; segundos: number; siguiente: Siguiente }
  | { tipo: 'descanso'; segundos: number; siguiente: Siguiente; titulo: 'Descansa' | 'Prepárate' }
  | {
      tipo: 'estiramiento'
      estiramiento: Estiramiento
      indiceEstiramiento: number
      repeticion: number
      lado: Lado | null
      segundos: number
    }
  | { tipo: 'pausa'; segundos: number; siguiente: Siguiente }
  | { tipo: 'fin' }

export type PasoTemporizado = Extract<Paso, { segundos: number }>

/** Pausa antes del primer ejercicio y antes de los estiramientos, para ponerse en posición */
export const TRANSICION = 30
/** Tiempo para cambiar de pierna en los ejercicios que se hacen por lado */
export const CAMBIO_DE_PIERNA = 10

const LADOS: Lado[] = ['derecho', 'izquierdo']

export function nombrePierna(lado: Lado) {
  return lado === 'derecho' ? 'Pierna derecha' : 'Pierna izquierda'
}

function siguienteSerie(ejercicio: Ejercicio, serie: number, lado: Lado | null, conVideo: boolean): Siguiente {
  const detalle = `Serie ${serie} de ${ejercicio.series}${lado ? ` · ${nombrePierna(lado).toLowerCase()}` : ''}`
  return {
    titulo: ejercicio.nombre,
    detalle,
    video: conVideo ? { id: ejercicio.video, titulo: ejercicio.nombre, descripcion: ejercicio.descripcion } : undefined,
  }
}

function siguienteEstiramiento(estiramiento: Estiramiento, lado: Lado | null, conVideo: boolean): Siguiente {
  return {
    titulo: `Estiramiento: ${estiramiento.nombre}`,
    detalle: lado ? `Lado ${lado}` : null,
    video: conVideo
      ? { id: estiramiento.video, titulo: `Estiramiento de ${estiramiento.nombre}`, descripcion: estiramiento.descripcion }
      : undefined,
  }
}

export function armarPasos(rutina: Rutina): Paso[] {
  const pasos: Paso[] = [{ tipo: 'inicio' }]
  const primerEjercicio = rutina.ejercicios[0]
  const primerLado = (e: Ejercicio) => (e.porLado ? LADOS[0] : null)

  // Calentamiento guiado: bloques cortos de movilidad, uno tras otro
  rutina.movilidad.forEach((bloque, indiceBloque) => {
    const proximo = rutina.movilidad[indiceBloque + 1]
    pasos.push({
      tipo: 'movilidad',
      bloque,
      indiceBloque,
      segundos: bloque.segundos,
      siguiente: proximo ? { titulo: proximo.nombre, detalle: null } : null,
    })
  })
  if (primerEjercicio) {
    pasos.push({
      tipo: 'descanso',
      titulo: 'Prepárate',
      segundos: TRANSICION,
      siguiente: siguienteSerie(primerEjercicio, 1, primerLado(primerEjercicio), true),
    })
  }

  // Bloques de estiramiento: con porLado se completan las repeticiones de un lado y luego las del otro
  const bloques = rutina.estiramientos.flatMap((estiramiento, indiceEstiramiento) =>
    (estiramiento.porLado ? LADOS : [null]).flatMap((lado) =>
      Array.from({ length: estiramiento.repeticiones }, (_, i) => ({
        estiramiento,
        indiceEstiramiento,
        lado,
        repeticion: i + 1,
      })),
    ),
  )

  rutina.ejercicios.forEach((ejercicio, indiceEjercicio) => {
    for (let serie = 1; serie <= ejercicio.series; serie++) {
      // Por lado: pierna derecha, cambio, pierna izquierda; si no, un solo bloque
      if (ejercicio.porLado) {
        pasos.push({ tipo: 'serie', ejercicio, indiceEjercicio, serie, lado: 'derecho', segundos: ejercicio.trabajo })
        pasos.push({
          tipo: 'cambio',
          segundos: CAMBIO_DE_PIERNA,
          siguiente: { titulo: nombrePierna('izquierdo'), detalle: ejercicio.nombre },
        })
        pasos.push({ tipo: 'serie', ejercicio, indiceEjercicio, serie, lado: 'izquierdo', segundos: ejercicio.trabajo })
      } else {
        pasos.push({ tipo: 'serie', ejercicio, indiceEjercicio, serie, lado: null, segundos: ejercicio.trabajo })
      }

      const proximoEjercicio = rutina.ejercicios[indiceEjercicio + 1]
      if (serie < ejercicio.series) {
        pasos.push({
          tipo: 'descanso',
          titulo: 'Descansa',
          segundos: ejercicio.descanso,
          siguiente: siguienteSerie(ejercicio, serie + 1, primerLado(ejercicio), false),
        })
      } else if (proximoEjercicio) {
        pasos.push({
          tipo: 'descanso',
          titulo: 'Descansa',
          segundos: ejercicio.descanso,
          siguiente: siguienteSerie(proximoEjercicio, 1, primerLado(proximoEjercicio), true),
        })
      } else if (bloques.length > 0) {
        const primero = bloques[0]
        pasos.push({
          tipo: 'descanso',
          titulo: 'Prepárate',
          segundos: TRANSICION,
          siguiente: siguienteEstiramiento(primero.estiramiento, primero.lado, true),
        })
      }
    }
  })

  bloques.forEach((bloque, i) => {
    pasos.push({ tipo: 'estiramiento', ...bloque, segundos: bloque.estiramiento.mantener })
    const siguiente = bloques[i + 1]
    if (siguiente) {
      pasos.push({
        tipo: 'pausa',
        segundos: bloque.estiramiento.pausa,
        siguiente: siguienteEstiramiento(siguiente.estiramiento, siguiente.lado, false),
      })
    }
  })

  pasos.push({ tipo: 'fin' })
  return pasos
}

/** Pasos que avanzan solos cuando el temporizador llega a cero */
export function esTemporizado(paso: Paso): paso is PasoTemporizado {
  return 'segundos' in paso
}

/** Segundos de todos los pasos desde `desde` (incluido) hasta el final */
export function segundosDesde(pasos: Paso[], desde = 0): number {
  return pasos.slice(desde).reduce((total, paso) => total + (esTemporizado(paso) ? paso.segundos : 0), 0)
}

/** Duración completa de la rutina, en minutos redondeados */
export function duracionMinutos(rutina: Rutina): number {
  return Math.round(segundosDesde(armarPasos(rutina)) / 60)
}

/** "2:05" a partir de segundos; redondea hacia arriba para no mostrar 0:00 antes de tiempo */
export function formatoTiempo(segundos: number): string {
  const total = Math.max(0, Math.ceil(segundos))
  const minutos = Math.floor(total / 60)
  return `${minutos}:${String(total % 60).padStart(2, '0')}`
}
