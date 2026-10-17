"use client"

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  Banknote, Clock, Dumbbell, ExternalLink, MapPin, MessageCircle, PartyPopper, Ticket, Trophy, Users, X,
} from 'lucide-react'
import { EventoCalendario } from '@/lib/types/calendario'
import { SITE_CONFIG } from '@/lib/constants'
import { equiposDeEvento, fechaLarga } from '@/lib/utils/calendario'
import { cn } from '@/lib/utils'
import { Marcador } from './Marcador'

const DURACION_MS = 300
// Arrastre hacia abajo (px) a partir del cual la hoja se cierra en mobile
const UMBRAL_CIERRE = 100

export const TIPO = {
  partido: { label: 'Partido', icono: Trophy },
  entrenamiento: { label: 'Entrenamiento', icono: Dumbbell },
  evento: { label: 'Evento especial', icono: PartyPopper },
} as const

function Fila({ icono: Icono, titulo, children }: { icono: typeof Clock; titulo: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-azul-primario/5 text-azul-primario">
        <Icono className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{titulo}</p>
        <div className="text-sm font-medium text-gray-900">{children}</div>
      </div>
    </li>
  )
}

interface DetalleEventoProps {
  evento: EventoCalendario
  onCerrar: () => void
}

/**
 * Detalle de una actividad del calendario: hoja que sube desde abajo en mobile
 * (se cierra también arrastrándola hacia abajo) y panel lateral en escritorio.
 * Se monta al elegir la actividad; anima la entrada y espera la salida antes de avisar.
 */
export function DetalleEvento({ evento, onCerrar }: DetalleEventoProps) {
  const [abierto, setAbierto] = useState(false)
  const [arrastre, setArrastre] = useState<number | null>(null)
  const inicioArrastre = useRef(0)
  const hoja = useRef<HTMLDivElement>(null)
  const cerrando = useRef(false)

  const cerrar = () => {
    if (cerrando.current) return
    cerrando.current = true
    setArrastre(null)
    setAbierto(false)
    setTimeout(onCerrar, DURACION_MS)
  }
  const cerrarRef = useRef(cerrar)
  useEffect(() => {
    cerrarRef.current = cerrar
  })

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Un frame después del montaje, para que la transición parta desde fuera de la pantalla
    const frame = requestAnimationFrame(() => {
      setAbierto(true)
      hoja.current?.focus({ preventScroll: true })
    })
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarRef.current()
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = overflow
      anterior?.focus?.({ preventScroll: true })
    }
  }, [])

  const tipo = TIPO[evento.tipo]
  const equipos = equiposDeEvento(evento)
  const fecha = fechaLarga(evento)
  const horario = evento.horaInicio && `${evento.horaInicio}${evento.horaFin ? ` - ${evento.horaFin}` : ''} hrs`
  // En los partidos los nombres ya están en el marcador: el título es la fecha
  const esPartido = evento.tipo === 'partido'
  const titulo =
    esPartido ? fecha
    : evento.tipo === 'evento' ? evento.titulo || 'Evento especial'
    : evento.actividad || 'Entrenamiento'
  const cuota = evento.llevar && evento.tipo !== 'evento' ? evento.llevar.replace('.', '') : null

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={cerrar}
        className={cn(
          'fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300',
          abierto ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div
        ref={hoja}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-evento-titulo"
        style={arrastre !== null ? { transform: `translateY(${arrastre}px)`, transition: 'none' } : undefined}
        className={cn(
          'fixed z-[71] flex flex-col bg-white shadow-2xl outline-none transition-transform duration-300 ease-out',
          // Mobile: hoja inferior
          'bottom-0 left-0 right-0 max-h-[85dvh] rounded-t-3xl',
          // Escritorio: panel lateral
          'md:left-auto md:top-0 md:max-h-none md:w-[420px] md:rounded-none',
          abierto ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
        )}
      >
        {/* Asa y encabezado: en mobile se arrastran hacia abajo para cerrar */}
        <div
          className="shrink-0 touch-none md:touch-auto"
          onTouchStart={(e) => {
            inicioArrastre.current = e.touches[0].clientY
            setArrastre(0)
          }}
          onTouchMove={(e) => setArrastre(Math.max(0, e.touches[0].clientY - inicioArrastre.current))}
          onTouchEnd={() => ((arrastre ?? 0) > UMBRAL_CIERRE ? cerrar() : setArrastre(null))}
        >
          <div className="flex justify-center pb-1 pt-3 md:hidden">
            <span className="h-1.5 w-10 rounded-full bg-gray-300" />
          </div>
          <div className="flex items-start gap-3 px-6 pb-4 pt-3 md:pt-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-azul-primario/5 text-azul-primario">
              <tipo.icono className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500">
                {tipo.label}
                {evento.tipoPartido ? ` · ${evento.tipoPartido}` : ''}
              </p>
              <h2 id="detalle-evento-titulo" className="text-lg font-bold leading-snug text-azul-primario">
                {titulo}
              </h2>
            </div>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="-mr-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Marcador */}
          {equipos && (
            <Marcador evento={evento} equipos={equipos} className="mb-5 rounded-2xl bg-gray-50 px-3 py-5" />
          )}

          {evento.tipo === 'evento' && evento.descripcion && (
            <p className="mb-5 text-sm leading-relaxed text-gray-600">{evento.descripcion}</p>
          )}

          {!evento.confirmado && (
            <p className="mb-5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              Por confirmar: la fecha u hora aún pueden cambiar.
            </p>
          )}

          <ul className="space-y-4">
            {esPartido ? (
              horario && <Fila icono={Clock} titulo="Hora">{horario}</Fila>
            ) : (
              <Fila icono={Clock} titulo="Fecha y hora">
                {fecha}
                {horario && ` · ${horario}`}
              </Fila>
            )}
            {evento.estadio && (
              <Fila icono={MapPin} titulo="Lugar">{evento.estadio}</Fila>
            )}
            {evento.series && evento.series.length > 0 && (
              <Fila icono={Users} titulo="Series">{evento.series.join(' · ')}</Fila>
            )}
            {cuota && (
              <Fila icono={Banknote} titulo="Cuota a llevar">${cuota}</Fila>
            )}
            {evento.precioEntrada && (
              <Fila icono={Ticket} titulo="Entrada">
                General: ${evento.precioEntrada.replace('.', '')}
                {evento.edadGratis && (
                  <span className="block text-green-700">{evento.edadGratis} no pagan</span>
                )}
              </Fila>
            )}
          </ul>

          {esPartido && evento.rivalSitioWeb && evento.rivalNombre && (
            <a
              href={evento.rivalSitioWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-azul-claro hover:underline"
            >
              Sitio de {evento.rivalNombre}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {esPartido && !evento.resultado && SITE_CONFIG.contact.whatsapp && (
            <Link
              href={`https://wa.me/${SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 font-semibold text-white shadow-lg transition-colors hover:bg-green-600"
            >
              <MessageCircle className="h-5 w-5" />
              Revisa la nómina
            </Link>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
