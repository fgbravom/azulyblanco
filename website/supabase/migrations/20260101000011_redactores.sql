-- ============================================================================
-- MIGRACIÓN 011 - REDACTORES
-- Catálogo de quienes escriben las noticias: nombre y avatar.
--
-- Las noticias guardan el autor como texto; ahora pueden además referenciar
-- al redactor del catálogo para mostrar su avatar en el sitio. El texto se
-- mantiene como respaldo (y para las noticias antiguas).
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS redactores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,          -- "Felipe Bravo"
  avatar_url TEXT,               -- imagen en el bucket "medios" (carpeta redactores/)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un solo registro por persona, sin importar mayúsculas
CREATE UNIQUE INDEX IF NOT EXISTS idx_redactores_nombre_unico ON redactores(LOWER(nombre));

-- La noticia apunta al redactor del catálogo. Si el redactor se elimina,
-- la noticia conserva el nombre en autor.
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS redactor_id UUID REFERENCES redactores(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS update_redactores_updated_at ON redactores;
CREATE TRIGGER update_redactores_updated_at BEFORE UPDATE ON redactores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DATOS EXISTENTES
-- Cada autor que ya firma noticias pasa a ser un redactor del catálogo, y sus
-- noticias quedan vinculadas.
-- ============================================================================
INSERT INTO redactores (nombre)
SELECT DISTINCT ON (LOWER(TRIM(autor))) TRIM(autor)
FROM noticias
WHERE NULLIF(TRIM(autor), '') IS NOT NULL
ORDER BY LOWER(TRIM(autor)), TRIM(autor)
ON CONFLICT DO NOTHING;

UPDATE noticias n
SET redactor_id = r.id
FROM redactores r
WHERE n.redactor_id IS NULL
  AND LOWER(TRIM(n.autor)) = LOWER(r.nombre);

-- Los avatares que hasta ahora vivían en public/images/authors
UPDATE redactores
SET avatar_url = '/images/authors/' || REGEXP_REPLACE(LOWER(nombre), '\s+', '-', 'g') || '.jpg'
WHERE avatar_url IS NULL
  AND REGEXP_REPLACE(LOWER(nombre), '\s+', '-', 'g') IN ('cristina-reyes', 'javier-lizana', 'victor-reyes');

-- ============================================================================
-- SEGURIDAD (RLS)
-- El sitio público lee el catálogo con la anon key (nombre y avatar se
-- muestran en cada noticia). La escritura es solo vía service_role.
-- ============================================================================
ALTER TABLE redactores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de redactores" ON redactores;
CREATE POLICY "Lectura pública de redactores" ON redactores
  FOR SELECT USING (true);
