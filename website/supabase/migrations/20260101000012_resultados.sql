-- ============================================================================
-- MIGRACIÓN 012 - RESULTADOS DE LOS PARTIDOS
-- Goles de cada lado del partido, en el mismo orden que el texto del rival
-- ("AYB VS SM" → goles_local = AYB, goles_visitante = SM).
--
-- Ambos NULL = el partido aún no tiene resultado. Se cargan desde el admin
-- después de jugarse.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

ALTER TABLE programacion ADD COLUMN IF NOT EXISTS goles_local SMALLINT;
ALTER TABLE programacion ADD COLUMN IF NOT EXISTS goles_visitante SMALLINT;

-- Un resultado va completo (los dos lados) o no va, y nunca con goles negativos.
-- Los IS NOT NULL son necesarios: "2 >= 0 AND NULL >= 0" da NULL y un CHECK con NULL pasa.
ALTER TABLE programacion DROP CONSTRAINT IF EXISTS programacion_resultado_valido;
ALTER TABLE programacion ADD CONSTRAINT programacion_resultado_valido CHECK (
  (goles_local IS NULL AND goles_visitante IS NULL)
  OR (goles_local IS NOT NULL AND goles_visitante IS NOT NULL AND goles_local >= 0 AND goles_visitante >= 0)
);
