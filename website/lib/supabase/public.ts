import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente de solo lectura para el sitio público (anon key, sin cookies).
 * Al no tocar cookies, las páginas que lo usan pueden seguir siendo estáticas
 * y regenerarse con revalidatePath desde el admin.
 *
 * Devuelve null si Supabase no está configurado.
 */
export function createPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) return null

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
