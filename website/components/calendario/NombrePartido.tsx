import Image from 'next/image'
import { formatearNombrePartido } from '@/lib/utils/calendario'

interface NombrePartidoProps {
  rivalText: string
  className?: string
  mostrarVS?: boolean
  tamañoEscudo?: number
}

export function NombrePartido({
  rivalText,
  className = '',
  mostrarVS = true,
  tamañoEscudo = 24
}: NombrePartidoProps) {
  const { esAyBLocal, esAyBVisitante, equipoLocal, equipoVisitante } = formatearNombrePartido(rivalText)

  // Enfrentamiento interno (ambos son equipos AYB)
  if (esAyBLocal && esAyBVisitante) {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <div className="relative flex-shrink-0" style={{ width: tamañoEscudo, height: tamañoEscudo }}>
          <Image
            src="/images/escudoazulyblanco.png"
            alt="Azul y Blanco"
            fill
            className="object-contain"
          />
        </div>
        <span className="font-bold">{equipoLocal}</span>
        {mostrarVS && <span className="text-white/70 font-normal">VS</span>}
        <span className="font-bold">{equipoVisitante}</span>
        <div className="relative flex-shrink-0" style={{ width: tamañoEscudo, height: tamañoEscudo }}>
          <Image
            src="/images/escudoazulyblanco.png"
            alt="Azul y Blanco"
            fill
            className="object-contain"
          />
        </div>
      </div>
    )
  }

  // AYB es local
  if (esAyBLocal) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative flex-shrink-0" style={{ width: tamañoEscudo, height: tamañoEscudo }}>
          <Image
            src="/images/escudoazulyblanco.png"
            alt="Azul y Blanco"
            fill
            className="object-contain"
          />
        </div>
        <span className="font-bold">{equipoLocal}</span>
        {mostrarVS && <span className="text-white/70 font-normal">VS</span>}
        <span>{equipoVisitante}</span>
      </div>
    )
  }

  // AYB es visitante
  if (esAyBVisitante) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span>{equipoLocal}</span>
        {mostrarVS && <span className="text-white/70 font-normal">VS</span>}
        <span className="font-bold">{equipoVisitante}</span>
        <div className="relative flex-shrink-0" style={{ width: tamañoEscudo, height: tamañoEscudo }}>
          <Image
            src="/images/escudoazulyblanco.png"
            alt="Azul y Blanco"
            fill
            className="object-contain"
          />
        </div>
      </div>
    )
  }

  // Ninguno es AYB (no debería pasar normalmente)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span>{equipoLocal || equipoVisitante}</span>
    </div>
  )
}
