"use client"

import { EventoCalendario } from '@/lib/types/calendario'
import { useMemo, useState } from 'react'
import { obtenerProximosEventos } from '@/lib/utils/calendario'
import Image from 'next/image'
import { Banknote, MapPin, X, Clock, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/lib/constants'
import Link from 'next/link'
import { NombrePartido } from './NombrePartido'

interface ProximosPartidosProps {
  eventos: EventoCalendario[]
  limite?: number
}

export function ProximosPartidos({ eventos, limite = 3 }: ProximosPartidosProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null)

  const proximosEventos = useMemo(() => {
    return obtenerProximosEventos(eventos, limite)
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
        const esEntrenamiento = evento.tipo === 'entrenamiento'
        const esEvento = evento.tipo === 'evento'

        // Para entrenamientos, verificar si tiene formato "X vs Y" para enfrentamiento interno
        let equipos
        if (esEntrenamiento && evento.actividad?.toLowerCase().includes(' vs ')) {
          const partes = evento.actividad.split(/\s+vs\s+/i)
          equipos = {
            local: partes[0].trim(),
            visitante: partes[1].trim()
          }
        } else if (esEntrenamiento) {
          equipos = { local: 'AYB', visitante: evento.actividad || 'Entrenamiento' }
        } else if (esEvento) {
          equipos = { local: 'AYB', visitante: evento.titulo || 'Evento Especial' }
        } else {
          equipos = parseRival(evento.rival || 'Por confirmar')
        }

        const esEnfrentamientoInterno = esEntrenamiento && evento.actividad?.toLowerCase().includes(' vs ')
        const fechaInfo = formatearFecha(evento.fecha, evento.dia)

        return (
          <div
            key={evento.id}
            className="w-full bg-gradient-to-r from-azul-oscuro to-azul-primario overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setEventoSeleccionado(evento)}
          >
            {esEvento ? (
              /* Layout para Eventos Especiales */
              <div className="flex flex-col items-center justify-center px-4 md:px-8 py-6 md:py-8 gap-3 md:gap-4">
                {/* Icono y Título del Evento */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative w-12 h-12 md:w-20 md:h-20 flex-shrink-0">
                    <Image
                      src="/images/escudoazulyblanco.png"
                      alt="Azul y Blanco"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-white font-bold text-base md:text-3xl text-center">
                    {evento.titulo || 'Evento Especial'}
                  </h3>
                  <div className="relative w-12 h-12 md:w-20 md:h-20 flex-shrink-0">
                    <Image
                      src="/images/escudoazulyblanco.png"
                      alt="Azul y Blanco"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Fecha, Hora y Lugar */}
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-white/90">
                  <div className="flex items-center gap-2 text-sm md:text-base">
                    <span className="font-semibold">{fechaInfo.mes} {fechaInfo.dia}, {fechaInfo.anio}</span>
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
            ) : (
              /* Layout normal para Partidos y Entrenamientos */
              <div className="flex items-center justify-between px-4 md:px-8 py-6 md:py-8 gap-2 md:gap-4">
                {/* Equipo Local / Club */}
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
                  <div className="text-white/60 text-[8px] md:text-xs uppercase tracking-wider text-center line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{evento.estadio}</span>
                  </div>
                </div>

                {/* Rival / Actividad */}
                <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end min-w-0">
                  <h3 className="text-white font-bold text-sm md:text-2xl truncate text-right">
                    {equipos.visitante}
                  </h3>
                  {esEnfrentamientoInterno ? (
                    <div className="relative w-10 h-10 md:w-16 md:h-16 flex-shrink-0">
                      <Image
                        src="/images/escudoazulyblanco.png"
                        alt={equipos.visitante}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : !esEntrenamiento ? (
                    <div className="relative w-10 h-10 md:w-16 md:h-16 flex-shrink-0 bg-white rounded-full p-2">
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-[10px] md:text-sm font-bold">
                          {equipos.visitante.substring(0, 3)}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Banda inferior con información adicional */}
            <div className="bg-azul-primario/30 backdrop-blur-sm px-4 md:px-8 py-2">
              <div className="flex items-center justify-between text-white/80 text-xs md:text-sm">
                <span className="font-medium">
                  {esEvento ? 'Evento Especial' : esEntrenamiento ? 'Entrenamiento' : (evento.tipoPartido || 'Partido')}
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

      {/* Drawer/Panel Lateral de Detalle de Evento */}
      {eventoSeleccionado && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setEventoSeleccionado(null)}
          />

          {/* Panel Lateral */}
          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto">
            {/* Header del Panel */}
            <div className="sticky top-0 bg-gradient-to-r from-azul-primario to-azul-claro text-white p-6 shadow-md">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                onClick={() => setEventoSeleccionado(null)}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="pr-10">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={eventoSeleccionado.tipo === 'partido' ? 'default' : 'secondary'}
                    className={`backdrop-blur-sm border-0 ${
                      eventoSeleccionado.tipo === 'evento'
                        ? 'bg-purple-500/30 text-white'
                        : 'bg-white/20'
                    }`}
                  >
                    {eventoSeleccionado.tipo === 'partido' ? '⚽' : eventoSeleccionado.tipo === 'evento' ? '🎉' : '🏃'} {eventoSeleccionado.tipo.toUpperCase()}
                  </Badge>
                  {!eventoSeleccionado.confirmado && (
                    <Badge className="bg-orange-500/20 text-white border-white/40">
                      Por confirmar
                    </Badge>
                  )}
                </div>

                {eventoSeleccionado.tipo === 'partido' ? (
                  <NombrePartido
                    rivalText={eventoSeleccionado.rival || 'Por confirmar'}
                    className="text-2xl font-bold mb-2"
                    mostrarVS={true}
                    tamañoEscudo={32}
                  />
                ) : eventoSeleccionado.tipo === 'evento' ? (
                  <h2 className="text-2xl font-bold mb-2">
                    {eventoSeleccionado.titulo || 'Evento Especial'}
                  </h2>
                ) : (
                  <h2 className="text-2xl font-bold mb-2">
                    {eventoSeleccionado.actividad || 'Entrenamiento'}
                  </h2>
                )}

                <div className="flex items-center gap-2 text-white/90">
                  <span className="font-semibold">{eventoSeleccionado.dia}</span>
                  <span>•</span>
                  <span>{eventoSeleccionado.diaMes} de {eventoSeleccionado.mes}</span>
                </div>
              </div>
            </div>

            {/* Contenido del Panel */}
            <div className="p-6 space-y-6">
              {/* Descripción del evento (solo para tipo evento) */}
              {eventoSeleccionado.tipo === 'evento' && eventoSeleccionado.descripcion && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-sm text-gray-700 leading-relaxed">{eventoSeleccionado.descripcion}</p>
                </div>
              )}

              {/* Detalles */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-azul-primario/10 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-azul-primario" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lugar</div>
                      <div className="font-semibold text-gray-900">{eventoSeleccionado.estadio}</div>
                    </div>
                  </div>
                </div>

                {eventoSeleccionado.horaInicio && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-azul-primario/10 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-azul-primario" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Horario</div>
                        <div className="font-semibold text-gray-900">
                          {eventoSeleccionado.horaInicio}
                          {eventoSeleccionado.horaFin ? ` - ${eventoSeleccionado.horaFin}` : ''} hrs
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Series participantes (solo para eventos) */}
                {eventoSeleccionado.tipo === 'evento' && eventoSeleccionado.series && eventoSeleccionado.series.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Series Participantes</div>
                    <div className="flex flex-wrap gap-2">
                      {eventoSeleccionado.series.map((serie, index) => (
                        <Badge key={index} variant="outline" className="bg-white">
                          {serie}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Precio de entrada */}
                {eventoSeleccionado.precioEntrada && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Entrada</div>
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">
                        General: ${eventoSeleccionado.precioEntrada.replace('.', '')}
                      </div>
                      {eventoSeleccionado.edadGratis && (
                        <div className="text-sm text-green-600 font-medium">
                          {eventoSeleccionado.edadGratis} NO PAGAN
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón WhatsApp solo para partidos */}
              {eventoSeleccionado.tipo === 'partido' && (
                <div className="pt-2">
                  <Button
                    asChild
                    className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl h-12"
                  >
                    <Link
                      href={`https://wa.me/${SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">Revisa la nómina</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
