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
  // Sin acercar, la foto cubre el marco con `fill` + object-position. Acercada
  // (ancho != null), next/image 16 no deja combinar `fill` con width/height en
  // el style, así que se posiciona a mano: sin `fill`, con width/height de
  // relleno que el `style` de abajo pisa.
  const conZoom = recorte != null && recorte.ancho != null
  // Acercada, la foto mide `ancho`% del marco: sin esto, next/image elige una
  // variante del tamaño del marco y el navegador la estira (se ve borrosa).
  const sizesEfectivo = recorte?.ancho != null ? `calc((${sizes}) * ${recorte.ancho / 100})` : sizes
  return (
    <Image
      src={url}
      alt={alt}
      fill={!conZoom}
      width={conZoom ? 1 : undefined}
      height={conZoom ? 1 : undefined}
      priority={priority}
      sizes={sizesEfectivo}
      className={cn('object-cover', className)}
      style={
        conZoom
          ? { position: 'absolute', ...estiloRecorte(recorte) }
          : { objectPosition: posicionCSS(recorte ?? defecto) }
      }
    />
  )
}
