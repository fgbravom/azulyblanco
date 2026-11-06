'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  titulo: string
  className?: string
}

/**
 * Video de YouTube que solo carga el reproductor al tocarlo: la rutina tiene
 * doce videos y cargarlos todos de entrada pesaría varios MB en el celular.
 */
export function VideoEjercicio({ id, titulo, className }: Props) {
  const [activo, setActivo] = useState(false)

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900', className)}>
      {activo ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
          title={`Video: ${titulo}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActivo(true)}
          className="group absolute inset-0 flex items-center justify-center"
          aria-label={`Ver video: ${titulo}`}
        >
          {/* Miniatura servida por YouTube: ya viene comprimida, no pasa por el optimizador */}
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-azul-primario shadow-lg transition-transform group-hover:scale-105 group-active:scale-95">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </span>
        </button>
      )}
    </div>
  )
}
