'use client'

import { useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import {
  ArrowLeftRight,
  ChevronLeft,
  Droplets,
  Pause,
  Play,
  Plus,
  Smartphone,
  SkipForward,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import type { Rutina } from '@/lib/data/entrenamiento'
import {
  armarPasos,
  esTemporizado,
  formatoTiempo,
  nombrePierna,
  segundosDesde,
  type Paso,
  type Siguiente,
} from '@/lib/rutina/pasos'
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

// Pasos que avisan los últimos segundos con un pitido corto por segundo (5, 4, 3, 2, 1)
const SEGUNDOS_CUENTA_REGRESIVA = 5
const CON_CUENTA_REGRESIVA: Paso['tipo'][] = ['descanso', 'serie', 'cambio']

export function BotonEmpezar({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        // El toque del usuario habilita el audio en el celular desde el primer paso
        desbloquearAudio()
        window.dispatchEvent(new Event(EVENTO_ABRIR))
      }}
      className={className}
    >
      {children}
    </button>
  )
}

/** Segundos sueltos bajo un minuto ("40"), minutos y segundos desde ahí ("1:30") */
function reloj(segundos: number) {
  return segundos < 60 ? String(Math.max(0, Math.ceil(segundos))) : formatoTiempo(segundos)
}

function Anillo({
  fraccion,
  chico = false,
  trazo = 'stroke-azul-brillante',
  children,
}: {
  fraccion: number
  chico?: boolean
  trazo?: string
  children: ReactNode
}) {
  const radio = 54
  const circunferencia = 2 * Math.PI * radio
  const acotada = Math.min(Math.max(fraccion, 0), 1)
  return (
    <div className={cn('relative mx-auto aspect-square', chico ? 'w-40 sm:w-44' : 'w-56 max-w-[65vw] sm:w-64')}>
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
          className={cn(trazo, 'transition-[stroke-dashoffset] duration-300 ease-linear')}
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
            i + 1 < actual ? 'w-6 bg-white/70' : i + 1 === actual ? 'w-10 bg-white' : 'w-6 bg-white/20',
          )}
        />
      ))}
    </div>
  )
}

function AContinuacion({ siguiente }: { siguiente: Siguiente }) {
  return (
    <div className="space-y-3 rounded-2xl bg-white/5 px-4 py-3 text-left">
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-white/50">A continuación</p>
        <p className="text-lg font-semibold">{siguiente.titulo}</p>
        {siguiente.detalle && <p className="text-sm text-azul-cielo">{siguiente.detalle}</p>}
      </div>
      {siguiente.video && (
        <>
          <VideoEjercicio id={siguiente.video.id} titulo={siguiente.video.titulo} />
          <p className="text-sm text-white/80">{siguiente.video.descripcion}</p>
        </>
      )}
    </div>
  )
}

function etiquetaBloque(paso: Paso, rutina: Rutina): string {
  switch (paso.tipo) {
    case 'inicio':
      return 'Antes de empezar'
    case 'movilidad':
      return `Calentamiento ${paso.indiceBloque + 1} de ${rutina.movilidad.length}`
    case 'serie':
      return `Ejercicio ${paso.indiceEjercicio + 1} de ${rutina.ejercicios.length}`
    case 'cambio':
      return 'Cambio de pierna'
    case 'descanso':
      return paso.titulo === 'Prepárate' ? 'Prepárate' : 'Descanso'
    case 'estiramiento':
      return `Estiramiento ${paso.indiceEstiramiento + 1} de ${rutina.estiramientos.length}`
    case 'pausa':
      return 'Estiramientos'
    case 'fin':
      return 'Rutina completa'
  }
}

/** Lo que anuncia el lector de pantalla al cambiar de paso */
function anuncio(paso: Paso): string {
  switch (paso.tipo) {
    case 'movilidad':
      return `Calentamiento: ${paso.bloque.nombre}, ${paso.segundos} segundos`
    case 'serie':
      return `${paso.ejercicio.nombre}${paso.lado ? `, ${nombrePierna(paso.lado).toLowerCase()}` : ''}, serie ${paso.serie} de ${paso.ejercicio.series}: ${paso.segundos} segundos`
    case 'cambio':
      return 'Cambia de pierna'
    case 'descanso':
      return `${paso.titulo}: ${formatoTiempo(paso.segundos)}`
    case 'estiramiento':
      return `${paso.estiramiento.nombre}${paso.lado ? `, lado ${paso.lado}` : ''}: mantén ${paso.segundos} segundos`
    case 'fin':
      return 'Rutina completa'
    default:
      return ''
  }
}

export function ModoEntrenamiento({ rutina }: { rutina: Rutina }) {
  const pasos = useMemo(() => armarPasos(rutina), [rutina])
  const total = useMemo(() => segundosDesde(pasos), [pasos])
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

  // Avisos al cambiar de paso: pitido largo para trabajar, doble para descansar,
  // corto para las transiciones (calentamiento, cambio de pierna, soltar un estiramiento)
  useEffect(() => {
    if (!abierto) return
    switch (paso.tipo) {
      case 'serie':
      case 'estiramiento':
        pitido(true)
        vibrar(250)
        break
      case 'descanso':
        pitido(true, 2)
        vibrar([200, 100, 200])
        break
      case 'movilidad':
      case 'cambio':
      case 'pausa':
        pitido()
        vibrar(100)
        break
      case 'fin':
        pitido(true, 3)
        vibrar([150, 100, 150, 100, 300])
        break
    }
  }, [abierto, paso])

  // Cuenta regresiva audible en los últimos segundos
  useEffect(() => {
    if (corriendo && CON_CUENTA_REGRESIVA.includes(paso.tipo) && segundoEntero >= 1 && segundoEntero <= SEGUNDOS_CUENTA_REGRESIVA) pitido()
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
  const empezar = (indice: number) => {
    desbloquearAudio()
    ir(indice)
  }

  const temporizado = esTemporizado(paso)
  const pendiente = (temporizado ? restante : 0) + segundosDesde(pasos, estado.indice + 1)
  const progreso = 1 - pendiente / total
  const minutosPendientes = Math.ceil(pendiente / 60)
  const trabajando = paso.tipo === 'serie'
  const indicePrimerEjercicio = pasos.findIndex((p) => p.tipo === 'descanso')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Rutina: ${rutina.titulo}`}
      className={cn(
        'fixed inset-0 z-[100] flex h-dvh flex-col text-white transition-colors duration-500',
        trabajando && !enPausa ? 'bg-azul-medio' : 'bg-azul-profundo',
      )}
    >
      {/* Barra superior: salir, en qué parte va, cuánto falta y sonido */}
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
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold uppercase tracking-wider text-white/80">
              {etiquetaBloque(paso, rutina)}
            </p>
            {paso.tipo !== 'inicio' && paso.tipo !== 'fin' && (
              <p className="text-xs text-white/60">
                {minutosPendientes <= 1 ? 'Queda menos de 1 min' : `Quedan ${minutosPendientes} min`}
              </p>
            )}
          </div>
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
          <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${progreso * 100}%` }} />
        </div>
      </div>

      {/* Contenido del paso */}
      <div key={estado.indice} className="paso-entrada flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-5 text-center">
          {paso.tipo === 'inicio' && (
            <>
              <div>
                <h2 className="text-3xl font-bold">Así funciona</h2>
                <p className="mt-2 text-lg text-azul-pastel">
                  {Math.round(total / 60)} minutos que corren solos: no tienes que tocar nada.
                </p>
              </div>
              <ul className="space-y-3 rounded-2xl bg-white/5 p-4 text-left text-sm text-white/85">
                <li className="flex gap-3">
                  <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-azul-brillante" />
                  <span>Deja el celular apoyado donde puedas verlo y con el volumen arriba. En iPhone, quita el modo silencio.</span>
                </li>
                <li className="flex gap-3">
                  <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-azul-brillante" />
                  <span>
                    <strong className="text-white">Cuenta regresiva de 5 segundos y pitido largo:</strong> ¡a trabajar!{' '}
                    <strong className="text-white">Cuenta regresiva y doble pitido:</strong> terminó la serie, descansa.
                  </span>
                </li>
                <li className="flex gap-3">
                  <ArrowLeftRight className="mt-0.5 h-5 w-5 shrink-0 text-azul-brillante" />
                  <span>En los ejercicios de una pierna, te avisa cuándo cambiar.</span>
                </li>
                <li className="flex gap-3">
                  <Droplets className="mt-0.5 h-5 w-5 shrink-0 text-azul-brillante" />
                  <span>Ten agua a mano. En cada descanso ves el video del ejercicio que sigue.</span>
                </li>
              </ul>
              <p className="text-sm text-white/60">
                Parte con {Math.round(segundosDesde(pasos.slice(1, indicePrimerEjercicio)) / 60)} minutos de calentamiento
                guiado.
              </p>
            </>
          )}

          {paso.tipo === 'movilidad' && (
            <>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-azul-brillante">Calentamiento</p>
                <h2 className="mt-1 text-3xl font-bold leading-tight">{paso.bloque.nombre}</h2>
              </div>
              <Anillo fraccion={restante / paso.segundos}>
                <span className="text-6xl font-bold tabular-nums" aria-hidden="true">
                  {reloj(restante)}
                </span>
                {enPausa && <span className="mt-1 text-sm uppercase tracking-wider text-azul-cielo">En pausa</span>}
              </Anillo>
              <p className="text-lg text-azul-pastel">{paso.bloque.indicacion}</p>
              {paso.siguiente && <p className="text-sm text-white/50">Después: {paso.siguiente.titulo}</p>}
            </>
          )}

          {paso.tipo === 'serie' && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Serie {paso.serie} de {paso.ejercicio.series}
                </p>
                <PuntosSeries total={paso.ejercicio.series} actual={paso.serie} />
                <h2 className="pt-1 text-3xl font-bold leading-tight">{paso.ejercicio.nombre}</h2>
                {paso.lado && (
                  <p className="mx-auto w-fit rounded-full bg-white px-5 py-1.5 text-lg font-bold text-azul-primario">
                    {nombrePierna(paso.lado)}
                  </p>
                )}
              </div>
              <Anillo fraccion={restante / paso.segundos} trazo="stroke-white">
                <span className="text-7xl font-bold tabular-nums" aria-hidden="true">
                  {reloj(restante)}
                </span>
                <span className="mt-1 text-sm font-semibold uppercase tracking-wider text-white/80">
                  {enPausa ? 'En pausa' : '¡Dale!'}
                </span>
              </Anillo>
              <p className="text-white/80">
                Referencia: {paso.ejercicio.referencia}
                {paso.lado ? ' con esta pierna' : ''}. Prioriza la buena técnica.
              </p>
              {paso.ejercicio.aviso && (
                <p className="rounded-xl bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-100">{paso.ejercicio.aviso}</p>
              )}
              <details className="group rounded-2xl bg-white/10 text-left">
                <summary className="cursor-pointer list-none px-4 py-3 font-semibold">
                  Cómo se hace <span className="float-right transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="space-y-3 px-4 pb-4 text-sm text-white/85">
                  <VideoEjercicio id={paso.ejercicio.video} titulo={paso.ejercicio.nombre} />
                  <p>{paso.ejercicio.descripcion}</p>
                  <p>
                    <span className="font-semibold text-white">Variante: </span>
                    {paso.ejercicio.variante}
                  </p>
                </div>
              </details>
            </>
          )}

          {paso.tipo === 'cambio' && (
            <>
              <h2 className="text-3xl font-bold">Cambia de pierna</h2>
              <Anillo fraccion={restante / paso.segundos}>
                <span className="text-6xl font-bold tabular-nums" aria-hidden="true">
                  {reloj(restante)}
                </span>
                {enPausa && <span className="mt-1 text-sm uppercase tracking-wider text-azul-cielo">En pausa</span>}
              </Anillo>
              <AContinuacion siguiente={paso.siguiente} />
            </>
          )}

          {paso.tipo === 'descanso' && (
            <>
              <h2 className="text-3xl font-bold">{paso.titulo}</h2>
              <Anillo fraccion={restante / paso.segundos} chico={Boolean(paso.siguiente.video)}>
                <span
                  className={cn('font-bold tabular-nums', paso.siguiente.video ? 'text-5xl' : 'text-6xl')}
                  aria-hidden="true"
                >
                  {reloj(restante)}
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
              {paso.titulo === 'Descansa' && (
                <p className="flex items-center justify-center gap-2 text-sm text-azul-pastel">
                  <Droplets className="h-4 w-4" /> Aprovecha de tomar agua
                </p>
              )}
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
        {anuncio(paso)}
      </p>

      {/* Controles */}
      <div className="shrink-0 border-t border-white/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {paso.tipo === 'inicio' && indicePrimerEjercicio > 1 && (
          <button
            type="button"
            onClick={() => empezar(indicePrimerEjercicio)}
            className="mx-auto mb-2 block rounded-full px-4 py-1 text-sm font-semibold text-azul-cielo hover:bg-white/10"
          >
            Ya calenté: ir a los ejercicios
          </button>
        )}
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

          {paso.tipo === 'inicio' && (
            <button
              type="button"
              onClick={() => empezar(1)}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-azul-claro text-lg font-bold hover:bg-azul-brillante active:scale-[0.98]"
            >
              <Play className="h-5 w-5 fill-current" /> Empezar
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

          {paso.tipo !== 'fin' && paso.tipo !== 'inicio' && (
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
