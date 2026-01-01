import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase con privilegios de administrador (service_role)
 * Úsalo solo en APIs del admin que requieren bypass de RLS
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
