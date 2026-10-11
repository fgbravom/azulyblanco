-- ============================================================================
-- MIGRACIÓN 005 - CIERRE DE LA CLAVE PÚBLICA
--
-- El sitio no usa Supabase Auth: el admin tiene su propia contraseña y escribe
-- con la service_role desde el servidor, que salta RLS. Aun así la base traía
-- de los esquemas antiguos políticas de escritura para el rol "authenticated",
-- y Supabase permite registrarse a cualquiera con la anon key. Con una cuenta
-- propia, un tercero podía crear jugadores falsos (salían en el plantel
-- público) y modificar estadísticas.
--
-- 1. Se borran todas las políticas que no sean de lectura y todas las que
--    dependan de estar autenticado, se llamen como se llamen en esta base.
-- 2. Los datos de pago de cada serie (cuenta, RUT) dejan de ser legibles con
--    la clave pública: equipos pasa a permisos por columna.
-- 3. vista_estadisticas_jugador y vista_partidos_completa (nombres de todo el
--    plantel histórico) quedan solo para el servidor.
-- 4. vista_plantel_publico deja fuera a los jugadores dados de baja.
-- 5. Tabla de intentos de login para frenar la fuerza bruta.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

-- 1. POLÍTICAS ---------------------------------------------------------------
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        cmd <> 'SELECT'
        OR 'authenticated' = ANY (roles)
        OR COALESCE(qual, '') ~* 'auth\.(role|uid|jwt)'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 2. DATOS DE PAGO DE LAS SERIES ---------------------------------------------
REVOKE SELECT ON equipos FROM anon, authenticated;
GRANT SELECT (
  id, categoria_id, nombre, temporada, entrenador, asistente_tecnico,
  preparador_fisico, activo, created_at, updated_at
) ON equipos TO anon, authenticated;

-- 3. VISTAS CON NOMBRES DEL PLANTEL ------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.vista_estadisticas_jugador') IS NOT NULL THEN
    REVOKE ALL ON vista_estadisticas_jugador FROM anon, authenticated, PUBLIC;
  END IF;
  IF to_regclass('public.vista_partidos_completa') IS NOT NULL THEN
    REVOKE ALL ON vista_partidos_completa FROM anon, authenticated, PUBLIC;
  END IF;
END $$;

REVOKE ALL ON vista_jugadores_completa FROM PUBLIC;
REVOKE ALL ON vista_cuotas FROM PUBLIC;

-- 4. PLANTEL PÚBLICO: SOLO JUGADORES ACTIVOS ---------------------------------
CREATE OR REPLACE VIEW vista_plantel_publico AS
SELECT
  id, nombre, apellidos, nombre_completo, foto_url, dorsal, estado, activo,
  equipo_id, equipo, categoria, posicion, posicion_abr, posiciones, posiciones_abr
FROM vista_jugadores_completa
WHERE activo;

GRANT SELECT ON vista_plantel_publico TO anon, authenticated;

-- 5. INTENTOS DE LOGIN -------------------------------------------------------
-- Solo la escribe y lee el servidor (service_role). RLS sin políticas.
CREATE TABLE IF NOT EXISTS login_intentos (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_intentos_ip ON login_intentos(ip, created_at DESC);

ALTER TABLE login_intentos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON login_intentos FROM anon, authenticated;
