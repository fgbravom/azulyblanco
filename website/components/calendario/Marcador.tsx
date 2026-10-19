import Image from 'next/image'
import { EventoCalendario, type GolPartido } from '@/lib/types/calendario'
import { desenlaceAYB, type EquipoPartido } from '@/lib/utils/calendario'
import { cn } from '@/lib/utils'

const DESENLACE = {
  victoria: { label: 'Victoria', clase: 'bg-green-50 text-green-700' },
  empate: { label: 'Empate', clase: 'bg-gray-100 text-gray-700' },
  derrota: { label: 'Derrota', clase: 'bg-red-50 text-red-700' },
}

function Escudo({ equipo, compacto }: { equipo: EquipoPartido; compacto: boolean }) {
  const caja = compacto ? 'h-12 w-12' : 'h-16 w-16'
  const circulo = compacto ? 'h-[42px] w-[42px]' : 'h-14 w-14'
  if (equipo.esAYB) {
    return (
      <div className={cn('relative', caja)}>
        <Image src="/images/escudoazulyblanco.png" alt={equipo.nombre} fill sizes="64px" className="object-contain" />
      </div>
    )
  }
  return (
    <div className={cn('flex items-center justify-center', caja)}>
      {equipo.logo ? (
        <div className={cn('overflow-hidden rounded-full', circulo)}>
          <Image src={equipo.logo} alt={equipo.nombre} width={56} height={56} sizes="56px" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className={cn('flex items-center justify-center rounded-full bg-gray-100', circulo)}>
          <span className={cn('font-bold text-gray-400', compacto ? 'text-xs' : 'text-sm')}>
            {equipo.sigla.substring(0, 3).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

function Equipo({ equipo, compacto }: { equipo: EquipoPartido; compacto: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <Escudo equipo={equipo} compacto={compacto} />
      <div className="min-w-0">
        <p className={cn('break-words font-bold leading-tight text-azul-primario', compacto ? 'text-[13px]' : 'text-sm')}>
          {equipo.nombre}
        </p>
        {equipo.detalle && <p className="mt-0.5 text-xs text-gray-500">{equipo.detalle}</p>}
      </div>
    </div>
  )
}

/** Goleadores de un equipo, uno por gol, con su asistencia debajo */
function Goleadores({ goles }: { goles: GolPartido[] }) {
  if (goles.length === 0) return null
  return (
    <ul className="mt-3 space-y-1.5 text-center" aria-label="Goles">
      {goles.map((g, i) => (
        <li key={i} className="leading-tight">
          <p className="text-xs font-semibold text-gray-800">
            {/* Sin autor: autogol del rival. Con autor: autogol de un jugador de AYB, bajo el rival */}
            {g.enContra ? (g.autor ? `${g.autor} (autogol)` : 'Autogol') : g.autor}
          </p>
          {g.asistencia && <p className="text-[11px] text-gray-500">Asist. {g.asistencia}</p>}
        </li>
      ))}
    </ul>
  )
}

interface MarcadorProps {
  evento: EventoCalendario
  equipos: { local: EquipoPartido; visitante: EquipoPartido }
  /** Escudos y marcador más chicos, para las tarjetas de la lista */
  compacto?: boolean
  className?: string
}

/** Local, resultado (o VS y hora) y visita, alineados sobre el mismo eje central. Sin `compacto`, con los goleadores bajo cada equipo. */
export function Marcador({ evento, equipos, compacto = false, className }: MarcadorProps) {
  const desenlace = evento.tipo === 'partido' ? desenlaceAYB(evento) : undefined
  const goles = !compacto && evento.resultado ? evento.goles ?? [] : []

  return (
    <div className={cn('grid grid-cols-[1fr_auto_1fr] items-start gap-3', className)}>
      <div>
        <Equipo equipo={equipos.local} compacto={compacto} />
        <Goleadores goles={goles.filter((g) => g.lado === 'local')} />
      </div>
      <div className={cn('flex flex-col items-center gap-1.5', compacto ? 'pt-2' : 'pt-4')}>
        {evento.resultado ? (
          <>
            <span
              className={cn(
                'whitespace-nowrap font-black tabular-nums text-azul-primario',
                compacto ? 'text-2xl' : 'text-3xl'
              )}
            >
              {evento.resultado.local} – {evento.resultado.visitante}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Final</span>
            {desenlace && (
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', DESENLACE[desenlace].clase)}>
                {DESENLACE[desenlace].label}
              </span>
            )}
          </>
        ) : (
          <>
            <span className={cn('font-bold text-gray-400', compacto ? 'text-base' : 'text-xl')}>VS</span>
            {evento.horaInicio && (
              <span className="whitespace-nowrap text-xs font-semibold text-gray-600">{evento.horaInicio} hrs</span>
            )}
          </>
        )}
      </div>
      <div>
        <Equipo equipo={equipos.visitante} compacto={compacto} />
        <Goleadores goles={goles.filter((g) => g.lado === 'visitante')} />
      </div>
    </div>
  )
}
