"use client"

import { EventoCalendario } from '@/lib/types/calendario'
import { useMemo, useState } from 'react'
import { obtenerProximosEventos } from '@/lib/utils/calendario'
import Image from 'next/image'
import { Banknote, MapPin } from 'lucide-react'
import { DetalleEvento } from './DetalleEvento'

// Escudo del club, siempre contenido (relativo + fill con object-contain)
function EscudoAYB({ alt }: { alt: string }) {
  return (
    <div className="relative w-12 h-12 md:w-20 md:h-20 flex-shrink-0">
      <Image
        src="/images/escudoazulyblanco.png"
        alt={alt}
        fill
        sizes="80px"
        className="object-contain"
      />
    </div>
  )
}

// Logo del rival recortado en círculo, sin fondo blanco, y del mismo tamaño visible que el escudo AYB
function CirculoRival({ logo, alt }: { logo?: string; alt: string }) {
  return (
    <div className="w-12 h-12 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center">
      {logo ? (
        <div className="w-4/5 h-4/5 rounded-full overflow-hidden">
          <Image src={logo} alt={alt} width={64} height={64} sizes="64px" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="w-4/5 h-4/5 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-400 text-[10px] md:text-sm font-bold">
            {alt.substring(0, 3).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

interface ProximosPartidosProps {
  eventos: EventoCalendario[]
  limite?: number
}

export function ProximosPartidos({ eventos, limite = 3 }: ProximosPartidosProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null)

  const proximosEventos = useMemo(() => {
    return obtenerProximosEventos(eventos, limite)
  }, [eventos, limite])

  // Equipos que pertenecen a Azul y Blanco
  const equiposAYB = ['AYB', 'AYB35', 'SERIE HONOR', 'SERIE 35', 'SERIE PRIMERA', 'HONOR', 'PRIMERA']

  const esEquipoAYB = (nombre: string): boolean => {
    const nombreUpper = nombre.toUpperCase().trim()
    return equiposAYB.some(equipo =>
      nombreUpper === equipo ||
      nombreUpper.includes('AYB') ||
      nombreUpper.includes('AZUL Y BLANCO') ||
      nombreUpper.startsWith('SERIE ')
    )
  }

  const parseRival = (rivalText: string) => {
    // Buscar separador "VS" o "vs"
    const vsMatch = rivalText.match(/\s+vs\s+/i)
    if (vsMatch) {
      const parts = rivalText.split(vsMatch[0])
      const local = parts[0].trim()
      const visitante = parts[1].trim()

      return {
        local,
        visitante,
        localEsAYB: esEquipoAYB(local),
        visitanteEsAYB: esEquipoAYB(visitante)
      }
    }

    // Sin formato VS, asumir que es solo el nombre del rival
    return {
      local: 'AYB',
      visitante: rivalText,
      localEsAYB: true,
      visitanteEsAYB: false
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
        const esEntrenamiento = evento.tipo === 'entrenamiento'
        const esEvento = evento.tipo === 'evento'

        // Para entrenamientos, verificar si tiene formato "X vs Y" para enfrentamiento interno
        let equipos: { local: string; visitante: string; localEsAYB: boolean; visitanteEsAYB: boolean }
        if (esEntrenamiento && evento.actividad?.toLowerCase().includes(' vs ')) {
          const partes = evento.actividad.split(/\s+vs\s+/i)
          const local = partes[0].trim()
          const visitante = partes[1].trim()
          equipos = {
            local,
            visitante,
            localEsAYB: esEquipoAYB(local),
            visitanteEsAYB: esEquipoAYB(visitante)
          }
        } else if (esEntrenamiento) {
          equipos = { local: 'AYB', visitante: evento.actividad || 'Entrenamiento', localEsAYB: true, visitanteEsAYB: false }
        } else if (esEvento) {
          equipos = { local: 'AYB', visitante: evento.titulo || 'Evento Especial', localEsAYB: true, visitanteEsAYB: false }
        } else {
          equipos = parseRival(evento.rival || 'Por confirmar')
        }

        const fechaInfo = formatearFecha(evento.fecha, evento.dia)

        // Diseño estándar para todos los tipos: [escudo] Título [escudo] y debajo fecha · hora · estadio
        const entrenamientoConVs = esEntrenamiento && !!evento.actividad?.toLowerCase().includes(' vs ')
        // Los enfrentamientos (partidos y entrenamientos "X vs Y") se muestran como [código] [escudo] Vs [escudo] [código]
        const conVs = !esEvento && (evento.tipo === 'partido' || entrenamientoConVs)
        const titulo = esEvento
          ? evento.titulo || 'Evento Especial'
          : esEntrenamiento
          ? evento.actividad || 'Entrenamiento'
          : `${equipos.local} vs ${equipos.visitante}`

        const escudoIzquierdo = esEvento || equipos.localEsAYB ? (
          <EscudoAYB alt={equipos.local} />
        ) : (
          <CirculoRival logo={esEntrenamiento ? undefined : evento.rivalLogo} alt={equipos.local} />
        )

        const escudoDerecho = esEvento || equipos.visitanteEsAYB || (esEntrenamiento && !entrenamientoConVs) ? (
          <EscudoAYB alt={equipos.visitante} />
        ) : (
          <CirculoRival logo={evento.rivalLogo} alt={equipos.visitante} />
        )

        return (
          <div
            key={evento.id}
            className="w-full bg-gradient-to-r from-azul-oscuro to-azul-primario overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setEventoSeleccionado(evento)}
          >
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center px-4 md:px-8 py-6 md:py-8 gap-3 md:gap-4">
              {/* Grilla fija de 3 columnas: todo se alinea sobre el mismo eje central en todas las filas */}
              <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
                {conVs ? (
                  <>
                    {/* Local: código alineado hacia el centro */}
                    <div className="flex items-center justify-end gap-2 md:gap-4 min-w-0">
                      <span className="text-white font-bold text-sm md:text-2xl text-right break-words">{equipos.local}</span>
                      {escudoIzquierdo}
                    </div>
                    {evento.resultado ? (
                      <span className="text-white text-lg md:text-3xl font-black tabular-nums px-3 md:px-6 whitespace-nowrap">
                        {evento.resultado.local} – {evento.resultado.visitante}
                      </span>
                    ) : (
                      <span className="text-white/70 text-sm md:text-2xl font-normal px-3 md:px-6 whitespace-nowrap">Vs</span>
                    )}
                    {/* Rival: código alineado hacia el centro */}
                    <div className="flex items-center justify-start gap-2 md:gap-4 min-w-0">
                      {escudoDerecho}
                      <span className="text-white font-bold text-sm md:text-2xl text-left break-words">{equipos.visitante}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Eventos y entrenamientos: [escudo] Título [escudo] */}
                    <div className="flex items-center justify-end min-w-0">{escudoIzquierdo}</div>
                    <h3 className="text-white font-bold text-base md:text-3xl text-center px-3 md:px-6 break-words">
                      {titulo}
                    </h3>
                    <div className="flex items-center justify-start min-w-0">{escudoDerecho}</div>
                  </>
                )}
              </div>

              {/* Fecha, Hora y Lugar */}
              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-white/90">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <span className="font-semibold">{fechaInfo.dia} {fechaInfo.mes} {fechaInfo.anio}</span>
                </div>
                <div className="hidden md:block text-white/50">•</div>
                <div className="flex items-center gap-1 text-sm md:text-base">
                  <span className="font-bold">{evento.horaInicio}{evento.horaFin ? ` - ${evento.horaFin}` : ''}</span>
                </div>
                <div className="hidden md:block text-white/50">•</div>
                <div className="flex items-center gap-1 text-xs md:text-sm text-white/70">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{evento.estadio}</span>
                </div>
              </div>
            </div>

            {/* Banda inferior con información adicional */}
            <div className="bg-azul-primario/30 backdrop-blur-sm px-4 md:px-8 py-2">
              <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white/80 text-xs md:text-sm">
                <span className="font-medium">
                  {esEvento ? 'Evento Especial' : esEntrenamiento ? 'Entrenamiento' : (evento.tipoPartido || 'Partido')}
                  {evento.series && evento.series.length > 0 && (
                    <span className="text-white/60"> · {evento.series.join(' · ')}</span>
                  )}
                </span>
                <div className="flex gap-4">
                  {(evento.llevar || evento.precioEntrada) && (
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Banknote className="w-4 h-4" />
                      ${(evento.llevar || evento.precioEntrada || '').replace('.', '')}
                    </span>
                  )}
                  {!evento.confirmado && (
                    <span className="text-yellow-300 font-semibold">Por confirmar</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {eventoSeleccionado && (
        <DetalleEvento key={eventoSeleccionado.id} evento={eventoSeleccionado} onCerrar={() => setEventoSeleccionado(null)} />
      )}
    </div>
  )
}
