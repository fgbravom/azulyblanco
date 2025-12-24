"use client"

import { EventoCalendario } from '@/lib/types/calendario'
import { useMemo } from 'react'
import { obtenerProximosEventos } from '@/lib/utils/calendario'
import Image from 'next/image'

interface ProximosPartidosProps {
  eventos: EventoCalendario[]
  limite?: number
}

export function ProximosPartidos({ eventos, limite = 3 }: ProximosPartidosProps) {
  const proximosEventos = useMemo(() => {
    return obtenerProximosEventos(eventos, limite).filter(e => e.tipo === 'partido')
  }, [eventos, limite])

  const parseRival = (rivalText: string) => {
    // Formato esperado: "AYB VS RIVAL"
    const parts = rivalText.split(' VS ')
    if (parts.length === 2) {
      return {
        local: parts[0].trim(),
        visitante: parts[1].trim()
      }
    }
    return {
      local: 'AYB',
      visitante: rivalText
    }
  }

  const formatearFecha = (fecha: string, dia: string) => {
    const date = new Date(fecha + 'T12:00:00')
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return {
      mes: meses[date.getMonth()],
      dia: date.getDate(),
      anio: date.getFullYear(),
      diaNombre: dia.substring(0, 3)
    }
  }

  if (proximosEventos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay partidos próximos programados</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {proximosEventos.map((evento) => {
        const equipos = parseRival(evento.rival || 'Por confirmar')
        const fechaInfo = formatearFecha(evento.fecha, evento.dia)

        return (
          <div
            key={evento.id}
            className="w-full bg-gradient-to-r from-azul-oscuro to-azul-primario overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 md:px-8 py-6 md:py-8 gap-2 md:gap-4">
              {/* Equipo Local */}
              <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
                <div className="relative w-10 h-10 md:w-16 md:h-16 flex-shrink-0">
                  <Image
                    src="/images/escudoazulyblanco.png"
                    alt={equipos.local}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-white font-bold text-sm md:text-2xl truncate">
                  {equipos.local}
                </h3>
              </div>

              {/* Fecha y Hora Central */}
              <div className="flex flex-col items-center gap-0.5 md:gap-2 px-2 md:px-8 flex-shrink-0">
                <div className="text-white/70 text-[10px] md:text-sm font-medium whitespace-nowrap">
                  {fechaInfo.mes} {fechaInfo.dia} {fechaInfo.anio}
                </div>
                <div className="text-white text-base md:text-2xl font-bold">
                  {evento.horaInicio || '—'}
                </div>
                <div className="text-white/60 text-[8px] md:text-xs uppercase tracking-wider text-center line-clamp-1">
                  {evento.estadio}
                </div>
              </div>

              {/* Equipo Visitante */}
              <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end min-w-0">
                <h3 className="text-white font-bold text-sm md:text-2xl truncate text-right">
                  {equipos.visitante}
                </h3>
                <div className="relative w-10 h-10 md:w-16 md:h-16 flex-shrink-0 bg-white rounded-full p-2">
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-[10px] md:text-sm font-bold">
                      {equipos.visitante.substring(0, 3)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Banda inferior con información adicional */}
            <div className="bg-azul-primario/30 backdrop-blur-sm px-4 md:px-8 py-2">
              <div className="flex items-center justify-between text-white/80 text-xs md:text-sm">
                <span className="font-medium">{evento.tipoPartido || 'Partido'}</span>
                {!evento.confirmado && (
                  <span className="text-yellow-300 font-semibold">Por confirmar</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
