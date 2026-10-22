-- ============================================================================
-- RECORTES DE LAS FOTOS DEL PLANTEL Y DEL CUERPO TÉCNICO
--
-- Además del punto fijo (migración 018), cada recorte puede acercar la foto:
-- foto_*_ancho es el ancho de la foto respecto al marco, en % (ver
-- lib/contenido/foco.ts). NULL sigue siendo "sin ajustar" o "sin acercar".
--
-- La foto del jugador tiene dos recortes independientes, porque no se ven igual
-- en todos lados: foto_foco_* es el de la ficha del plantel y foto_cara_* el del
-- avatar (que debe mostrar la cara).
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS foto_foco_ancho smallint;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS foto_cara_x smallint;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS foto_cara_y smallint;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS foto_cara_ancho smallint;

ALTER TABLE equipos ADD COLUMN IF NOT EXISTS entrenador_foco_ancho smallint;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS asistente_tecnico_foco_ancho smallint;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS preparador_fisico_foco_ancho smallint;

-- El punto fijo va de 0 a 100 por eje y el ancho, de 10% a 2000% del marco
ALTER TABLE jugadores DROP CONSTRAINT IF EXISTS jugadores_foto_cara_rango;
ALTER TABLE jugadores ADD CONSTRAINT jugadores_foto_cara_rango
  CHECK (foto_cara_x BETWEEN 0 AND 100 AND foto_cara_y BETWEEN 0 AND 100);

ALTER TABLE jugadores DROP CONSTRAINT IF EXISTS jugadores_foto_ancho_rango;
ALTER TABLE jugadores ADD CONSTRAINT jugadores_foto_ancho_rango
  CHECK (foto_foco_ancho BETWEEN 10 AND 2000 AND foto_cara_ancho BETWEEN 10 AND 2000);

ALTER TABLE equipos DROP CONSTRAINT IF EXISTS equipos_foto_ancho_rango;
ALTER TABLE equipos ADD CONSTRAINT equipos_foto_ancho_rango
  CHECK (entrenador_foco_ancho BETWEEN 10 AND 2000
    AND asistente_tecnico_foco_ancho BETWEEN 10 AND 2000
    AND preparador_fisico_foco_ancho BETWEEN 10 AND 2000);

-- La ficha de la serie se muestra con la clave pública, así que su tamaño de
-- recorte se suma al GRANT por columnas (migraciones 005 y 007)
GRANT SELECT (
  entrenador_foco_ancho, asistente_tecnico_foco_ancho, preparador_fisico_foco_ancho
) ON equipos TO anon, authenticated;

-- Las vistas del plantel se recrean (no basta CREATE OR REPLACE: j.* trae las
-- columnas nuevas), como en las migraciones 004 y 018
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

-- El recorte de la cara se queda solo en el admin: la vista pública solo trae
-- el de la ficha del plantel
CREATE VIEW vista_plantel_publico AS
SELECT
  id, nombre, apellidos, nombre_completo, foto_url, dorsal, estado, activo,
  equipo_id, equipo, categoria, posicion, posicion_abr, posiciones, posiciones_abr,
  nacionalidad, foto_foco_x, foto_foco_y, foto_foco_ancho
FROM vista_jugadores_completa
WHERE activo;

-- Permisos como en las migraciones 004 y 005
REVOKE ALL ON vista_jugadores_completa FROM anon, authenticated;
GRANT SELECT ON vista_plantel_publico TO anon, authenticated;
