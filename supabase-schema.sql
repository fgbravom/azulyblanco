-- ============================================
-- SCRIPT SQL PARA SUPABASE - AZUL Y BLANCO
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: clubs
-- Información general del club
-- ============================================
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  founded_year INTEGER,
  description TEXT,
  mission TEXT,
  colors JSONB,
  logo_url TEXT,
  shield_url TEXT,
  social_links JSONB,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  location_coords JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: players
-- Jugadores del club
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  jersey_number INTEGER,
  position VARCHAR(50),
  date_of_birth DATE,
  photo_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  joined_date DATE,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_active ON players(is_active);

-- ============================================
-- TABLA: teams
-- Equipos del club
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  photo_url TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: team_players
-- Relación jugadores-equipos
-- ============================================
CREATE TABLE IF NOT EXISTS team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  season VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, player_id, season)
);

-- ============================================
-- TABLA: matches
-- Partidos
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id),
  opponent_name VARCHAR(100) NOT NULL,
  opponent_shield_url TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(255),
  is_home BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'scheduled',
  home_score INTEGER,
  away_score INTEGER,
  competition VARCHAR(100),
  match_details JSONB,
  highlights_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- ============================================
-- TABLA: match_events
-- Eventos del partido
-- ============================================
CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  event_type VARCHAR(20) NOT NULL,
  minute INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: news
-- Noticias
-- ============================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author VARCHAR(100),
  category VARCHAR(50),
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);

-- ============================================
-- TABLA: gallery_albums
-- Álbumes de fotos
-- ============================================
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  event_date DATE,
  category VARCHAR(50),
  is_published BOOLEAN DEFAULT true,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_albums_date ON gallery_albums(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_albums_category ON gallery_albums(category);

-- ============================================
-- TABLA: gallery_photos
-- Fotos individuales
-- ============================================
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  photographer VARCHAR(100),
  taken_at TIMESTAMPTZ,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_album ON gallery_photos(album_id, sort_order);

-- ============================================
-- TABLA: sponsors
-- Sponsors
-- ============================================
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  tier VARCHAR(20),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: contact_messages
-- Mensajes de contacto
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_read ON contact_messages(is_read, created_at DESC);

-- ============================================
-- TABLA: history_timeline
-- Timeline histórico
-- ============================================
CREATE TABLE IF NOT EXISTS history_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  event_type VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_year ON history_timeline(year ASC);

-- ============================================
-- TABLA: profiles
-- Perfiles de usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_albums_updated_at ON gallery_albums;
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON gallery_albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para photo_count en álbumes
CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gallery_albums
  SET photo_count = (
    SELECT COUNT(*) FROM gallery_photos WHERE album_id = COALESCE(NEW.album_id, OLD.album_id)
  )
  WHERE id = COALESCE(NEW.album_id, OLD.album_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_photo_count_insert ON gallery_photos;
CREATE TRIGGER update_photo_count_insert AFTER INSERT ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_album_photo_count();

DROP TRIGGER IF EXISTS update_photo_count_delete ON gallery_photos;
CREATE TRIGGER update_photo_count_delete AFTER DELETE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_album_photo_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY IF NOT EXISTS "Public read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read players" ON players FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read team_players" ON team_players FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read match_events" ON match_events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read news" ON news FOR SELECT USING (is_published = true);
CREATE POLICY IF NOT EXISTS "Public read albums" ON gallery_albums FOR SELECT USING (is_published = true);
CREATE POLICY IF NOT EXISTS "Public read photos" ON gallery_photos FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read sponsors" ON sponsors FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Public read timeline" ON history_timeline FOR SELECT USING (true);

-- Políticas de escritura para admins
CREATE POLICY IF NOT EXISTS "Admin all clubs" ON clubs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY IF NOT EXISTS "Admin write players" ON players FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY IF NOT EXISTS "Admin write news" ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY IF NOT EXISTS "Admin write albums" ON gallery_albums FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY IF NOT EXISTS "Admin write photos" ON gallery_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Política para contact_messages
CREATE POLICY IF NOT EXISTS "Anyone insert messages" ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admin read messages" ON contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para profiles
CREATE POLICY IF NOT EXISTS "Users view own profile" ON profiles FOR SELECT USING (
  auth.uid() = id
);

CREATE POLICY IF NOT EXISTS "Users update own profile" ON profiles FOR UPDATE USING (
  auth.uid() = id
);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('club-images', 'club-images', true),
  ('player-photos', 'player-photos', true),
  ('gallery', 'gallery', true),
  ('news-images', 'news-images', true),
  ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY IF NOT EXISTS "Public read storage" ON storage.objects FOR SELECT
  USING (bucket_id IN ('club-images', 'player-photos', 'gallery', 'news-images', 'logos'));

CREATE POLICY IF NOT EXISTS "Admin upload storage" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('club-images', 'player-photos', 'gallery', 'news-images', 'logos')
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY IF NOT EXISTS "Admin delete storage" ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('club-images', 'player-photos', 'gallery', 'news-images', 'logos')
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- ============================================
-- DATOS INICIALES (Opcional)
-- ============================================

-- Insertar información básica del club
INSERT INTO clubs (name, slug, founded_year, description, contact_email)
VALUES (
  'Azul y Blanco',
  'azul-y-blanco',
  2010,
  'Club de fútbol amateur apasionado por el deporte',
  'contacto@azulyblanco.com'
) ON CONFLICT (slug) DO NOTHING;

-- Insertar equipo principal
INSERT INTO teams (name, category, is_main)
VALUES ('Primera División', 'Primera', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificar que todo se creó correctamente
SELECT 'Tablas creadas exitosamente!' as status;
