-- ============================================================================
-- MIGRACIÓN 003 - JUGADORES: VARIAS POSICIONES Y PRIVACIDAD
--
-- 1. Un jugador puede tener 1 o más posiciones (tabla jugador_posiciones).
--    jugadores.posicion_id se mantiene como la posición principal: la que
--    agrupa el plantel en la página de cada serie.
-- 2. vista_jugadores_completa pasa a traer todas las columnas del jugador.
--    La versión anterior no traía equipo_id ni posicion_id, así que el admin
--    no podía editar jugadores ("expected number, received undefined").
-- 3. Los datos personales (RUT, contacto, datos médicos) dejan de ser legibles
--    con la clave pública. El admin los lee con la service_role desde el
--    servidor; el sitio usa vista_plantel_publico, que solo trae lo que se
--    muestra en la web.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

-- 1. POSICIONES DE CADA JUGADOR -----------------------------------------------
CREATE TABLE IF NOT EXISTS jugador_posiciones (
  jugador_id BIGINT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  posicion_id BIGINT NOT NULL REFERENCES posiciones(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL DEFAULT 0, -- 0 = principal
  PRIMARY KEY (jugador_id, posicion_id)
);

ALTER TABLE jugador_posiciones ENABLE ROW LEVEL SECURITY;

-- Cada jugador parte con su posición actual como principal
INSERT INTO jugador_posiciones (jugador_id, posicion_id, orden)
SELECT id, posicion_id, 0 FROM jugadores WHERE posicion_id IS NOT NULL
ON CONFLICT (jugador_id, posicion_id) DO NOTHING;

-- 2. VISTA COMPLETA PARA EL ADMIN ---------------------------------------------
DROP VIEW IF EXISTS vista_plantel_publico; -- depende de la completa; se recrea abajo
DROP VIEW IF EXISTS vista_jugadores_completa;
CREATE VIEW vista_jugadores_completa AS
SELECT
  j.*,
  j.nombre || ' ' || j.apellidos AS nombre_completo,
  EXTRACT(YEAR FROM AGE(j.fecha_nacimiento))::INT AS edad,
  p.nombre AS posicion,
  p.abreviatura AS posicion_abr,
  e.nombre AS equipo,
  c.nombre AS categoria,
  COALESCE(jp.ids, ARRAY[j.posicion_id]) AS posiciones_ids,
  COALESCE(jp.nombres, ARRAY[p.nombre]::TEXT[]) AS posiciones,
  COALESCE(jp.abreviaturas, ARRAY[p.abreviatura]::TEXT[]) AS posiciones_abr
FROM jugadores j
JOIN posiciones p ON j.posicion_id = p.id
JOIN equipos e ON j.equipo_id = e.id
JOIN categorias c ON e.categoria_id = c.id
LEFT JOIN LATERAL (
  SELECT
    ARRAY_AGG(px.id ORDER BY x.orden, px.id) AS ids,
    ARRAY_AGG(px.nombre::TEXT ORDER BY x.orden, px.id) AS nombres,
    ARRAY_AGG(px.abreviatura::TEXT ORDER BY x.orden, px.id) AS abreviaturas
  FROM jugador_posiciones x
  JOIN posiciones px ON px.id = x.posicion_id
  WHERE x.jugador_id = j.id
) jp ON TRUE;

-- Solo el servidor (service_role) puede leerla: trae datos personales
REVOKE ALL ON vista_jugadores_completa FROM anon, authenticated;

-- 3. VISTA PÚBLICA DEL PLANTEL ------------------------------------------------
CREATE VIEW vista_plantel_publico AS
SELECT
  id, nombre, apellidos, nombre_completo, foto_url, dorsal, estado, activo,
  equipo_id, equipo, categoria, posicion, posicion_abr, posiciones, posiciones_abr
FROM vista_jugadores_completa;

GRANT SELECT ON vista_plantel_publico TO anon, authenticated;

-- La tabla deja de ser legible con la clave pública (antes cualquiera podía
-- leer RUT, teléfonos y datos médicos con la anon key del sitio). Se borran
-- todas las políticas de lectura, se llamen como se llamen en esta base.
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'jugadores' AND cmd IN ('SELECT', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY %I ON jugadores', pol.policyname);
  END LOOP;
END $$;
