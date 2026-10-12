import type { ReactNode } from 'react'
import Image from 'next/image'

interface FichaPersonaProps {
  foto: string | null
  alt: string
  nombre: string
  apellidos: string
  // Línea azul bajo el nombre: posiciones del jugador o cargo del técnico
  detalle?: string
  // Insignias sobre la foto (dorsal, estado)
  children?: ReactNode
}

export function FichaPersona({ foto, alt, nombre, apellidos, detalle, children }: FichaPersonaProps) {
  return (
    <article className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-azul-claro to-azul-primario shadow-sm hover:shadow-xl transition-shadow">
      {foto ? (
        <Image
          src={foto}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <Image
          src="/images/escudoazulyblanco.png"
          alt=""
          width={160}
          height={160}
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-1/2 h-auto opacity-15 transition-transform duration-500 group-hover:scale-110"
        />
      )}

      {children}

      {/* Nombre */}
      <div className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 bg-gradient-to-t from-azul-profundo/95 via-azul-profundo/60 to-transparent text-white">
        {nombre && <p className="text-sm md:text-base leading-tight text-white/85">{nombre}</p>}
        <p className="font-heading font-extrabold uppercase text-base md:text-xl leading-tight tracking-tight">
          {apellidos}
        </p>
        {detalle && (
          <p className="mt-1.5 text-[11px] md:text-xs font-semibold uppercase tracking-wider text-azul-cielo">
            {detalle}
          </p>
        )}
      </div>
    </article>
  )
}
