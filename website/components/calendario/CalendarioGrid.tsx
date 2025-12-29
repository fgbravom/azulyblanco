"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventoCalendario } from '@/lib/types/calendario'
import { ChevronLeft, ChevronRight, X, MapPin, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { SITE_CONFIG } from '@/lib/constants'
import Link from 'next/link'
import { esFechaHoy } from '@/lib/utils/calendario'
import { NombrePartido } from './NombrePartido'

interface CalendarioGridProps {
  eventos: EventoCalendario[]
  mes: string
  año: number
}

export function CalendarioGrid({ eventos, mes, año }: CalendarioGridProps) {
  const [mesActual, setMesActual] = useState(new Date(año, 11, 1)) // Diciembre 2025
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null)

  // Días de la semana empezando por LUNES (estándar chileno)
  const diasSemana = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Obtener el primer día del mes y el número de días
  const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
  const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0)
  const diasEnMes = ultimoDia.getDate()
  // Ajustar para que lunes sea 0 (getDay() devuelve 0=domingo, 1=lunes, etc.)
  const diaSemanaInicio = (primerDia.getDay() + 6) % 7

  // Verificar si un día es hoy usando la función centralizada
  const esHoy = (dia: number) => {
    const año = mesActual.getFullYear()
    const mes = String(mesActual.getMonth() + 1).padStart(2, '0')
    const diaStr = String(dia).padStart(2, '0')
    const fecha = `${año}-${mes}-${diaStr}`
    return esFechaHoy(fecha)
  }

  // Obtener eventos para un día específico
  const getEventosDelDia = (dia: number) => {
    const fechaBuscada = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return eventos.filter(evento => evento.fecha === fechaBuscada)
  }

  // Navegar entre meses
  const mesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))
  }

  const mesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))
  }

  // Generar array de días (incluyendo espacios vacíos al inicio)
  const dias = []

  // Días vacíos al inicio
  for (let i = 0; i < diaSemanaInicio; i++) {
    dias.push(null)
  }

  // Días del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    dias.push(dia)
  }

  return (
    <div className="w-full">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={mesAnterior}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <h2 className="text-2xl font-bold text-azul-oscuro">
          {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
        </h2>

        <Button
          variant="outline"
          size="sm"
          onClick={mesSiguiente}
          className="flex items-center gap-1"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid del calendario */}
      <Card className="overflow-hidden rounded-lg">
        <CardContent className="p-0">
          {/* Encabezados de días de la semana */}
          <div className="grid grid-cols-7 bg-azul-primario text-white">
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="text-center py-3 text-sm font-semibold border-r border-white/20 last:border-r-0"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7">
            {dias.map((dia, index) => {
              const eventosDelDia = dia ? getEventosDelDia(dia) : []
              const esHoyDia = dia ? esHoy(dia) : false

              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] md:min-h-[120px] p-2 border-r border-b border-gray-200
                    ${dia ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  {dia && (
                    <>
                      {/* Número del día */}
                      <div className="flex justify-end mb-1">
                        <span
                          className={`
                            text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                            ${esHoyDia ? 'bg-azul-primario text-white' : 'text-gray-700'}
                          `}
                        >
                          {dia}
                        </span>
                      </div>

                      {/* Eventos del día */}
                      <div className="space-y-1">
                        {eventosDelDia.slice(0, 2).map((evento) => {
                          const esPartido = evento.tipo === 'partido'
                          const esEvento = evento.tipo === 'evento'
                          const esEntrenamiento = evento.tipo === 'entrenamiento'

                          return (
                            <div
                              key={evento.id}
                              onClick={() => setEventoSeleccionado(evento)}
                              className={`
                                text-xs px-2 py-1 rounded truncate cursor-pointer transition-all
                                ${esPartido
                                  ? 'bg-azul-primario/10 text-azul-oscuro border-l-2 border-azul-primario hover:bg-azul-primario/20'
                                  : esEvento
                                  ? 'bg-purple-100 text-purple-800 border-l-2 border-purple-500 hover:bg-purple-200'
                                  : 'bg-gray-200 text-gray-700 border-l-2 border-gray-400 hover:bg-gray-300'
                                }
                              `}
                              title={esPartido ? evento.rival : esEvento ? evento.titulo : evento.actividad}
                            >
                              <div className="flex items-center gap-1">
                                <span>{esPartido ? '⚽' : esEvento ? '🎉' : '🏃'}</span>
                                <span className="truncate">
                                  {esPartido ? evento.rival : esEvento ? evento.titulo : evento.actividad}
                                </span>
                              </div>
                              {evento.horaInicio && (
                                <div className="text-[10px] opacity-75">
                                  {evento.horaInicio}hs
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {eventosDelDia.length > 2 && (
                          <div className="text-[10px] text-gray-500 px-2">
                            +{eventosDelDia.length - 2} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-azul-primario"></div>
          <span>Día actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-azul-primario"></div>
          <span>Partido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-purple-500"></div>
          <span>Evento Especial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-gray-400"></div>
          <span>Entrenamiento</span>
        </div>
      </div>

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
