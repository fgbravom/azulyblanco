"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EventoCalendario } from '@/lib/types/calendario'
import { cn } from '@/lib/utils'
import { ListaPorDia } from './ListaEventos'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const COLOR_TIPO = {
  partido: 'bg-azul-primario',
  evento: 'bg-purple-500',
  entrenamiento: 'bg-gray-400',
} as const

const CHIP_TIPO = {
  partido: 'border-azul-primario bg-azul-primario/5 text-azul-oscuro',
  evento: 'border-purple-500 bg-purple-50 text-purple-800',
  entrenamiento: 'border-gray-400 bg-gray-100 text-gray-700',
} as const

function nombreCorto(evento: EventoCalendario) {
  if (evento.tipo === 'partido') return evento.rival || 'Partido'
  if (evento.tipo === 'evento') return evento.titulo || 'Evento'
  return evento.actividad || 'Entrenamiento'
}

/** "2026-10" + 7 → "2026-10-07" */
function fechaDelMes(mes: string, dia: number) {
  return `${mes}-${String(dia).padStart(2, '0')}`
}

interface CalendarioGridProps {
  eventos: EventoCalendario[]
  hoy: string
  onAbrir: (evento: EventoCalendario) => void
}

/**
 * Vista de mes: grilla con puntos por actividad en mobile y nombres abreviados en escritorio.
 * Debajo van las tarjetas del mes completo, o solo las del día elegido en la grilla.
 */
export function CalendarioGrid({ eventos, hoy, onAbrir }: CalendarioGridProps) {
  const [mes, setMes] = useState(() => hoy.slice(0, 7)) // "2026-10"
  const [diaElegido, setDiaElegido] = useState<string | null>(null)

  const [anio, numeroMes] = mes.split('-').map(Number)
  const diasEnMes = new Date(anio, numeroMes, 0).getDate()
  // Lunes primero (estándar chileno): getDay() da 0 = domingo
  const desfase = (new Date(anio, numeroMes - 1, 1).getDay() + 6) % 7
  const celdas: (number | null)[] = [
    ...Array<null>(desfase).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ]
  while (celdas.length % 7 !== 0) celdas.push(null)

  const delMes = eventos.filter((e) => e.fecha.startsWith(`${mes}-`))
  const porDia = (fecha: string) => delMes.filter((e) => e.fecha === fecha)
  const visibles = diaElegido ? porDia(diaElegido) : delMes

  const moverMes = (paso: number) => {
    const destino = new Date(anio, numeroMes - 1 + paso, 1)
    setMes(`${destino.getFullYear()}-${String(destino.getMonth() + 1).padStart(2, '0')}`)
    setDiaElegido(null)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => moverMes(-1)}
          aria-label="Mes anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-azul-primario transition-colors hover:bg-azul-primario hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-azul-primario md:text-2xl" aria-live="polite">
          {MESES[numeroMes - 1]} {anio}
        </h2>
        <button
          type="button"
          onClick={() => moverMes(1)}
          aria-label="Mes siguiente"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-azul-primario transition-colors hover:bg-azul-primario hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="py-3 text-center text-xs font-semibold uppercase text-gray-500">
              <span className="md:hidden">{dia.charAt(0)}</span>
              <span className="hidden md:inline">{dia}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {celdas.map((dia, i) => {
            const fueraDeFila = i % 7 === 6 ? '' : 'border-r'
            if (!dia) return <div key={i} className={cn('border-b border-gray-100 bg-gray-50/60', fueraDeFila)} />

            const fecha = fechaDelMes(mes, dia)
            const delDia = porDia(fecha)
            const elegido = diaElegido === fecha
            const esHoy = fecha === hoy

            return (
              <button
                key={i}
                type="button"
                disabled={delDia.length === 0}
                aria-pressed={elegido}
                aria-label={`${dia} de ${MESES[numeroMes - 1].toLowerCase()}${delDia.length ? `, ${delDia.length} actividades` : ''}`}
                onClick={() => setDiaElegido(elegido ? null : fecha)}
                className={cn(
                  'flex min-h-14 flex-col items-center gap-1 border-b border-gray-100 p-1 transition-colors md:min-h-28 md:items-stretch md:p-2',
                  fueraDeFila,
                  delDia.length > 0 && 'hover:bg-azul-primario/5',
                  elegido && 'bg-azul-primario/10 hover:bg-azul-primario/10'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm md:self-end',
                    esHoy ? 'bg-azul-primario font-bold text-white' : delDia.length ? 'font-semibold text-gray-900' : 'text-gray-400'
                  )}
                >
                  {dia}
                </span>

                {/* Mobile: un punto por actividad */}
                {delDia.length > 0 && (
                  <span className="flex gap-0.5 md:hidden">
                    {delDia.slice(0, 3).map((e) => (
                      <span key={e.id} className={cn('h-1.5 w-1.5 rounded-full', COLOR_TIPO[e.tipo])} />
                    ))}
                  </span>
                )}

                {/* Escritorio: nombre abreviado con hora o resultado */}
                <span className="hidden w-full space-y-1 text-left md:block">
                  {delDia.slice(0, 2).map((e) => (
                    <span key={e.id} className={cn('block rounded border-l-2 px-1.5 py-0.5 text-[11px] leading-tight', CHIP_TIPO[e.tipo])}>
                      <span className="block truncate font-medium">{nombreCorto(e)}</span>
                      {e.resultado ? (
                        <span className="font-bold tabular-nums">{e.resultado.local} – {e.resultado.visitante}</span>
                      ) : (
                        e.horaInicio && <span className="opacity-75">{e.horaInicio} hrs</span>
                      )}
                    </span>
                  ))}
                  {delDia.length > 2 && (
                    <span className="block px-1.5 text-[11px] text-gray-500">+{delDia.length - 2} más</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className={cn('h-2 w-2 rounded-full', COLOR_TIPO.partido)} />Partido</span>
        <span className="flex items-center gap-1.5"><span className={cn('h-2 w-2 rounded-full', COLOR_TIPO.evento)} />Evento especial</span>
        <span className="flex items-center gap-1.5"><span className={cn('h-2 w-2 rounded-full', COLOR_TIPO.entrenamiento)} />Entrenamiento</span>
      </div>

      <div className="mt-10">
        {diaElegido && (
          <button
            type="button"
            onClick={() => setDiaElegido(null)}
            className="mb-4 text-sm font-medium text-azul-claro hover:underline"
          >
            Ver todo {MESES[numeroMes - 1].toLowerCase()}
          </button>
        )}
        {visibles.length > 0 ? (
          <ListaPorDia eventos={visibles} hoy={hoy} onAbrir={onAbrir} />
        ) : (
          <p className="py-10 text-center text-gray-500">Sin actividades en {MESES[numeroMes - 1].toLowerCase()}</p>
        )}
      </div>
    </div>
  )
}
