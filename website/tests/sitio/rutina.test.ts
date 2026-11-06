import { describe, expect, it } from 'vitest'
import { RUTINA_EN_CASA } from '@/lib/data/entrenamiento'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { armarPasos, duracionMinutos, esTemporizado, formatoTiempo, segundosDesde, type Paso } from '@/lib/rutina/pasos'
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
  it('empieza con la pantalla de inicio, sigue con el calentamiento guiado y termina con el fin', () => {
    expect(pasos[0].tipo).toBe('inicio')
    expect(pasos.slice(1, 1 + rutina.movilidad.length).every((p) => p.tipo === 'movilidad')).toBe(true)
    expect(pasos[1 + rutina.movilidad.length]).toMatchObject({ tipo: 'descanso', titulo: 'Prepárate', segundos: 30 })
    expect(pasos.at(-1)?.tipo).toBe('fin')
  })

  it('todo corre con temporizador salvo el inicio y el fin', () => {
    expect(pasos.filter((p) => !esTemporizado(p)).map((p) => p.tipo)).toEqual(['inicio', 'fin'])
  })

  it('cada serie dura el tiempo de trabajo; los ejercicios por lado van con cada pierna y un cambio entre medio', () => {
    const bloquesDeTrabajo = rutina.ejercicios.reduce((total, e) => total + e.series * (e.porLado ? 2 : 1), 0)
    expect(contar('serie')).toBe(bloquesDeTrabajo)
    const porLado = rutina.ejercicios.filter((e) => e.porLado)
    expect(porLado.length).toBeGreaterThan(0)
    expect(contar('cambio')).toBe(porLado.reduce((total, e) => total + e.series, 0))

    const pistol = pasos.findIndex((p) => p.tipo === 'serie' && p.ejercicio.id === 'pistol-squat-silla')
    expect(pasos.slice(pistol, pistol + 3)).toMatchObject([
      { tipo: 'serie', lado: 'derecho', serie: 1, segundos: 30 },
      { tipo: 'cambio', segundos: 10 },
      { tipo: 'serie', lado: 'izquierdo', serie: 1, segundos: 30 },
    ])
    expect(pasos.find((p) => p.tipo === 'serie')).toMatchObject({ lado: null, segundos: 40 })
  })

  it('descansa después de cada serie, menos de la última antes de estirar, que tiene una transición corta', () => {
    const series = rutina.ejercicios.reduce((total, e) => total + e.series, 0)
    const descansos = pasos.filter((p): p is Extract<Paso, { tipo: 'descanso' }> => p.tipo === 'descanso')
    // Una transición antes del primer ejercicio + un descanso tras cada serie
    expect(descansos).toHaveLength(series + 1)
    expect(descansos.at(-1)).toMatchObject({ segundos: 30, titulo: 'Prepárate' })
    expect(descansos.slice(1, -1).every((d) => d.segundos === 90 && d.titulo === 'Descansa')).toBe(true)
  })

  it('el descanso anuncia lo que viene y muestra el video solo cuando cambia el ejercicio', () => {
    const descansos = pasos.filter((p): p is Extract<Paso, { tipo: 'descanso' }> => p.tipo === 'descanso')
    expect(descansos[0].siguiente).toMatchObject({ titulo: 'Saltos laterales', detalle: 'Serie 1 de 4', video: { id: 'LyRRekZLJPw' } })
    expect(descansos[1].siguiente).toMatchObject({ titulo: 'Saltos laterales', detalle: 'Serie 2 de 4' })
    expect(descansos[1].siguiente.video).toBeUndefined()
    expect(descansos[4].siguiente).toMatchObject({ titulo: 'Puente de glúteo', detalle: 'Serie 1 de 4', video: { id: 'oDXM-a-gBt8' } })
    expect(descansos.at(-1)?.siguiente.video).toBeDefined()
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

  it('la duración sale de sumar los pasos y queda cerca de una hora', () => {
    expect(segundosDesde(pasos)).toBe(segundosDesde(pasos, 1))
    expect(duracionMinutos(rutina)).toBe(Math.round(segundosDesde(pasos) / 60))
    expect(duracionMinutos(rutina)).toBeGreaterThanOrEqual(55)
    expect(duracionMinutos(rutina)).toBeLessThanOrEqual(70)
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
  const indiceDescanso = pasos.findIndex((p) => p.tipo === 'descanso' && p.titulo === 'Descansa')

  it('la pantalla de inicio no corre sola: espera a que el jugador empiece', () => {
    const estado = entrarPaso(pasos, 0, 0)
    expect(estado.finEn).toBeNull()
    expect(reducir(estado, { tipo: 'tick', ahora: 999_999 }).indice).toBe(0)
  })

  it('una serie corre sola y al terminar pasa al descanso', () => {
    const indiceSerie = pasos.findIndex((p) => p.tipo === 'serie')
    let estado = entrarPaso(pasos, indiceSerie, 0)
    estado = reducir(estado, { tipo: 'tick', ahora: 40_000 })
    expect(pasos[estado.indice].tipo).toBe('descanso')
  })

  it('el descanso cuenta hacia atrás y al llegar a cero pasa al siguiente', () => {
    let estado = entrarPaso(pasos, indiceDescanso, 1_000)
    estado = reducir(estado, { tipo: 'tick', ahora: 31_000 })
    expect(segundosRestantes(estado)).toBe(60)
    estado = reducir(estado, { tipo: 'tick', ahora: 91_000 })
    expect(estado.indice).toBe(indiceDescanso + 1)
  })

  it('la pausa congela el tiempo y al seguir continúa donde quedó', () => {
    let estado = entrarPaso(pasos, indiceDescanso, 0)
    estado = reducir(estado, { tipo: 'pausar', ahora: 20_000 })
    expect(segundosRestantes(estado)).toBe(70)
    estado = reducir(estado, { tipo: 'tick', ahora: 500_000 })
    expect(estado.indice).toBe(indiceDescanso)
    estado = reducir(estado, { tipo: 'reanudar', ahora: 600_000 })
    estado = reducir(estado, { tipo: 'tick', ahora: 610_000 })
    expect(segundosRestantes(estado)).toBe(60)
  })

  it('+30 s alarga el descanso, también en pausa', () => {
    let estado = entrarPaso(pasos, indiceDescanso, 0)
    estado = reducir(estado, { tipo: 'sumar', segundos: 30, ahora: 0 })
    expect(segundosRestantes(estado)).toBe(120)
    estado = reducir(estado, { tipo: 'pausar', ahora: 0 })
    estado = reducir(estado, { tipo: 'sumar', segundos: 30, ahora: 0 })
    expect(segundosRestantes(estado)).toBe(150)
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
