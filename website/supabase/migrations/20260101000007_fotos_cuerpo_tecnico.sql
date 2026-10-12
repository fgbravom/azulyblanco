-- ============================================================================
-- MIGRACIÓN 007 - FOTOS DEL CUERPO TÉCNICO
--
-- Cada equipo guarda la foto del director técnico, del asistente y del
-- preparador físico. La página de la serie las muestra con la clave pública,
-- así que se suman al GRANT por columnas de la migración 005.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

ALTER TABLE equipos ADD COLUMN IF NOT EXISTS entrenador_foto_url TEXT;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS asistente_tecnico_foto_url TEXT;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS preparador_fisico_foto_url TEXT;

GRANT SELECT (
  entrenador_foto_url, asistente_tecnico_foto_url, preparador_fisico_foto_url
) ON equipos TO anon, authenticated;
