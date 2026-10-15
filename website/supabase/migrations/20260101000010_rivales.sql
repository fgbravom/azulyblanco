-- ============================================================================
-- MIGRACIÓN 010 - RIVALES
-- Catálogo de equipos rivales: nombre, sigla, logo y sitio web.
--
-- Los partidos (tabla programacion) guardan el rival como texto
-- ("AYB VS SM"); ahora pueden además referenciar al rival del catálogo
-- para mostrar su logo y nombre completo en el sitio.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS rivales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,          -- "San Martín"
  sigla TEXT NOT NULL,           -- "SM" (lo que se muestra en la programación)
  logo_url TEXT,                 -- imagen en el bucket "medios" (carpeta rivales/)
  sitio_web TEXT,                -- https://... del club rival (opcional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un solo registro por club, sin importar mayúsculas ("San Martín" = "SAN MARTÍN")
CREATE UNIQUE INDEX IF NOT EXISTS idx_rivales_nombre_unico ON rivales(LOWER(nombre));

-- El partido apunta al rival del catálogo; los partidos antiguos quedan
-- solo con el texto. Si el rival se elimina, el partido conserva su texto.
ALTER TABLE programacion ADD COLUMN IF NOT EXISTS rival_id UUID REFERENCES rivales(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS update_rivales_updated_at ON rivales;
CREATE TRIGGER update_rivales_updated_at BEFORE UPDATE ON rivales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEGURIDAD (RLS)
-- El sitio público lee el catálogo con la anon key (nombre, sigla y logo se
-- muestran en la programación). La escritura es solo vía service_role.
-- ============================================================================
ALTER TABLE rivales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de rivales" ON rivales;
CREATE POLICY "Lectura pública de rivales" ON rivales
  FOR SELECT USING (true);
