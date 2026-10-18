-- ============================================================================
-- MIGRACIÓN 014 - GOLES DE LOS PARTIDOS
-- Quién hizo cada gol de AYB y quién lo asistió.
--
-- Una fila por gol, del lado (local o visitante) que corresponde a AYB en el
-- texto del rival ("AYB VS SM" → lado 'local'). En un partido interno
-- ("SERIE HONOR VS SERIE 35") hay goles de los dos lados.
--
-- en_contra = autogol del rival: no tiene goleador de AYB.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS goles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programacion_id UUID NOT NULL REFERENCES programacion(id) ON DELETE CASCADE,
  lado TEXT NOT NULL CHECK (lado IN ('local', 'visitante')),
  orden SMALLINT NOT NULL DEFAULT 0, -- 0 = primer gol de ese lado
  -- Si el jugador se borra, el gol se conserva sin nombre
  autor_id BIGINT REFERENCES jugadores(id) ON DELETE SET NULL,
  asistencia_id BIGINT REFERENCES jugadores(id) ON DELETE SET NULL,
  en_contra BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT goles_autogol_sin_autor CHECK (NOT en_contra OR autor_id IS NULL),
  CONSTRAINT goles_asistencia_de_otro CHECK (asistencia_id IS NULL OR asistencia_id IS DISTINCT FROM autor_id)
);

CREATE INDEX IF NOT EXISTS idx_goles_programacion ON goles(programacion_id);

-- ============================================================================
-- SEGURIDAD (RLS)
-- La tabla es solo del servidor (service_role). El sitio lee los goles por
-- vista_goles_publico, que trae el nombre del jugador y nada más de su ficha.
-- ============================================================================
ALTER TABLE goles ENABLE ROW LEVEL SECURITY;

DROP VIEW IF EXISTS vista_goles_publico;
CREATE VIEW vista_goles_publico AS
SELECT
  g.programacion_id, g.lado, g.orden, g.en_contra,
  a.nombre AS autor_nombre, a.apellidos AS autor_apellidos,
  s.nombre AS asistencia_nombre, s.apellidos AS asistencia_apellidos
FROM goles g
JOIN programacion p ON p.id = g.programacion_id
LEFT JOIN jugadores a ON a.id = g.autor_id
LEFT JOIN jugadores s ON s.id = g.asistencia_id
WHERE p.publicado;

GRANT SELECT ON vista_goles_publico TO anon, authenticated;
