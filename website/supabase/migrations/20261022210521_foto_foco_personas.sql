-- ============================================================================
-- ENCUADRE DE LAS FOTOS DEL PLANTEL Y DEL CUERPO TÉCNICO
--
-- El punto de la foto que se mantiene visible al recortarla, de 0 a 100 en cada
-- eje (ver lib/contenido/foco.ts). NULL es "sin ajustar": cada lugar muestra su
-- recorte de siempre (la ficha de la serie desde arriba, los avatares al centro)
-- hasta que alguien mueve la foto en el admin.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS foto_foco_x smallint;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS foto_foco_y smallint;

ALTER TABLE equipos ADD COLUMN IF NOT EXISTS entrenador_foco_x smallint;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS entrenador_foco_y smallint;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS asistente_tecnico_foco_x smallint;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS asistente_tecnico_foco_y smallint;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS preparador_fisico_foco_x smallint;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS preparador_fisico_foco_y smallint;

-- El encuadre va de 0 a 100 por eje; NULL (sin ajustar) queda permitido
ALTER TABLE jugadores DROP CONSTRAINT IF EXISTS jugadores_foto_foco_rango;
ALTER TABLE jugadores ADD CONSTRAINT jugadores_foto_foco_rango
  CHECK (foto_foco_x BETWEEN 0 AND 100 AND foto_foco_y BETWEEN 0 AND 100);

ALTER TABLE equipos DROP CONSTRAINT IF EXISTS equipos_foto_foco_rango;
ALTER TABLE equipos ADD CONSTRAINT equipos_foto_foco_rango
  CHECK (entrenador_foco_x BETWEEN 0 AND 100 AND entrenador_foco_y BETWEEN 0 AND 100
    AND asistente_tecnico_foco_x BETWEEN 0 AND 100 AND asistente_tecnico_foco_y BETWEEN 0 AND 100
    AND preparador_fisico_foco_x BETWEEN 0 AND 100 AND preparador_fisico_foco_y BETWEEN 0 AND 100);

-- La página de la serie muestra estas fotos con la clave pública, así que el
-- encuadre se suma al GRANT por columnas (migraciones 005 y 007)
GRANT SELECT (
  entrenador_foco_x, entrenador_foco_y,
  asistente_tecnico_foco_x, asistente_tecnico_foco_y,
  preparador_fisico_foco_x, preparador_fisico_foco_y
) ON equipos TO anon, authenticated;

-- Las vistas del plantel se recrean (no basta CREATE OR REPLACE: j.* trae las
-- columnas nuevas), como en la migración 004
DROP VIEW IF EXISTS vista_plantel_publico;
DROP VIEW IF EXISTS vista_jugadores_completa;

CREATE VIEW vista_jugadores_completa AS
SELECT
  j.*,
  TRIM(j.nombre || ' ' || j.apellidos) AS nombre_completo,
  EXTRACT(YEAR FROM AGE(j.fecha_nacimiento))::INT AS edad,
  p.nombre AS posicion,
  p.abreviatura AS posicion_abr,
  e.nombre AS equipo,
  c.nombre AS categoria,
  COALESCE(jp.ids, ARRAY_REMOVE(ARRAY[j.posicion_id], NULL)) AS posiciones_ids,
  COALESCE(jp.nombres, ARRAY_REMOVE(ARRAY[p.nombre::TEXT], NULL)) AS posiciones,
  COALESCE(jp.abreviaturas, ARRAY_REMOVE(ARRAY[p.abreviatura::TEXT], NULL)) AS posiciones_abr
FROM jugadores j
LEFT JOIN posiciones p ON j.posicion_id = p.id
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

-- El encuadre va al final: CREATE OR REPLACE VIEW solo agrega columnas al final
CREATE VIEW vista_plantel_publico AS
SELECT
  id, nombre, apellidos, nombre_completo, foto_url, dorsal, estado, activo,
  equipo_id, equipo, categoria, posicion, posicion_abr, posiciones, posiciones_abr,
  nacionalidad, foto_foco_x, foto_foco_y
FROM vista_jugadores_completa
WHERE activo;

-- Permisos como en las migraciones 004 y 005
REVOKE ALL ON vista_jugadores_completa FROM anon, authenticated;
GRANT SELECT ON vista_plantel_publico TO anon, authenticated;
