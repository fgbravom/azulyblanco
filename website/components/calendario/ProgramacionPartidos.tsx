"use client"

import { useMemo, useState, useSyncExternalStore } from 'react'
import { CalendarDays, Trophy } from 'lucide-react'
import { EventoCalendario } from '@/lib/types/calendario'
import { getFechaHoy, separarProgramacion } from '@/lib/utils/calendario'
import { cn } from '@/lib/utils'
import { CalendarioGrid } from './CalendarioGrid'
import { DetalleEvento } from './DetalleEvento'
import { ListaPorDia } from './ListaEventos'

type Vista = 'proximos' | 'resultados' | 'mes'

const sinSuscripcion = () => () => {}

interface ProgramacionPartidosProps {
  eventos: EventoCalendario[]
  /** Fecha de hoy en Chile al renderizar en el servidor (YYYY-MM-DD) */
  hoy: string
}

/**
 * Página de partidos: pestañas de mes (por defecto), próximos y resultados sobre el fondo azul del hero.
 * Cada tarjeta abre el detalle de la actividad.
 */
export function ProgramacionPartidos({ eventos, hoy: hoyServidor }: ProgramacionPartidosProps) {
  // La página se genera de antemano: al hidratar se usa la fecha del servidor y luego la del navegador
  const hoy = useSyncExternalStore(sinSuscripcion, getFechaHoy, () => hoyServidor)
  const { proximos, jugados } = useMemo(() => separarProgramacion(eventos, hoy), [eventos, hoy])
  const [vista, setVista] = useState<Vista>('mes')
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null)

  const pestanas: { id: Vista; label: string; total?: number }[] = [
    { id: 'mes', label: 'Mes' },
    { id: 'proximos', label: 'Próximos', total: proximos.length },
    { id: 'resultados', label: 'Resultados', total: jugados.length },
  ]
  const lista = vista === 'proximos' ? proximos : jugados

  return (
    <>
      {/* Pestañas — continúan el fondo azul del hero */}
      <div className="bg-azul-primario px-4 pb-10">
        <div className="container mx-auto flex max-w-6xl flex-wrap justify-center gap-1.5 sm:gap-2">
          {pestanas.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={vista === p.id}
              onClick={() => setVista(p.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all sm:gap-2 sm:px-5',
                vista === p.id ? 'bg-white text-azul-primario shadow' : 'bg-white/15 text-white hover:bg-white/25'
              )}
            >
              {p.label}
              {p.total !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-xs tabular-nums',
                    vista === p.id ? 'bg-azul-primario/10' : 'bg-white/15'
                  )}
                >
                  {p.total}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-gray-50 px-4 py-10 md:py-14">
        <div className="container mx-auto max-w-6xl">
          {vista === 'mes' ? (
            <CalendarioGrid eventos={eventos} hoy={hoy} onAbrir={setEventoSeleccionado} />
          ) : lista.length > 0 ? (
            <ListaPorDia eventos={lista} hoy={hoy} onAbrir={setEventoSeleccionado} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-azul-primario/10">
                {vista === 'proximos' ? (
                  <CalendarDays className="h-8 w-8 text-azul-primario/40" />
                ) : (
                  <Trophy className="h-8 w-8 text-azul-primario/40" />
                )}
              </div>
              <p className="text-lg font-semibold text-gray-600">
                {vista === 'proximos' ? 'No hay partidos programados' : 'Aún no hay partidos jugados'}
              </p>
              <p className="mt-1 text-sm text-gray-400">Vuelve a revisar pronto</p>
            </div>
          )}
        </div>
      </section>

      {eventoSeleccionado && (
        <DetalleEvento key={eventoSeleccionado.id} evento={eventoSeleccionado} onCerrar={() => setEventoSeleccionado(null)} />
      )}
    </>
  )
}
