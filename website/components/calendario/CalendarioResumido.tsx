"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventoCalendario } from '@/lib/types/calendario'
import { CalendarDays, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CalendarioResumidoProps {
  eventos: EventoCalendario[]
  limite?: number
}

export function CalendarioResumido({ eventos, limite = 3 }: CalendarioResumidoProps) {
  const hoy = new Date()

  const proximosEventos = eventos
    .filter(evento => new Date(evento.fecha + 'T12:00:00') >= hoy)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, limite)

  const getBadgeVariant = (tipo: string) => {
    return tipo === 'partido' ? 'default' : 'secondary'
  }

  const getEventoIcon = (tipo: string) => {
    return tipo === 'partido' ? '⚽' : '🏃'
  }

  return (
    <div className="w-full">
      <Card className="border-2 border-azul-primario/20">
        <CardHeader className="bg-gradient-to-r from-azul-primario to-azul-claro text-white pb-4">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="space-y-2">
            {proximosEventos.map((evento) => (
              <Card
                key={evento.id}
                className="overflow-hidden border-l-4 hover:shadow-sm transition-shadow"
                style={{
                  borderLeftColor: evento.tipo === 'partido' ? '#1e40af' : '#64748b'
                }}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Fecha compacta */}
                    <div className="flex-shrink-0">
                      <div className="bg-azul-primario text-white rounded-md p-1.5 min-w-[50px] text-center">
                        <div className="text-[10px] font-semibold opacity-90">
                          {evento.dia.substring(0, 3)}
                        </div>
                        <div className="text-xl font-bold leading-tight">
                          {evento.diaMes}
                        </div>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant={getBadgeVariant(evento.tipo)} className="text-[10px] h-5">
                          {getEventoIcon(evento.tipo)} {evento.tipo.toUpperCase()}
                        </Badge>
                        {!evento.confirmado && (
                          <Badge variant="outline" className="text-[10px] h-5 text-orange-600 border-orange-600">
                            Por confirmar
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-sm md:text-base text-azul-oscuro truncate">
                        {evento.tipo === 'partido' ? evento.rival : evento.actividad}
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{evento.estadio}</span>
                        {evento.horaInicio && (
                          <span className="ml-1 font-semibold">• {evento.horaInicio} hrs</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {proximosEventos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay eventos próximos programados</p>
            </div>
          )}

          <div className="mt-4 text-center">
            <Button variant="ghost" asChild className="w-full">
              <Link href="/partidos" className="flex items-center justify-center gap-1">
                Ver calendario completo
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
