-- ============================================================================
-- MIGRACIÓN 009 - NACIONALIDADES CANÓNICAS
--
-- La nacionalidad del jugador ahora se elige de un listado fijo (Argentina,
-- Chile, Colombia, Haití, Perú y Venezuela), así que los valores guardados
-- como gentilicio ("chilena", "haitiano"...) se normalizan al nombre del
-- país. Lo que no se reconoce queda igual: se corrige a mano desde el admin.
-- El valor por defecto 'España' venía del esquema inicial y no corresponde
-- al club: pasa a 'Chile'.
--
-- Idempotente: volver a correrla no cambia nada.
-- ============================================================================

ALTER TABLE jugadores ALTER COLUMN nacionalidad SET DEFAULT 'Chile';

UPDATE jugadores
SET nacionalidad = CASE
  WHEN lower(trim(nacionalidad)) LIKE 'chil%' THEN 'Chile'
  WHEN lower(trim(nacionalidad)) LIKE 'hait%' THEN 'Haití'
  WHEN lower(trim(nacionalidad)) LIKE 'venez%' THEN 'Venezuela'
  WHEN lower(trim(nacionalidad)) LIKE 'peru%' THEN 'Perú'
  WHEN lower(trim(nacionalidad)) LIKE 'perú%' THEN 'Perú'
  WHEN lower(trim(nacionalidad)) LIKE 'argen%' THEN 'Argentina'
  WHEN lower(trim(nacionalidad)) LIKE 'colomb%' THEN 'Colombia'
  ELSE nacionalidad
END
WHERE nacionalidad IS NOT NULL;
