"use client"

import { Card, CardContent } from '@/components/ui/card'
import { EventoCalendario } from '@/lib/types/calendario'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { esFechaHoy } from '@/lib/utils/calendario'
import { DetalleEvento } from './DetalleEvento'

interface CalendarioGridProps {
  eventos: EventoCalendario[]
}

export function CalendarioGrid({ eventos }: CalendarioGridProps) {
  // Inicializar con el mes actual
  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  })
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
                              {esPartido && evento.resultado ? (
                                <div className="text-[10px] font-bold tabular-nums">
                                  {evento.resultado.local} – {evento.resultado.visitante}
                                </div>
                              ) : evento.horaInicio && (
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

      {eventoSeleccionado && (
        <DetalleEvento key={eventoSeleccionado.id} evento={eventoSeleccionado} onCerrar={() => setEventoSeleccionado(null)} />
      )}
    </div>
  )
}
