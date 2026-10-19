-- ============================================================================
-- MIGRACIÓN 015 - AUTOGOLES DE JUGADORES DE AYB
-- Un autogol de un jugador de AYB suma para el rival: se guarda en el lado
-- del rival, con en_contra = TRUE y el jugador como autor.
--
-- en_contra queda así:
--   lado de AYB   → autogol del rival a favor de AYB (sin autor)
--   lado del rival → autogol de un jugador de AYB (con autor)
-- En ambos casos no hay asistencia.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

ALTER TABLE goles DROP CONSTRAINT IF EXISTS goles_autogol_sin_autor;

ALTER TABLE goles DROP CONSTRAINT IF EXISTS goles_autogol_sin_asistencia;
ALTER TABLE goles ADD CONSTRAINT goles_autogol_sin_asistencia CHECK (NOT en_contra OR asistencia_id IS NULL);
