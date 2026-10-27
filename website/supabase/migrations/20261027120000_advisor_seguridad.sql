-- ============================================================================
-- MIGRACIÓN - CORRECCIONES DEL SECURITY ADVISOR DE SUPABASE
--
-- Tablas que existen en producción pero no en estas migraciones (news,
-- actividades): se activa RLS sin políticas, así que anon no puede leerlas.
-- Ninguna de las dos la usa el código.
--
-- anon deja de ver en GraphQL las tablas de cuentas, cuotas, pagos, goles y
-- despublicaciones. El sitio público no las lee con anon: goles entra por
-- vista_goles_publico, que es dueña de la vista. El admin usa authenticated,
-- así que aquí no se toca authenticated.
--
-- Funciones de trigger con search_path fijo.
--
-- Se dejan a propósito las vistas SECURITY DEFINER (vista_goles_publico y
-- vista_plantel_publico): son la superficie pública de esos datos, y cambiarlo
-- a security_invoker exigiría abrir políticas sobre las tablas de origen.
--
-- Idempotente: los bloques DO se saltan si el objeto no existe.
-- ============================================================================

DO $$
BEGIN
  IF to_regclass('public.news') IS NOT NULL THEN
    ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.news FROM anon;
  END IF;

  IF to_regclass('public.actividades') IS NOT NULL THEN
    ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.actividades FROM anon;
  END IF;
END $$;

REVOKE ALL ON cuentas_panel, cuentas_redactores, cuotas, pagos, noticias_despublicaciones, goles FROM anon;

DO $$
BEGIN
  IF to_regprocedure('public.update_updated_at_column()') IS NOT NULL THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
  END IF;

  IF to_regprocedure('public.trigger_set_updated_at()') IS NOT NULL THEN
    ALTER FUNCTION public.trigger_set_updated_at() SET search_path = '';
  END IF;
END $$;
