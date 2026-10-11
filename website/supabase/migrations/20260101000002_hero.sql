-- ============================================================================
-- MIGRACIÓN 002 - FOTOS DEL HERO (PORTADA)
-- Las fotos rotativas de la portada, por separado para escritorio y móvil.
--
-- Cada foto existe en varios anchos y formatos (AVIF y WebP). base_url es el
-- prefijo común: el sitio pide base_url || ancho || '.avif' (o '.webp').
--   - Fotos del repositorio:   /images/hero/fotoportada0-   → fotoportada0-1920.avif
--   - Fotos subidas en /admin: https://…/medios/hero/<id>/  → <id>/1920.avif
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS hero_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo TEXT NOT NULL CHECK (dispositivo IN ('desktop', 'mobile')),
  base_url TEXT NOT NULL,
  carpeta TEXT,          -- carpeta en el bucket "medios"; NULL si el archivo vive en el repositorio
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  ancho_original INTEGER,
  alto_original INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_fotos_orden ON hero_fotos(dispositivo, orden);

ALTER TABLE hero_fotos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de fotos activas del hero" ON hero_fotos;
CREATE POLICY "Lectura pública de fotos activas del hero" ON hero_fotos
  FOR SELECT USING (activo);

-- Las 14 fotos que hoy están en public/images/hero (components/hero/hero-manifest.json),
-- para que el hero siga igual y se puedan gestionar desde el admin.
INSERT INTO hero_fotos (dispositivo, base_url, orden)
SELECT 'desktop', '/images/hero/fotoportada' || n || '-', n FROM generate_series(0, 6) AS n
WHERE NOT EXISTS (SELECT 1 FROM hero_fotos WHERE dispositivo = 'desktop');

INSERT INTO hero_fotos (dispositivo, base_url, orden)
SELECT 'mobile', '/images/hero/portadamovil' || n || '-', n FROM generate_series(0, 6) AS n
WHERE NOT EXISTS (SELECT 1 FROM hero_fotos WHERE dispositivo = 'mobile');
