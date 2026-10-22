import Image from 'next/image'
import { cn } from '@/lib/utils'
import { estiloRecorte, posicionCSS, type FocoPortada, type RecorteFoto } from '@/lib/contenido/foco'

interface Props {
  url: string
  alt: string
  /** Recorte guardado; null = recorte automático del lugar */
  recorte: RecorteFoto | null
  /** Recorte automático (object-position) cuando la foto está sin ajustar */
  defecto?: FocoPortada
  sizes: string
  priority?: boolean
  className?: string
}

/**
 * Foto dentro de un marco (el marco necesita ser relative y tener overflow-hidden):
 * con recorte guardado se enmarca a mano, con su punto fijo y su tamaño; sin él,
 * cada lugar muestra su recorte automático.
 */
export default function FotoRecorte({ url, alt, recorte, defecto, sizes, priority, className }: Props) {
  return (
    <Image
      src={url}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn('object-cover', className)}
      style={recorte?.ancho != null ? estiloRecorte(recorte) : { objectPosition: posicionCSS(recorte ?? defecto) }}
    />
  )
}
