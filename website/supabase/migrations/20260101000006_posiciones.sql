-- ============================================================================
-- MIGRACIÓN 006 - POSICIONES: NOMBRES DE PRODUCCIÓN Y VOLANTES
--
-- 1. En producción las posiciones se renombraron a mano (Portero → Arquero,
--    Pivote → Mediocampista Defensivo, MED → MC, MCO → MO) y ninguna
--    migración lo registraba: una base local quedaba con los nombres viejos.
--    En producción estos UPDATE no cambian nada.
-- 2. Volante Derecho y Volante Izquierdo, que el formulario de inscripción
--    de jugadores ofrece con las siglas VOL D y VOL I.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

-- 1. NOMBRES DE PRODUCCIÓN ----------------------------------------------------
UPDATE posiciones SET nombre = 'Arquero', abreviatura = 'POR' WHERE nombre = 'Portero';
UPDATE posiciones SET nombre = 'Mediocampista Defensivo', abreviatura = 'MDC' WHERE nombre = 'Pivote';
UPDATE posiciones SET abreviatura = 'MC' WHERE nombre = 'Mediocampista';
UPDATE posiciones SET abreviatura = 'MO' WHERE nombre = 'Mediocampista Ofensivo';

-- 2. VOLANTES -----------------------------------------------------------------
INSERT INTO posiciones (nombre, abreviatura) VALUES
  ('Volante Derecho', 'VOL D'),
  ('Volante Izquierdo', 'VOL I')
ON CONFLICT (nombre) DO NOTHING;
