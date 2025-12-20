'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import type { Shield } from '@/lib/shields'

interface ShieldTimelineProps {
  shields: Shield[]
}

export function ShieldTimeline({ shields }: ShieldTimelineProps) {
  if (shields.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No hay escudos históricos disponibles todavía.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Línea temporal horizontal en desktop */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Línea horizontal */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-azul-primario transform -translate-y-1/2" />

          {/* Escudos en la línea temporal */}
          <div className="relative flex justify-between items-center px-4">
            {shields.map((shield) => (
              <div
                key={shield.year}
                className="flex flex-col items-center group"
              >
                {/* Punto en la línea */}
                <div className="w-4 h-4 bg-azul-primario rounded-full border-4 border-white shadow-lg z-10 mb-4 group-hover:scale-125 transition-transform" />

                {/* Escudo */}
                <div className="relative w-32 h-32 mb-2 transition-all duration-300 group-hover:scale-110">
                  <div className="absolute inset-0 bg-white rounded-full shadow-lg" />
                  <div className="relative w-full h-full p-2">
                    <Image
                      src={shield.imageUrl}
                      alt={`Escudo ${shield.year}`}
                      fill
                      className="object-contain p-2"
                      sizes="128px"
                    />
                  </div>
                </div>

                {/* Año y descripción */}
                <div className="text-center max-w-[150px]">
                  <span className="text-xl font-bold text-azul-oscuro block mb-1">
                    {shield.year}
                  </span>
                  {shield.description && (
                    <p className="text-xs text-gray-600">
                      {shield.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Línea temporal vertical en mobile */}
      <div className="md:hidden space-y-6">
        {shields.map((shield, index) => (
          <div key={shield.year} className="flex gap-4 items-start">
            {/* Línea vertical con punto */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-azul-primario rounded-full border-4 border-white shadow-lg flex-shrink-0" />
              {index < shields.length - 1 && (
                <div className="w-1 h-full bg-azul-primario min-h-[100px]" />
              )}
            </div>

            {/* Contenido */}
            <Card className="flex-1 group">
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  {/* Escudo */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <div className="absolute inset-0 bg-white rounded-full shadow" />
                    <div className="relative w-full h-full p-1">
                      <Image
                        src={shield.imageUrl}
                        alt={`Escudo ${shield.year}`}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-azul-oscuro mb-1">
                      {shield.year}
                    </h3>
                    {shield.description && (
                      <p className="text-sm text-gray-600">
                        {shield.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
