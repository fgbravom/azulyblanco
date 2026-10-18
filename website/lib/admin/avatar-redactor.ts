import type { createAdminClient } from '@/lib/supabase/admin'
import { BUCKET_MEDIOS } from '@/lib/contenido/tipos'

type Cliente = ReturnType<typeof createAdminClient>

/** Ruta en el bucket de un avatar subido desde el admin; null si es un archivo de public/ */
export function pathAvatarEnBucket(url: string | null) {
  const path = url?.split(`/object/public/${BUCKET_MEDIOS}/`)[1]
  return path?.startsWith('redactores/') ? path : null
}

/** URL pública de un avatar ya subido con URL firmada (destino "redactor") */
export function urlAvatar(supabase: Cliente, avatarPath: string) {
  if (!avatarPath.startsWith('redactores/') || avatarPath.includes('..')) throw new Error('Ruta de avatar inválida')
  return supabase.storage.from(BUCKET_MEDIOS).getPublicUrl(avatarPath).data.publicUrl
}

/** Borra del bucket un avatar que ya no se usa; los de public/ no se tocan */
export async function borrarAvatar(supabase: Cliente, url: string | null) {
  const path = pathAvatarEnBucket(url)
  if (path) await supabase.storage.from(BUCKET_MEDIOS).remove([path])
}
