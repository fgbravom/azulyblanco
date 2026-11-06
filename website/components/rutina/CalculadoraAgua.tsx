'use client'

import { useId, useState } from 'react'

interface Props {
  mlPorKilo: number
  minimoLitros: number
}

/** Agua diaria según el peso: peso por ml por kilo, sin bajar del mínimo recomendado */
export function litrosDiarios(pesoKg: number, mlPorKilo: number, minimoLitros: number): number {
  return Math.max(minimoLitros, (pesoKg * mlPorKilo) / 1000)
}

export function CalculadoraAgua({ mlPorKilo, minimoLitros }: Props) {
  const id = useId()
  const [peso, setPeso] = useState('75')
  const kilos = Number(peso.replace(',', '.'))
  const valido = Number.isFinite(kilos) && kilos >= 30 && kilos <= 200
  const litros = valido ? litrosDiarios(kilos, mlPorKilo, minimoLitros) : null

  return (
    <div className="rounded-2xl bg-azul-primario p-5 text-white">
      <label htmlFor={id} className="text-sm font-semibold text-azul-cielo">
        ¿Cuánto pesas?
      </label>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative w-28 shrink-0">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={30}
            max={200}
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className="h-12 w-full rounded-xl border-0 bg-white/10 pl-4 pr-10 text-xl font-bold text-white outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-azul-brillante"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/60">kg</span>
        </div>
        <p className="text-sm text-white/80" aria-live="polite">
          {litros !== null ? (
            <>
              Toma al menos <span className="block text-3xl font-bold text-white">{litros.toFixed(1).replace('.', ',')} litros</span> de agua al día
            </>
          ) : (
            'Ingresa un peso entre 30 y 200 kg'
          )}
        </p>
      </div>
      <p className="mt-3 text-xs text-white/60">
        Se calcula como tu peso por {mlPorKilo} ml, y nunca menos de {minimoLitros} litros diarios.
      </p>
    </div>
  )
}
