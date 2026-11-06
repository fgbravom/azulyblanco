'use client'

import { useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { ChevronLeft, Droplets, Pause, Play, Plus, SkipForward, Trophy, Volume2, VolumeX, X } from 'lucide-react'
import type { Rutina } from '@/lib/data/entrenamiento'
import { armarPasos, esTemporizado, formatoTiempo, type Paso, type Siguiente } from '@/lib/rutina/pasos'
import { entrarPaso, reducirEntrenamiento, segundosRestantes } from '@/lib/rutina/estado'
import { desbloquearAudio, pitido, silenciarAudio, vibrar } from '@/lib/rutina/avisos'
import { VideoEjercicio } from './VideoEjercicio'
import { cn } from '@/lib/utils'

// Los botones "Empezar rutina" de la página avisan con este evento: así pueden
// estar en cualquier parte de la página sin compartir estado de React
const EVENTO_ABRIR = 'rutina:abrir'
// Abrir el modo agrega una entrada al historial: el botón atrás del celular lo
// cierra en vez de salir de la página
const HASH = '#entrenar'

export function BotonEmpezar({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR))} className={className}>
      {children}
    </button>
  )
}

function Anillo({ fraccion, children }: { fraccion: number; children: ReactNode }) {
  const radio = 54
  const circunferencia = 2 * Math.PI * radio
  const acotada = Math.min(Math.max(fraccion, 0), 1)
  return (
    <div className="relative mx-auto aspect-square w-56 max-w-[65vw] sm:w-64">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radio} fill="none" strokeWidth="7" className="stroke-white/10" />
        <circle
          cx="60"
          cy="60"
          r={radio}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - acotada)}
          className="stroke-azul-brillante transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

function PuntosSeries({ total, actual }: { total: number; actual: number }) {
  return (
    <div className="flex justify-center gap-2" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 rounded-full transition-all',
            i + 1 < actual ? 'w-6 bg-azul-brillante' : i + 1 === actual ? 'w-10 bg-white' : 'w-6 bg-white/20',
          )}
        />
      ))}
    </div>
  )
}

function AContinuacion({ siguiente }: { siguiente: Siguiente }) {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-white/50">A continuación</p>
      <p className="font-semibold">{siguiente.titulo}</p>
      {siguiente.detalle && <p className="text-sm text-azul-cielo">{siguiente.detalle}</p>}
    </div>
  )
}

function etiquetaBloque(paso: Paso, rutina: Rutina): string {
  switch (paso.tipo) {
    case 'calentamiento':
      return 'Calentamiento'
    case 'serie':
      return `Ejercicio ${paso.indiceEjercicio + 1} de ${rutina.ejercicios.length}`
    case 'descanso':
      return 'Descanso'
    case 'estiramiento':
      return `Estiramiento ${paso.indiceEstiramiento + 1} de ${rutina.estiramientos.length}`
    case 'pausa':
      return 'Estiramientos'
    case 'fin':
      return 'Rutina completa'
  }
}

export function ModoEntrenamiento({ rutina }: { rutina: Rutina }) {
  const pasos = useMemo(() => armarPasos(rutina), [rutina])
  const [abierto, setAbierto] = useState(false)
  const [silencio, setSilencio] = useState(false)
  const [confirmarSalida, setConfirmarSalida] = useState(false)
  const [estado, despachar] = useReducer(
    (e: ReturnType<typeof entrarPaso>, a: Parameters<typeof reducirEntrenamiento>[2]) => reducirEntrenamiento(pasos, e, a),
    null,
    () => entrarPaso(pasos, 0, 0),
  )

  const paso = pasos[estado.indice]
  const restante = segundosRestantes(estado)
  const segundoEntero = Math.ceil(restante)
  const enPausa = estado.restantePausado !== null
  const corriendo = abierto && estado.finEn !== null

  // Abrir desde cualquier BotonEmpezar
  useEffect(() => {
    const abrir = () => {
      despachar({ tipo: 'ir', indice: 0, ahora: Date.now() })
      setConfirmarSalida(false)
      setAbierto(true)
      if (window.location.hash !== HASH) window.history.pushState(null, '', HASH)
    }
    // Una recarga con #entrenar deja la página normal, sin el modo abierto
    if (window.location.hash === HASH) window.history.replaceState(null, '', window.location.pathname)
    window.addEventListener(EVENTO_ABRIR, abrir)
    return () => window.removeEventListener(EVENTO_ABRIR, abrir)
  }, [])

  // El botón atrás (o cerrar, que hace history.back) saca el #entrenar y cierra el modo
  useEffect(() => {
    if (!abierto) return
    const alVolver = () => {
      if (window.location.hash !== HASH) setAbierto(false)
    }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [abierto])

  // Sin scroll de la página de fondo mientras se entrena
  useEffect(() => {
    if (!abierto) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [abierto])

  // Pantalla siempre encendida durante la rutina (Chrome, Safari 16.4+)
  useEffect(() => {
    if (!abierto || !('wakeLock' in navigator)) return
    let bloqueo: WakeLockSentinel | null = null
    let vigente = true
    const pedir = async () => {
      try {
        const nuevo = await navigator.wakeLock.request('screen')
        if (vigente) bloqueo = nuevo
        else void nuevo.release()
      } catch {
        // Batería baja o pestaña oculta: se reintenta al volver
      }
    }
    const alVolverVisible = () => {
      if (document.visibilityState === 'visible') void pedir()
    }
    void pedir()
    document.addEventListener('visibilitychange', alVolverVisible)
    return () => {
      vigente = false
      document.removeEventListener('visibilitychange', alVolverVisible)
      void bloqueo?.release()
    }
  }, [abierto])

  // Reloj: avanza solo al llegar a cero
  useEffect(() => {
    if (!corriendo) return
    const id = window.setInterval(() => despachar({ tipo: 'tick', ahora: Date.now() }), 250)
    return () => window.clearInterval(id)
  }, [corriendo])

  // Aviso al empezar a trabajar y al soltar un estiramiento
  useEffect(() => {
    if (!abierto) return
    if (paso.tipo === 'serie' || paso.tipo === 'estiramiento') {
      pitido(true)
      vibrar(250)
    } else if (paso.tipo === 'pausa') {
      pitido()
    } else if (paso.tipo === 'fin') {
      vibrar([150, 100, 150, 100, 300])
    }
  }, [abierto, paso])

  // Cuenta regresiva audible en los últimos tres segundos del descanso
  useEffect(() => {
    if (corriendo && paso.tipo === 'descanso' && segundoEntero >= 1 && segundoEntero <= 3) pitido()
  }, [corriendo, paso, segundoEntero])

  if (!abierto) return null

  const ir = (indice: number) => despachar({ tipo: 'ir', indice, ahora: Date.now() })
  const siguiente = () => ir(estado.indice + 1)
  const cerrar = () => {
    setConfirmarSalida(false)
    if (window.location.hash === HASH) window.history.back()
    else setAbierto(false)
  }
  const pedirSalida = () => {
    if (estado.indice === 0 || paso.tipo === 'fin') cerrar()
    else setConfirmarSalida(true)
  }
  const alternarSilencio = () => {
    silenciarAudio(!silencio)
    setSilencio(!silencio)
  }

  const progreso = estado.indice / (pasos.length - 1)
  const temporizado = esTemporizado(paso)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Rutina: ${rutina.titulo}`}
      className="fixed inset-0 z-[100] flex h-dvh flex-col bg-azul-profundo text-white"
    >
      {/* Barra superior: salir, en qué parte va y sonido */}
      <div className="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={pedirSalida}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Salir de la rutina"
          >
            <X className="h-6 w-6" />
          </button>
          <p className="truncate text-sm font-semibold uppercase tracking-wider text-azul-cielo">{etiquetaBloque(paso, rutina)}</p>
          <button
            type="button"
            onClick={alternarSilencio}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
            aria-label={silencio ? 'Activar sonido' : 'Silenciar'}
            aria-pressed={silencio}
          >
            {silencio ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-azul-claro transition-[width] duration-500"
            style={{ width: `${progreso * 100}%` }}
          />
        </div>
      </div>

      {/* Contenido del paso */}
      <div key={estado.indice} className="paso-entrada flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-5 text-center">
          {paso.tipo === 'calentamiento' && (
            <>
              <h2 className="text-3xl font-bold">Primero, calienta</h2>
              <p className="text-lg text-azul-pastel">{rutina.calentamiento}</p>
              <ul className="list-disc space-y-2 rounded-2xl bg-white/5 py-4 pr-4 pl-8 text-left text-sm text-white/80 marker:text-azul-brillante">
                <li>Ten agua a mano.</li>
                <li>Los descansos corren solos y suenan al terminar.</li>
                <li>Cuando termines cada serie, toca &quot;Serie lista&quot;.</li>
              </ul>
            </>
          )}

          {paso.tipo === 'serie' && (
            <>
              <VideoEjercicio id={paso.ejercicio.video} titulo={paso.ejercicio.nombre} />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-azul-brillante">
                  Serie {paso.serie} de {paso.ejercicio.series}
                </p>
                <h2 className="mt-1 text-3xl font-bold leading-tight">{paso.ejercicio.nombre}</h2>
                {paso.ejercicio.alias && <p className="text-sm text-white/60">{paso.ejercicio.alias}</p>}
              </div>
              <p className="mx-auto rounded-full bg-white px-5 py-2 text-xl font-bold text-azul-primario">
                {paso.ejercicio.objetivo}
              </p>
              <PuntosSeries total={paso.ejercicio.series} actual={paso.serie} />
              {paso.ejercicio.aviso && (
                <p className="rounded-xl bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-200">{paso.ejercicio.aviso}</p>
              )}
              <details className="group rounded-2xl bg-white/5 text-left">
                <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-azul-cielo">
                  Cómo se hace <span className="float-right transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="space-y-3 px-4 pb-4 text-sm text-white/80">
                  <p>{paso.ejercicio.descripcion}</p>
                  <p>
                    <span className="font-semibold text-white">Variante: </span>
                    {paso.ejercicio.variante}
                  </p>
                </div>
              </details>
            </>
          )}

          {paso.tipo === 'descanso' && (
            <>
              <h2 className="text-3xl font-bold">Descansa</h2>
              <Anillo fraccion={restante / paso.segundos}>
                <span className="text-6xl font-bold tabular-nums" aria-hidden="true">
                  {formatoTiempo(restante)}
                </span>
                {enPausa && <span className="mt-1 text-sm uppercase tracking-wider text-azul-cielo">En pausa</span>}
              </Anillo>
              <button
                type="button"
                onClick={() => despachar({ tipo: 'sumar', segundos: 30, ahora: Date.now() })}
                className="mx-auto flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                <Plus className="h-4 w-4" /> 30 s
              </button>
              <AContinuacion siguiente={paso.siguiente} />
              <p className="flex items-center justify-center gap-2 text-sm text-azul-pastel">
                <Droplets className="h-4 w-4" /> Aprovecha de tomar agua
              </p>
            </>
          )}

          {paso.tipo === 'estiramiento' && (
            <>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-azul-brillante">
                  {paso.lado ? `Lado ${paso.lado}, repetición ` : 'Repetición '}
                  {paso.repeticion} de {paso.estiramiento.repeticiones}
                </p>
                <h2 className="mt-1 text-3xl font-bold leading-tight">{paso.estiramiento.nombre}</h2>
              </div>
              <Anillo fraccion={restante / paso.segundos}>
                <span className="text-6xl font-bold tabular-nums" aria-hidden="true">
                  {Math.max(0, segundoEntero)}
                </span>
                <span className="mt-1 text-sm uppercase tracking-wider text-azul-cielo">{enPausa ? 'En pausa' : 'Mantén'}</span>
              </Anillo>
              <p className="text-azul-pastel">{paso.estiramiento.descripcion}</p>
              <details className="rounded-2xl bg-white/5 text-left">
                <summary className="cursor-pointer list-none px-4 py-3 text-center font-semibold text-azul-cielo">Ver video</summary>
                <div className="px-3 pb-3">
                  <VideoEjercicio id={paso.estiramiento.video} titulo={`Estiramiento de ${paso.estiramiento.nombre}`} />
                </div>
              </details>
            </>
          )}

          {paso.tipo === 'pausa' && (
            <>
              <h2 className="text-3xl font-bold">Suelta y respira</h2>
              <Anillo fraccion={restante / paso.segundos}>
                <span className="text-6xl font-bold tabular-nums" aria-hidden="true">
                  {Math.max(0, segundoEntero)}
                </span>
              </Anillo>
              <AContinuacion siguiente={paso.siguiente} />
            </>
          )}

          {paso.tipo === 'fin' && (
            <>
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-azul-claro/20">
                <Trophy className="h-10 w-10 text-azul-brillante" />
              </span>
              <h2 className="text-3xl font-bold">¡Rutina completa!</h2>
              <p className="text-lg text-azul-pastel">
                {rutina.ejercicios.length} ejercicios y {rutina.estiramientos.length} estiramientos. Buen trabajo.
              </p>
              <p className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm">
                <Droplets className="h-4 w-4 shrink-0 text-azul-brillante" /> Ahora hidrátate bien.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Lector de pantalla: solo anuncia el cambio de paso, no cada segundo */}
      <p className="sr-only" aria-live="polite">
        {paso.tipo === 'serie'
          ? `${paso.ejercicio.nombre}, serie ${paso.serie} de ${paso.ejercicio.series}: ${paso.ejercicio.objetivo}`
          : paso.tipo === 'descanso'
            ? `Descanso de ${formatoTiempo(paso.segundos)}`
            : paso.tipo === 'estiramiento'
              ? `${paso.estiramiento.nombre}${paso.lado ? `, lado ${paso.lado}` : ''}: mantén ${paso.segundos} segundos`
              : paso.tipo === 'fin'
                ? 'Rutina completa'
                : ''}
      </p>

      {/* Controles */}
      <div className="shrink-0 border-t border-white/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => ir(estado.indice - 1)}
            disabled={estado.indice === 0}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-30"
            aria-label="Paso anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {paso.tipo === 'calentamiento' && (
            <button
              type="button"
              onClick={() => {
                desbloquearAudio()
                siguiente()
              }}
              className="h-14 flex-1 rounded-full bg-azul-claro text-lg font-bold hover:bg-azul-brillante active:scale-[0.98]"
            >
              Empezar
            </button>
          )}
          {paso.tipo === 'serie' && (
            <button
              type="button"
              onClick={siguiente}
              className="h-14 flex-1 rounded-full bg-azul-claro text-lg font-bold hover:bg-azul-brillante active:scale-[0.98]"
            >
              Serie lista
            </button>
          )}
          {temporizado && (
            <button
              type="button"
              onClick={() => despachar({ tipo: enPausa ? 'reanudar' : 'pausar', ahora: Date.now() })}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-white text-lg font-bold text-azul-primario active:scale-[0.98]"
            >
              {enPausa ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
              {enPausa ? 'Seguir' : 'Pausa'}
            </button>
          )}
          {paso.tipo === 'fin' && (
            <button
              type="button"
              onClick={cerrar}
              className="h-14 flex-1 rounded-full bg-azul-claro text-lg font-bold hover:bg-azul-brillante active:scale-[0.98]"
            >
              Terminar
            </button>
          )}

          {paso.tipo !== 'fin' && paso.tipo !== 'calentamiento' && (
            <button
              type="button"
              onClick={siguiente}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
              aria-label="Saltar este paso"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {confirmarSalida && (
        <div className="absolute inset-0 z-10 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div role="alertdialog" aria-labelledby="titulo-salir" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center text-gray-900">
            <h3 id="titulo-salir" className="text-lg font-bold">¿Salir de la rutina?</h3>
            <p className="mt-1 text-sm text-gray-600">Se pierde el avance de esta sesión.</p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setConfirmarSalida(false)}
                className="h-12 rounded-full bg-azul-primario font-semibold text-white hover:bg-azul-oscuro"
              >
                Seguir entrenando
              </button>
              <button type="button" onClick={cerrar} className="h-12 rounded-full font-semibold text-red-600 hover:bg-red-50">
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
