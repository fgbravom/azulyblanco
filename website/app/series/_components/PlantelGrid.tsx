'use client'

import { useState } from 'react'
import type { PlantelJugador } from '@/lib/contenido/publico'
import { FichaPersona } from './FichaPersona'

const TODOS = 'Todos'

// Líneas del filtro, en orden. Se agrupa por la sigla de la posición
// principal porque los nombres cambiaron con el tiempo (Portero → Arquero, etc.)
const LINEAS = [
  { nombre: 'Arqueros', siglas: ['POR'] },
  { nombre: 'Defensas', siglas: ['DFC', 'LTD', 'LTI'] },
  { nombre: 'Mediocampistas', siglas: ['MDC', 'PIV', 'MC', 'MED', 'MO', 'MCO', 'VOL D', 'VOL I'] },
  { nombre: 'Delanteros', siglas: ['EXD', 'EXI', 'DC'] },
]

function lineaDe(jugador: PlantelJugador): number {
  const sigla = jugador.posiciones_abr?.[0] ?? jugador.posicion_abr
  const i = LINEAS.findIndex((l) => sigla && l.siglas.includes(sigla))
  return i === -1 ? LINEAS.length : i
}

// En la web solo la favorita y la segunda; el resto lo ve el admin
const MAX_POSICIONES_PUBLICAS = 2

// Primer nombre; los apellidos ya vienen con paterno y materno
function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre
}

const ESTADO_COLORS: Record<string, string> = {
  Lesionado: 'bg-orange-500',
  Sancionado: 'bg-red-600',
}

interface PlantelGridProps {
  jugadores: PlantelJugador[]
}

export function PlantelGrid({ jugadores }: PlantelGridProps) {
  const [filtro, setFiltro] = useState(TODOS)

  // Todos va ordenado por línea y luego por dorsal (ya viene por dorsal)
  const conLinea = jugadores
    .map((jugador) => ({ jugador, linea: lineaDe(jugador) }))
    .sort((a, b) => a.linea - b.linea)
  const lineas = LINEAS.filter((_, i) => conLinea.some((j) => j.linea === i)).map((l) => l.nombre)
  const visibles = conLinea
    .filter(({ linea }) => filtro === TODOS || LINEAS[linea]?.nombre === filtro)
    .map(({ jugador }) => jugador)

  return (
    <>
      {lineas.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center mb-10" role="group" aria-label="Filtrar por posición">
          {[TODOS, ...lineas].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFiltro(p)}
              aria-pressed={filtro === p}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filtro === p
                  ? 'bg-azul-primario text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {visibles.map((jugador) => {
          const posicionesAbr = (jugador.posiciones_abr?.length ? jugador.posiciones_abr : [jugador.posicion_abr])
            .filter(Boolean)
            .slice(0, MAX_POSICIONES_PUBLICAS)

          return (
            <FichaPersona
              key={jugador.id}
              foto={jugador.foto_url}
              alt={jugador.nombre_completo}
              nombre={primerNombre(jugador.nombre)}
              apellidos={jugador.apellidos}
              detalle={posicionesAbr.join(' · ')}
            >
              {/* Dorsal */}
              {jugador.dorsal != null && (
                <span className="absolute top-3 left-4 font-heading font-black text-5xl md:text-6xl leading-none text-white/90 drop-shadow">
                  {jugador.dorsal}
                </span>
              )}

              {jugador.estado !== 'Activo' && (
                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white ${ESTADO_COLORS[jugador.estado] ?? 'bg-gray-600'}`}
                >
                  {jugador.estado}
                </span>
              )}
            </FichaPersona>
          )
        })}
      </div>
    </>
  )
}
