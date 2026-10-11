-- ============================================================================
-- MIGRACIÓN 001 - CONTENIDO ADMINISTRABLE
-- Programación, noticias, galería, biblioteca de imágenes e info de series.
--
-- Hasta ahora este contenido vivía en archivos del repositorio (lib/data,
-- noticias/*.md, public/galeria), que Vercel no permite modificar en
-- producción. Con estas tablas el panel /admin puede editarlo en vivo.
--
-- Se ejecuta una sola vez en el SQL Editor de Supabase. Es idempotente:
-- volver a correrla no duplica nada.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. PROGRAMACIÓN DE ACTIVIDADES
-- Partidos, entrenamientos y eventos del calendario público.
-- ============================================================================
CREATE TABLE IF NOT EXISTS programacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('partido', 'entrenamiento', 'evento')),
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,

  rival TEXT,          -- partido: "AYB VS CLUB AMÉRICA"
  tipo_partido TEXT CHECK (tipo_partido IN ('Amistoso', 'Oficial', 'Torneo', 'Copa')),
  actividad TEXT,      -- entrenamiento: "ENTRENAMIENTO", "PREPARACIÓN FÍSICA"
  titulo TEXT,         -- evento
  descripcion TEXT,    -- evento

  estadio TEXT NOT NULL DEFAULT '',
  confirmado BOOLEAN NOT NULL DEFAULT FALSE,
  llevar TEXT,
  precio_entrada TEXT,
  edad_gratis TEXT,
  series TEXT[] NOT NULL DEFAULT '{}',

  publicado BOOLEAN NOT NULL DEFAULT TRUE,
  legacy_id TEXT UNIQUE, -- id del archivo lib/data del que se importó
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programacion_fecha ON programacion(fecha);

-- ============================================================================
-- 2. NOTICIAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  bajada TEXT NOT NULL DEFAULT '',
  contenido TEXT NOT NULL DEFAULT '', -- Markdown
  categoria TEXT NOT NULL DEFAULT 'Institucional',
  tags TEXT[] NOT NULL DEFAULT '{}',
  autor TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  portada_url TEXT,
  publicado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_noticias_fecha ON noticias(fecha DESC);

-- ============================================================================
-- 3. GALERÍA: ÁLBUMES Y FOTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS albumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL DEFAULT 'eventos'
    CHECK (categoria IN ('partidos', 'entrenamientos', 'eventos', 'historia')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  portada_url TEXT,
  publicado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albumes(id) ON DELETE CASCADE,
  path TEXT NOT NULL UNIQUE, -- ruta dentro del bucket "medios"
  url TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  ancho INTEGER,
  alto INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_album ON fotos(album_id, orden);

-- ============================================================================
-- 4. BIBLIOTECA DE IMÁGENES
-- Imágenes sueltas para portadas de noticias, fotos de jugadores y series.
-- ============================================================================
CREATE TABLE IF NOT EXISTS medios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  nombre TEXT NOT NULL,
  mime TEXT,
  bytes INTEGER,
  ancho INTEGER,
  alto INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medios_created ON medios(created_at DESC);

-- ============================================================================
-- 5. INFORMACIÓN DE LAS SERIES (columnas nuevas en categorias)
-- ============================================================================
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS titulo TEXT;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS contenido TEXT;         -- Markdown
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS horario_entrenamiento TEXT;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS lugar_entrenamiento TEXT;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS competencia TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_slug ON categorias(slug);

-- Valores iniciales: los mismos textos que hoy están fijos en app/series/*
UPDATE categorias SET slug = 'primera', titulo = COALESCE(titulo, 'Serie Primera'),
  descripcion = COALESCE(NULLIF(descripcion, 'Equipo de Primera División'), 'El equipo principal del club, representando los colores azul y blanco.')
  WHERE nombre = 'Primera' AND slug IS NULL;
UPDATE categorias SET slug = 'honor', titulo = COALESCE(titulo, 'Serie Honor'),
  descripcion = COALESCE(NULLIF(descripcion, 'Equipo de Honor'), 'Pasión y experiencia al servicio del club.')
  WHERE nombre = 'Honor' AND slug IS NULL;
UPDATE categorias SET slug = '35', titulo = COALESCE(titulo, 'Serie 35'),
  descripcion = COALESCE(NULLIF(descripcion, 'Equipo de Mayores de 35'), 'La veteranía y la garra de nuestra serie máster.')
  WHERE nombre = '35' AND slug IS NULL;

-- ============================================================================
-- 6. TRIGGERS updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_programacion_updated_at ON programacion;
CREATE TRIGGER update_programacion_updated_at BEFORE UPDATE ON programacion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_noticias_updated_at ON noticias;
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_albumes_updated_at ON albumes;
CREATE TRIGGER update_albumes_updated_at BEFORE UPDATE ON albumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. SEGURIDAD (RLS)
-- El sitio público lee con la anon key y solo ve lo publicado.
-- El admin escribe con la service_role key desde el servidor, que salta RLS.
-- ============================================================================
ALTER TABLE programacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE albumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE medios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de la programación publicada" ON programacion;
CREATE POLICY "Lectura pública de la programación publicada" ON programacion
  FOR SELECT USING (publicado);

DROP POLICY IF EXISTS "Lectura pública de noticias publicadas" ON noticias;
CREATE POLICY "Lectura pública de noticias publicadas" ON noticias
  FOR SELECT USING (publicado);

DROP POLICY IF EXISTS "Lectura pública de álbumes publicados" ON albumes;
CREATE POLICY "Lectura pública de álbumes publicados" ON albumes
  FOR SELECT USING (publicado);

DROP POLICY IF EXISTS "Lectura pública de fotos de álbumes publicados" ON fotos;
CREATE POLICY "Lectura pública de fotos de álbumes publicados" ON fotos
  FOR SELECT USING (EXISTS (SELECT 1 FROM albumes a WHERE a.id = fotos.album_id AND a.publicado));

-- medios: sin política pública; solo el admin la lista.

-- ============================================================================
-- 8. STORAGE: bucket público "medios"
-- Las subidas usan URLs firmadas que genera el servidor, así que no hace
-- falta abrir políticas de escritura.
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('medios', 'medios', TRUE, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
ON CONFLICT (id) DO UPDATE SET public = TRUE;
