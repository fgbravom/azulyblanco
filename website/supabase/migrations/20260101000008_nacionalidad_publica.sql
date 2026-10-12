-- ============================================================================
-- MIGRACIÓN 008 - NACIONALIDAD EN EL PLANTEL PÚBLICO
--
-- La card de cada jugador en la página de la serie muestra la bandera de su
-- país, así que vista_plantel_publico suma la nacionalidad. Va al final
-- porque CREATE OR REPLACE VIEW solo permite agregar columnas al final.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

CREATE OR REPLACE VIEW vista_plantel_publico AS
SELECT
  id, nombre, apellidos, nombre_completo, foto_url, dorsal, estado, activo,
  equipo_id, equipo, categoria, posicion, posicion_abr, posiciones, posiciones_abr,
  nacionalidad
FROM vista_jugadores_completa
WHERE activo;

GRANT SELECT ON vista_plantel_publico TO anon, authenticated;
