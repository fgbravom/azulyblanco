'use client'

import { createClient } from '@/lib/supabase/client'
import { BUCKET_MEDIOS } from '@/lib/contenido/tipos'
import { prepararSubida, type DestinoSubida } from '@/app/(admin)/admin/medios/actions'

const LADO_MAXIMO = 2400
const CALIDAD = 0.85

export interface OpcionesImagen {
  /**
   * En vez de limitar el lado mayor a 2400 px, reduce solo lo justo para que
   * la foto siga cubriendo esta caja. Para fotos que el servidor reprocesa.
   */
  cubrir?: { ancho: number; alto: number }
  calidad?: number
}

export interface ImagenSubida {
  path: string
  nombre: string
  mime: string
  bytes: number
  ancho: number
  alto: number
}

/**
 * Reduce la foto a 2400 px por lado y la recomprime en WebP (o JPEG si el
 * navegador no sabe codificar WebP). Una foto de celular de 6 MB queda en
 * unos 400-800 KB sin pérdida visible.
 */
async function prepararImagen(
  file: File,
  opciones: OpcionesImagen = {}
): Promise<{ archivo: Blob; mime: string; ancho: number; alto: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const { width, height } = bitmap

  // Los GIF pueden ser animados: se suben tal cual
  if (file.type === 'image/gif') {
    bitmap.close()
    return { archivo: file, mime: file.type, ancho: width, alto: height }
  }

  const escala = opciones.cubrir
    ? Math.min(1, Math.max(opciones.cubrir.ancho / width, opciones.cubrir.alto / height))
    : Math.min(1, LADO_MAXIMO / Math.max(width, height))
  const ancho = Math.round(width * escala)
  const alto = Math.round(height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, ancho, alto)
  bitmap.close()

  const codificar = (tipo: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipo, opciones.calidad ?? CALIDAD))

  let archivo = await codificar('image/webp')
  if (!archivo || archivo.type !== 'image/webp') archivo = await codificar('image/jpeg')
  if (!archivo) throw new Error('No se pudo procesar la imagen')

  // Si recomprimir no ahorra nada, se sube el original
  if (escala === 1 && archivo.size >= file.size && ['image/jpeg', 'image/webp', 'image/png'].includes(file.type)) {
    return { archivo: file, mime: file.type, ancho, alto }
  }

  return { archivo, mime: archivo.type, ancho, alto }
}

export async function subirImagen(file: File, destino: DestinoSubida, opciones?: OpcionesImagen): Promise<ImagenSubida> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} no es una imagen`)

  const { archivo, mime, ancho, alto } = await prepararImagen(file, opciones)
  const { path, token } = await prepararSubida(destino, mime)

  const { error } = await createClient()
    .storage.from(BUCKET_MEDIOS)
    .uploadToSignedUrl(path, token, archivo, { contentType: mime })
  if (error) throw new Error(`No se pudo subir ${file.name}: ${error.message}`)

  return { path, nombre: file.name, mime, bytes: archivo.size, ancho, alto }
}

export function formatearBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
