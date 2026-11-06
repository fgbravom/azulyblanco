import { describe, expect, it } from 'vitest'
import { RUTINA_EN_CASA } from '@/lib/data/entrenamiento'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { armarPasos, formatoTiempo, type Paso } from '@/lib/rutina/pasos'
import { entrarPaso, reducirEntrenamiento, segundosRestantes } from '@/lib/rutina/estado'
import { litrosDiarios } from '@/components/rutina/CalculadoraAgua'

const rutina = RUTINA_EN_CASA
const pasos = armarPasos(rutina)
const contar = (tipo: Paso['tipo']) => pasos.filter((p) => p.tipo === tipo).length

describe('datos de la rutina', () => {
  it('el menú principal lleva a /entrenamiento', () => {
    expect(NAVIGATION_ITEMS.find((item) => item.title === 'ENTRENAMIENTO')?.href).toBe('/entrenamiento')
  })

  it('cada ejercicio y estiramiento tiene un id de YouTube válido y único', () => {
    const videos = [...rutina.ejercicios, ...rutina.estiramientos].map((e) => e.video)
    for (const id of videos) expect(id).toMatch(/^[A-Za-z0-9_-]{11}$/)
    expect(new Set(videos).size).toBe(videos.length)
  })

  it('respeta la pauta: 6 ejercicios, el último de 3 series y sin carga', () => {
    expect(rutina.ejercicios).toHaveLength(6)
    expect(rutina.ejercicios.slice(0, 5).every((e) => e.series === 4)).toBe(true)
    expect(rutina.ejercicios[5].series).toBe(3)
    expect(rutina.ejercicios[5].aviso).toMatch(/no agregues carga/i)
  })
})

describe('armarPasos', () => {
  it('empieza con el calentamiento y termina con el fin', () => {
    expect(pasos[0].tipo).toBe('calentamiento')
    expect(pasos.at(-1)?.tipo).toBe('fin')
  })

  it('arma una serie por cada serie de cada ejercicio', () => {
    expect(contar('serie')).toBe(rutina.ejercicios.reduce((total, e) => total + e.series, 0))
  })

  it('descansa después de cada serie, menos de la última antes de estirar, que tiene una transición corta', () => {
    expect(contar('descanso')).toBe(contar('serie'))
    const descansos = pasos.filter((p): p is Extract<Paso, { tipo: 'descanso' }> => p.tipo === 'descanso')
    expect(descansos.at(-1)?.segundos).toBe(30)
    expect(descansos.slice(0, -1).every((d) => d.segundos === 120)).toBe(true)
  })

  it('el descanso anuncia lo que viene', () => {
    const i = pasos.findIndex((p) => p.tipo === 'descanso')
    expect(pasos[i]).toMatchObject({ siguiente: { titulo: 'Saltos laterales', detalle: 'Serie 2 de 4' } })
    const ultimaSerieDelPrimero = pasos.findIndex((p) => p.tipo === 'serie' && p.indiceEjercicio === 0 && p.serie === 4)
    expect(pasos[ultimaSerieDelPrimero + 1]).toMatchObject({ siguiente: { titulo: 'Puente de glúteo', detalle: 'Serie 1 de 4' } })
  })

  it('los estiramientos por lado se repiten con cada pierna, el resto una vez', () => {
    const esperado = rutina.estiramientos.reduce((total, e) => total + e.repeticiones * (e.porLado ? 2 : 1), 0)
    expect(contar('estiramiento')).toBe(esperado)
    // Pausa entre cada repetición, no después de la última
    expect(contar('pausa')).toBe(esperado - 1)
    const gluteos = pasos.filter((p) => p.tipo === 'estiramiento' && p.estiramiento.id === 'gluteos')
    expect(gluteos.map((p) => p.tipo === 'estiramiento' && `${p.lado} ${p.repeticion}`)).toEqual([
      'derecho 1',
      'derecho 2',
      'derecho 3',
      'izquierdo 1',
      'izquierdo 2',
      'izquierdo 3',
    ])
  })
})

describe('formatoTiempo', () => {
  it('muestra minutos y segundos, redondeando hacia arriba', () => {
    expect(formatoTiempo(120)).toBe('2:00')
    expect(formatoTiempo(65)).toBe('1:05')
    expect(formatoTiempo(0.2)).toBe('0:01')
    expect(formatoTiempo(-3)).toBe('0:00')
  })
})

describe('reloj del modo entrenamiento', () => {
  const reducir = (e: ReturnType<typeof entrarPaso>, a: Parameters<typeof reducirEntrenamiento>[2]) =>
    reducirEntrenamiento(pasos, e, a)
  const indiceDescanso = pasos.findIndex((p) => p.tipo === 'descanso')

  it('una serie no corre sola: espera a que el jugador la cierre', () => {
    const estado = entrarPaso(pasos, 1, 0)
    expect(estado.finEn).toBeNull()
    expect(reducir(estado, { tipo: 'tick', ahora: 999_999 }).indice).toBe(1)
  })

  it('el descanso cuenta hacia atrás y al llegar a cero pasa al siguiente', () => {
    let estado = entrarPaso(pasos, indiceDescanso, 1_000)
    estado = reducir(estado, { tipo: 'tick', ahora: 31_000 })
    expect(segundosRestantes(estado)).toBe(90)
    estado = reducir(estado, { tipo: 'tick', ahora: 121_000 })
    expect(estado.indice).toBe(indiceDescanso + 1)
  })

  it('la pausa congela el tiempo y al seguir continúa donde quedó', () => {
    let estado = entrarPaso(pasos, indiceDescanso, 0)
    estado = reducir(estado, { tipo: 'pausar', ahora: 20_000 })
    expect(segundosRestantes(estado)).toBe(100)
    estado = reducir(estado, { tipo: 'tick', ahora: 500_000 })
    expect(estado.indice).toBe(indiceDescanso)
    estado = reducir(estado, { tipo: 'reanudar', ahora: 600_000 })
    estado = reducir(estado, { tipo: 'tick', ahora: 610_000 })
    expect(segundosRestantes(estado)).toBe(90)
  })

  it('+30 s alarga el descanso, también en pausa', () => {
    let estado = entrarPaso(pasos, indiceDescanso, 0)
    estado = reducir(estado, { tipo: 'sumar', segundos: 30, ahora: 0 })
    expect(segundosRestantes(estado)).toBe(150)
    estado = reducir(estado, { tipo: 'pausar', ahora: 0 })
    estado = reducir(estado, { tipo: 'sumar', segundos: 30, ahora: 0 })
    expect(segundosRestantes(estado)).toBe(180)
  })

  it('no se sale de la lista al ir más allá de los extremos', () => {
    expect(entrarPaso(pasos, -1, 0).indice).toBe(0)
    expect(entrarPaso(pasos, pasos.length + 5, 0).indice).toBe(pasos.length - 1)
  })
})

describe('litrosDiarios', () => {
  it('aplica peso × 35 ml, como el ejemplo de la pauta (75 kg = 2,6 L)', () => {
    expect(litrosDiarios(75, 35, 2)).toBeCloseTo(2.625)
  })

  it('nunca recomienda menos de 2 litros', () => {
    expect(litrosDiarios(50, 35, 2)).toBe(2)
  })
})
