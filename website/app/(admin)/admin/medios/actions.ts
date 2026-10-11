'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { BUCKET_MEDIOS, type Medio } from '@/lib/contenido/tipos'

const EXTENSIONES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export type DestinoSubida = { tipo: 'biblioteca' } | { tipo: 'album'; albumId: string } | { tipo: 'hero' }

/**
 * Entrega una URL firmada para que el navegador suba el archivo directo a
 * Supabase Storage, sin pasar por la función de Vercel (límite de 4,5 MB).
 */
export async function prepararSubida(destino: DestinoSubida, mime: string) {
  await requireAdmin()

  const ext = EXTENSIONES[mime]
  if (!ext) throw new Error('Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF.')

  const ahora = new Date()
  const path =
    destino.tipo === 'album'
      ? `galeria/${destino.albumId}/${crypto.randomUUID()}.${ext}`
      : destino.tipo === 'hero'
        ? // El servidor genera los anchos finales en la misma carpeta (ver admin/hero/actions.ts)
          `hero/${crypto.randomUUID()}/original.${ext}`
        : `biblioteca/${ahora.getFullYear()}/${String(ahora.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${ext}`

  const { data, error } = await createAdminClient().storage.from(BUCKET_MEDIOS).createSignedUploadUrl(path)
  if (error) throw new Error(`No se pudo preparar la subida: ${error.message}`)

  return { path: data.path, token: data.token }
}

export async function listarMedios(): Promise<Medio[]> {
  await requireAdmin()

  const { data, error } = await createAdminClient()
    .from('medios')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw new Error(error.message)
  return data as Medio[]
}

export async function registrarMedio(input: {
  path: string
  nombre: string
  mime: string
  bytes: number
  ancho: number
  alto: number
}): Promise<Medio> {
  await requireAdmin()
  if (!input.path.startsWith('biblioteca/')) throw new Error('Ruta inválida')

  const supabase = createAdminClient()
  const url = supabase.storage.from(BUCKET_MEDIOS).getPublicUrl(input.path).data.publicUrl

  const { data, error } = await supabase
    .from('medios')
    .insert({ ...input, url })
    .select()
    .single()
  if (error) throw new Error(error.message)

  revalidatePath('/admin/medios')
  return data as Medio
}

export async function eliminarMedio(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: medio, error } = await supabase.from('medios').select('path').eq('id', id).single()
  if (error) throw new Error(error.message)

  await supabase.storage.from(BUCKET_MEDIOS).remove([medio.path])
  const { error: errorBorrado } = await supabase.from('medios').delete().eq('id', id)
  if (errorBorrado) throw new Error(errorBorrado.message)

  revalidatePath('/admin/medios')
}
