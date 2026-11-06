import type { Ejercicio, Estiramiento, Rutina } from '@/lib/data/entrenamiento'

// Secuencia que recorre el modo entrenamiento, paso a paso. Las series las cierra
// el jugador ("Serie lista"); descansos y estiramientos corren con temporizador
// y avanzan solos al llegar a cero.

export type Lado = 'derecho' | 'izquierdo'

/** Lo que viene después de un descanso o una pausa: nombre y detalle en otra línea */
export interface Siguiente {
  titulo: string
  detalle: string | null
}

export type Paso =
  | { tipo: 'calentamiento' }
  | { tipo: 'serie'; ejercicio: Ejercicio; indiceEjercicio: number; serie: number }
  | { tipo: 'descanso'; segundos: number; siguiente: Siguiente }
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

/** Pausa entre el último ejercicio y los estiramientos, para cambiar de posición */
const TRANSICION_ESTIRAMIENTOS = 30

const LADOS: Lado[] = ['derecho', 'izquierdo']

function nombreSerie(ejercicio: Ejercicio, serie: number): Siguiente {
  return { titulo: ejercicio.nombre, detalle: `Serie ${serie} de ${ejercicio.series}` }
}

function nombreEstiramiento(estiramiento: Estiramiento, lado: Lado | null): Siguiente {
  return { titulo: `Estiramiento: ${estiramiento.nombre}`, detalle: lado ? `Lado ${lado}` : null }
}

export function armarPasos(rutina: Rutina): Paso[] {
  const pasos: Paso[] = [{ tipo: 'calentamiento' }]

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
      pasos.push({ tipo: 'serie', ejercicio, indiceEjercicio, serie })

      const siguienteEjercicio = rutina.ejercicios[indiceEjercicio + 1]
      if (serie < ejercicio.series) {
        pasos.push({ tipo: 'descanso', segundos: ejercicio.descanso, siguiente: nombreSerie(ejercicio, serie + 1) })
      } else if (siguienteEjercicio) {
        pasos.push({ tipo: 'descanso', segundos: ejercicio.descanso, siguiente: nombreSerie(siguienteEjercicio, 1) })
      } else if (bloques.length > 0) {
        const primero = bloques[0]
        pasos.push({
          tipo: 'descanso',
          segundos: TRANSICION_ESTIRAMIENTOS,
          siguiente: nombreEstiramiento(primero.estiramiento, primero.lado),
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
        siguiente: nombreEstiramiento(siguiente.estiramiento, siguiente.lado),
      })
    }
  })

  pasos.push({ tipo: 'fin' })
  return pasos
}

/** Pasos que avanzan solos cuando el temporizador llega a cero */
export function esTemporizado(paso: Paso): paso is Extract<Paso, { segundos: number }> {
  return paso.tipo === 'descanso' || paso.tipo === 'pausa' || paso.tipo === 'estiramiento'
}

/** "2:05" a partir de segundos; redondea hacia arriba para no mostrar 0:00 antes de tiempo */
export function formatoTiempo(segundos: number): string {
  const total = Math.max(0, Math.ceil(segundos))
  const minutos = Math.floor(total / 60)
  return `${minutos}:${String(total % 60).padStart(2, '0')}`
}
