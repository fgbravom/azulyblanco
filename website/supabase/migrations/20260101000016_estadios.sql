-- ============================================================================
-- MIGRACIÓN 016 - CANCHAS Y ESTADIOS
-- Catálogo de canchas y estadios donde juega el club: nombre, ubicación y
-- link al mapa.
--
-- Las actividades (tabla programacion) guardan el lugar como texto
-- ("ESTADIO ANFA"); ahora pueden además referenciar al estadio del catálogo
-- para que al renombrarlo se mantengan al día todas las actividades.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS estadios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,          -- "ESTADIO ANFA"
  ubicacion TEXT,                -- comuna o dirección, opcional
  mapa_url TEXT,                 -- link a Google Maps, opcional
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un solo registro por cancha, sin importar mayúsculas ("La Granja" = "LA GRANJA")
CREATE UNIQUE INDEX IF NOT EXISTS idx_estadios_nombre_unico ON estadios(LOWER(nombre));

-- La actividad apunta al estadio del catálogo; las antiguas quedan solo con el
-- texto. Si el estadio se elimina, la actividad conserva su lugar escrito.
ALTER TABLE programacion ADD COLUMN IF NOT EXISTS estadio_id UUID REFERENCES estadios(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS update_estadios_updated_at ON estadios;
CREATE TRIGGER update_estadios_updated_at BEFORE UPDATE ON estadios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Los lugares que ya aparecen en las programaciones, para partir con el
-- catálogo cargado. No se duplican si ya existen.
INSERT INTO estadios (nombre)
SELECT v.nombre FROM (VALUES
  ('ESTADIO ANFA'),
  ('ESTADIO ANFA CURICO'),
  ('LA GRANJA'),
  ('SOL DE SEPTIEMBRE'),
  ('AGUAS NEGRAS'),
  ('CONVENTO VIEJO'),
  ('CANCHA ISLA, CONVENTO VIEJO')
) AS v(nombre)
WHERE NOT EXISTS (SELECT 1 FROM estadios e WHERE LOWER(e.nombre) = LOWER(v.nombre));

-- ============================================================================
-- SEGURIDAD (RLS)
-- El sitio público lee el catálogo con la anon key (nombre, ubicación y mapa
-- se muestran en la programación). La escritura es solo vía service_role.
-- ============================================================================
ALTER TABLE estadios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de estadios" ON estadios;
CREATE POLICY "Lectura pública de estadios" ON estadios
  FOR SELECT USING (true);
