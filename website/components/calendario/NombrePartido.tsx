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
  const { esAyBLocal, equipoLocal, equipoVisitante } = formatearNombrePartido(rivalText)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {esAyBLocal ? (
        <>
          {/* Escudo de AYB */}
          <div className="relative flex-shrink-0" style={{ width: tamañoEscudo, height: tamañoEscudo }}>
            <Image
              src="/images/escudoazulyblanco.png"
              alt="Azul y Blanco"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold">AYB</span>
          {mostrarVS && <span className="text-gray-500 font-normal">VS</span>}
          <span>{equipoVisitante}</span>
        </>
      ) : (
        <>
          <span>{equipoLocal || equipoVisitante}</span>
        </>
      )}
    </div>
  )
}
