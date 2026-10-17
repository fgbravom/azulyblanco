import { MapPin } from 'lucide-react'
import { EventoCalendario } from '@/lib/types/calendario'
import { agruparPorDia, equiposDeEvento, fechaLarga } from '@/lib/utils/calendario'
import { TIPO } from './DetalleEvento'
import { Marcador } from './Marcador'

/** "2026-10-18" → "2026-10-19" */
function diaSiguiente(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia + 1)).toISOString().slice(0, 10)
}

export function TarjetaEvento({ evento, onAbrir }: { evento: EventoCalendario; onAbrir: () => void }) {
  const equipos = equiposDeEvento(evento)
  const tipo = TIPO[evento.tipo]
  const etiqueta = evento.tipo === 'partido' ? evento.tipoPartido || 'Partido' : tipo.label
  const horario = evento.horaInicio && `${evento.horaInicio}${evento.horaFin ? ` - ${evento.horaFin}` : ''} hrs`

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="flex h-full w-full flex-col rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-claro"
    >
      <div className="mb-4 flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 truncate">
          <span className="font-bold uppercase text-azul-primario">{etiqueta}</span>
          {evento.series && evento.series.length > 0 && (
            <span className="text-gray-500"> · {evento.series.join(' · ')}</span>
          )}
        </span>
        {!evento.confirmado && (
          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">Por confirmar</span>
        )}
      </div>

      {equipos ? (
        <Marcador evento={evento} equipos={equipos} compacto className="flex-1" />
      ) : (
        <div className="flex flex-1 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-azul-primario/5 text-azul-primario">
            <tipo.icono className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-bold leading-snug text-azul-primario">
              {evento.tipo === 'evento' ? evento.titulo || 'Evento especial' : evento.actividad || 'Entrenamiento'}
            </p>
            {horario && <p className="mt-0.5 text-sm text-gray-600">{horario}</p>}
          </div>
        </div>
      )}

      {evento.estadio && (
        <p className="mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{evento.estadio}</span>
        </p>
      )}
    </button>
  )
}

interface ListaPorDiaProps {
  eventos: EventoCalendario[]
  hoy: string
  onAbrir: (evento: EventoCalendario) => void
}

/** Eventos ya ordenados, bajo un título por día ("Domingo 18 de octubre", con Hoy/Mañana) */
export function ListaPorDia({ eventos, hoy, onAbrir }: ListaPorDiaProps) {
  const manana = diaSiguiente(hoy)
  const anioActual = hoy.slice(0, 4)

  return (
    <div className="space-y-10">
      {agruparPorDia(eventos).map(({ fecha, eventos: delDia }) => {
        const relativo = fecha === hoy ? 'Hoy' : fecha === manana ? 'Mañana' : null
        return (
          <section key={fecha} aria-labelledby={`dia-${fecha}`}>
            <h2 id={`dia-${fecha}`} className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-azul-primario md:text-xl">
                {fechaLarga(delDia[0])}
                {fecha.slice(0, 4) !== anioActual && ` de ${fecha.slice(0, 4)}`}
              </span>
              {relativo && (
                <span className="rounded-full bg-azul-claro/10 px-2.5 py-0.5 text-xs font-semibold text-azul-claro">
                  {relativo}
                </span>
              )}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {delDia.map((evento) => (
                <TarjetaEvento key={evento.id} evento={evento} onAbrir={() => onAbrir(evento)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
