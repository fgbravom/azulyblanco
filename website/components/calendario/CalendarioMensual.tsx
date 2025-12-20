"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventoCalendario } from '@/lib/types/calendario'
import { CalendarDays, MapPin, Clock } from 'lucide-react'

interface CalendarioMensualProps {
  eventos: EventoCalendario[]
  mes: string
  año: number
}

export function CalendarioMensual({ eventos, mes, año }: CalendarioMensualProps) {
  const eventosOrdenados = [...eventos].sort((a, b) => {
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  })

  const getBadgeVariant = (tipo: string) => {
    return tipo === 'partido' ? 'default' : 'secondary'
  }

  const getEventoIcon = (tipo: string) => {
    return tipo === 'partido' ? '⚽' : '🏃'
  }

  const formatearFecha = (evento: EventoCalendario) => {
    const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
    const fecha = new Date(evento.fecha + 'T12:00:00')
    const diaSemana = dias[fecha.getDay()]
    return `${diaSemana} ${evento.diaMes}`
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-azul-primario/20">
        <CardHeader className="bg-gradient-to-r from-azul-primario to-azul-claro text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="w-6 h-6" />
              CALENDARIO {mes.toUpperCase()} {año}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-3">
            {eventosOrdenados.map((evento) => (
              <Card
                key={evento.id}
                className="overflow-hidden hover:shadow-md transition-shadow border-l-4"
                style={{
                  borderLeftColor: evento.tipo === 'partido' ? '#1e40af' : '#64748b'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Fecha */}
                    <div className="flex-shrink-0 text-center">
                      <div className="bg-azul-primario text-white rounded-lg p-2 min-w-[60px]">
                        <div className="text-xs font-semibold opacity-90">
                          {evento.dia.substring(0, 3)}
                        </div>
                        <div className="text-2xl font-bold leading-tight">
                          {evento.diaMes}
                        </div>
                        <div className="text-xs opacity-90">
                          {evento.mes.substring(0, 3)}
                        </div>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getBadgeVariant(evento.tipo)} className="font-semibold">
                            {getEventoIcon(evento.tipo)} {evento.tipo.toUpperCase()}
                          </Badge>
                          {!evento.confirmado && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Por confirmar
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Título del evento */}
                      <h3 className="font-bold text-lg mb-1 text-azul-oscuro">
                        {evento.tipo === 'partido' ? (
                          evento.rival
                        ) : (
                          evento.actividad || 'Entrenamiento'
                        )}
                      </h3>

                      {/* Detalles */}
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{evento.estadio}</span>
                        </div>
                        {evento.horaInicio && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{evento.horaInicio}hs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {eventos.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay eventos programados para este mes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
