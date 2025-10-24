# Propuesta Técnica - Sitio Web Azul y Blanco
## Stack: Next.js + Supabase + Vercel (100% Gratuito)

**Fecha:** Octubre 2025
**Inversión Total:** ~$15 USD/año (solo dominio .com)

---

## 1. STACK TECNOLÓGICO DETALLADO

### 1.1 Frontend - Next.js 14 (App Router)

**Framework:** Next.js 14.2+
- Server Components por defecto (mejor performance)
- App Router (estructura moderna)
- Image optimization automática
- Server Actions para forms
- Streaming y Suspense

**Styling:** Tailwind CSS 3.4+
- Utility-first CSS
- Responsive design built-in
- Configuración de tema personalizado (colores azul/blanco)
- Componentes reutilizables

**UI Components:** shadcn/ui
- Componentes headless y accesibles
- Totalmente customizables
- Built con Radix UI
- Sin dependencias pesadas

**State Management:**
- React Context (estado global ligero)
- Zustand (si se necesita algo más robusto)
- Server State con React Query / SWR

### 1.2 Backend - Supabase (Plan Free)

**Base de Datos:** PostgreSQL
- 500 MB de almacenamiento (Free tier)
- Queries ilimitadas
- Real-time subscriptions
- Row Level Security (RLS)

**Authentication:** Supabase Auth
- Email/Password
- Magic Links
- Social providers (Google, etc.)
- JWT tokens

**Storage:** Supabase Storage
- 1 GB de almacenamiento (Free tier)
- Perfecto para imágenes del club
- Transformaciones de imágenes automáticas
- CDN incluido

**API:** Auto-generada REST & GraphQL
- Endpoints automáticos basados en tablas
- Filtrado, ordenamiento, paginación

### 1.3 Hosting - Vercel (Plan Hobby - Free)

**Características Free Tier:**
- Despliegues ilimitados
- 100 GB bandwidth/mes
- Serverless Functions incluidas
- SSL automático (HTTPS)
- Preview deployments automáticos
- Analytics básico
- Edge Network global

### 1.4 Servicios Adicionales (Todos Gratuitos)

**Imágenes:**
- Cloudinary Free Tier: 25 GB almacenamiento + 25 GB bandwidth
- Alternativa: Supabase Storage (1 GB)

**Analytics:**
- Vercel Analytics (Free tier): 2500 eventos/mes
- Google Analytics 4 (ilimitado y gratis)

**Forms:**
- Resend (emails): 100 emails/día gratis
- EmailJS: 200 emails/mes gratis

**SEO & Metadata:**
- Next.js built-in (Open Graph, Twitter Cards)
- Sitemap automático
- robots.txt

---

## 2. ARQUITECTURA DEL PROYECTO

### 2.1 Estructura de Carpetas Next.js 14 (App Router)

```
azulyblanco/
├── app/
│   ├── (pages)/                 # Group de rutas públicas
│   │   ├── page.tsx            # Home (/)
│   │   ├── layout.tsx          # Layout principal
│   │   ├── club/
│   │   │   ├── page.tsx        # /club
│   │   │   ├── historia/
│   │   │   │   └── page.tsx    # /club/historia
│   │   │   └── directiva/
│   │   │       └── page.tsx    # /club/directiva
│   │   ├── equipos/
│   │   │   ├── page.tsx        # /equipos
│   │   │   └── [id]/
│   │   │       └── page.tsx    # /equipos/[id]
│   │   ├── noticias/
│   │   │   ├── page.tsx        # /noticias
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # /noticias/[slug]
│   │   ├── partidos/
│   │   │   ├── page.tsx        # /partidos
│   │   │   └── [id]/
│   │   │       └── page.tsx    # /partidos/[id]
│   │   ├── galeria/
│   │   │   ├── page.tsx        # /galeria
│   │   │   └── [albumId]/
│   │   │       └── page.tsx    # /galeria/[albumId]
│   │   └── contacto/
│   │       └── page.tsx        # /contacto
│   │
│   ├── (admin)/                # Group de rutas admin (protegidas)
│   │   ├── layout.tsx          # Layout con auth check
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Panel admin
│   │   ├── noticias/
│   │   │   ├── page.tsx        # Gestión noticias
│   │   │   ├── nueva/
│   │   │   │   └── page.tsx    # Crear noticia
│   │   │   └── editar/[id]/
│   │   │       └── page.tsx    # Editar noticia
│   │   ├── partidos/
│   │   │   └── page.tsx        # Gestión partidos
│   │   └── galeria/
│   │       └── page.tsx        # Subir fotos
│   │
│   ├── api/                    # API Routes
│   │   ├── auth/
│   │   │   └── route.ts        # Auth endpoints
│   │   ├── contact/
│   │   │   └── route.ts        # Form de contacto
│   │   └── upload/
│   │       └── route.ts        # Upload de imágenes
│   │
│   ├── globals.css             # Estilos globales + Tailwind
│   ├── layout.tsx              # Root layout
│   └── not-found.tsx           # 404 page
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── MobileMenu.tsx
│   ├── home/                   # Home page components
│   │   ├── HeroSection.tsx
│   │   ├── LatestNews.tsx
│   │   ├── NextMatch.tsx
│   │   ├── RecentResults.tsx
│   │   └── GalleryPreview.tsx
│   ├── partidos/               # Partidos components
│   │   ├── MatchCard.tsx
│   │   ├── MatchDetail.tsx
│   │   ├── StandingsTable.tsx
│   │   └── Calendar.tsx
│   ├── galeria/                # Galería components
│   │   ├── AlbumGrid.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── Lightbox.tsx
│   │   └── ImageUploader.tsx
│   └── shared/                 # Shared components
│       ├── PlayerCard.tsx
│       ├── NewsCard.tsx
│       ├── Breadcrumbs.tsx
│       └── LoadingSpinner.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Cliente Supabase (client-side)
│   │   ├── server.ts           # Cliente Supabase (server-side)
│   │   └── middleware.ts       # Auth middleware
│   ├── actions/                # Server Actions
│   │   ├── news.ts
│   │   ├── matches.ts
│   │   ├── gallery.ts
│   │   └── contact.ts
│   ├── utils/
│   │   ├── cn.ts               # classNames utility
│   │   ├── dates.ts            # Formateo de fechas
│   │   └── images.ts           # Image helpers
│   └── constants.ts            # Constantes del proyecto
│
├── types/
│   ├── database.types.ts       # Types auto-generados de Supabase
│   ├── news.ts
│   ├── matches.ts
│   ├── players.ts
│   └── gallery.ts
│
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── escudo.png
│   │   └── og-image.png        # Open Graph image
│   ├── fonts/                  # Custom fonts si es necesario
│   └── favicon.ico
│
├── .env.local                  # Variables de entorno (NO commitear)
├── .env.example                # Ejemplo de variables
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 2.2 Variables de Entorno (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Site Config
NEXT_PUBLIC_SITE_URL=https://azulyblanco.com

# Email (Resend)
RESEND_API_KEY=tu-resend-api-key
CONTACT_EMAIL=contacto@azulyblanco.com

# Cloudinary (Opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

---

## 3. ESQUEMA DE BASE DE DATOS (SUPABASE)

### 3.1 Tablas Principales

```sql
-- ============================================
-- TABLA: clubs
-- Información general del club (single row)
-- ============================================
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  founded_year INTEGER,
  description TEXT,
  mission TEXT,
  colors JSONB, -- {"primary": "#0047AB", "secondary": "#FFFFFF"}
  logo_url TEXT,
  shield_url TEXT,
  social_links JSONB, -- {"instagram": "url", "facebook": "url", etc.}
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  location_coords JSONB, -- {"lat": -34.xxx, "lng": -58.xxx}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: players
-- Jugadores del club
-- ============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  jersey_number INTEGER,
  position VARCHAR(50), -- 'Arquero', 'Defensor', 'Mediocampista', 'Delantero'
  date_of_birth DATE,
  photo_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  joined_date DATE,
  stats JSONB, -- {"goals": 10, "assists": 5, "matches": 20}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para players
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_active ON players(is_active);

-- ============================================
-- TABLA: teams
-- Equipos del club (Primer equipo, Reserva, etc.)
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- 'Primera', 'Reserva', 'Juvenil'
  description TEXT,
  photo_url TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: team_players
-- Relación muchos a muchos: jugadores-equipos
-- ============================================
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  season VARCHAR(20), -- '2024-2025'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, player_id, season)
);

-- ============================================
-- TABLA: matches
-- Partidos (pasados y futuros)
-- ============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id),
  opponent_name VARCHAR(100) NOT NULL,
  opponent_shield_url TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(255),
  is_home BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'live', 'finished', 'cancelled'
  home_score INTEGER,
  away_score INTEGER,
  competition VARCHAR(100), -- 'Liga Local', 'Torneo Apertura', etc.
  match_details JSONB, -- {"attendance": 500, "referee": "Juan Pérez"}
  highlights_url TEXT, -- URL de video highlights
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para matches
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_matches_status ON matches(status);

-- ============================================
-- TABLA: match_events
-- Eventos del partido (goles, tarjetas, etc.)
-- ============================================
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  event_type VARCHAR(20) NOT NULL, -- 'goal', 'yellow_card', 'red_card', 'substitution'
  minute INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: news
-- Noticias del club
-- ============================================
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author VARCHAR(100),
  category VARCHAR(50), -- 'General', 'Partidos', 'Jugadores', etc.
  tags TEXT[], -- Array de tags
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para news
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_category ON news(category);

-- ============================================
-- TABLA: gallery_albums
-- Álbumes de fotos
-- ============================================
CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  event_date DATE,
  category VARCHAR(50), -- 'Partidos', 'Entrenamientos', 'Eventos', etc.
  is_published BOOLEAN DEFAULT true,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para gallery_albums
CREATE INDEX idx_albums_date ON gallery_albums(event_date DESC);
CREATE INDEX idx_albums_category ON gallery_albums(category);

-- ============================================
-- TABLA: gallery_photos
-- Fotos individuales
-- ============================================
CREATE TABLE gallery_photos (
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
  file_size INTEGER, -- En bytes
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para gallery_photos
CREATE INDEX idx_photos_album ON gallery_photos(album_id, sort_order);

-- ============================================
-- TABLA: sponsors
-- Sponsors y colaboradores
-- ============================================
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  tier VARCHAR(20), -- 'platinum', 'gold', 'silver', 'bronze'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: contact_messages
-- Mensajes del formulario de contacto
-- ============================================
CREATE TABLE contact_messages (
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

-- Índice para contact_messages
CREATE INDEX idx_messages_read ON contact_messages(is_read, created_at DESC);

-- ============================================
-- TABLA: history_timeline
-- Timeline histórico del club
-- ============================================
CREATE TABLE history_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  event_type VARCHAR(50), -- 'fundacion', 'titulo', 'evento_especial', etc.
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para history_timeline
CREATE INDEX idx_timeline_year ON history_timeline(year ASC);

-- ============================================
-- TABLA: profiles (Supabase Auth)
-- Perfiles de usuarios autenticados
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user', -- 'admin', 'editor', 'user'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON gallery_albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar photo_count en álbumes
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

CREATE TRIGGER update_photo_count_insert AFTER INSERT ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_album_photo_count();

CREATE TRIGGER update_photo_count_delete AFTER DELETE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_album_photo_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
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

-- Políticas: Lectura pública para la mayoría de tablas
CREATE POLICY "Public read access" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON players FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read access" ON team_players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read access" ON match_events FOR SELECT USING (true);
CREATE POLICY "Public read access" ON news FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON gallery_albums FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON gallery_photos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sponsors FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON history_timeline FOR SELECT USING (true);

-- Políticas: Solo admins pueden escribir
CREATE POLICY "Admin write access" ON clubs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin write access" ON players FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write access" ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write access" ON gallery_albums FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admin write access" ON gallery_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Política para contact_messages: Todos pueden insertar
CREATE POLICY "Anyone can insert" ON contact_messages FOR INSERT WITH CHECK (true);

-- Política para contact_messages: Solo admins pueden leer
CREATE POLICY "Admin read access" ON contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Política para profiles: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (
  auth.uid() = id
);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (
  auth.uid() = id
);
```

### 3.2 Storage Buckets en Supabase

```sql
-- Crear buckets para almacenamiento de archivos
INSERT INTO storage.buckets (id, name, public) VALUES
  ('club-images', 'club-images', true),
  ('player-photos', 'player-photos', true),
  ('gallery', 'gallery', true),
  ('news-images', 'news-images', true),
  ('logos', 'logos', true);

-- Políticas de Storage: Lectura pública
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
  USING (bucket_id IN ('club-images', 'player-photos', 'gallery', 'news-images', 'logos'));

-- Políticas de Storage: Solo admins pueden subir
CREATE POLICY "Admin upload access" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('club-images', 'player-photos', 'gallery', 'news-images', 'logos')
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- Políticas de Storage: Solo admins pueden eliminar
CREATE POLICY "Admin delete access" ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('club-images', 'player-photos', 'gallery', 'news-images', 'logos')
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );
```

---

## 4. IMPLEMENTACIÓN TÉCNICA DETALLADA

### 4.1 Configuración Inicial del Proyecto

```bash
# Crear proyecto Next.js con TypeScript
npx create-next-app@latest azulyblanco --typescript --tailwind --app --eslint

# Navegar al proyecto
cd azulyblanco

# Instalar dependencias principales
npm install @supabase/supabase-js @supabase/ssr
npm install @supabase/auth-helpers-nextjs

# Instalar shadcn/ui
npx shadcn-ui@latest init

# Instalar componentes de shadcn/ui necesarios
npx shadcn-ui@latest add button card dialog input label textarea
npx shadcn-ui@latest add dropdown-menu navigation-menu separator
npx shadcn-ui@latest add tabs badge avatar calendar

# Instalar dependencias adicionales
npm install react-query
npm install date-fns  # Para formateo de fechas
npm install clsx tailwind-merge  # Para className utilities
npm install react-intersection-observer  # Para lazy loading
npm install photoswipe  # Para galería de fotos (lightbox)
npm install react-markdown  # Para renderizar markdown en noticias
npm install zod  # Para validación de forms
npm install react-hook-form  # Para manejo de formularios
npm install @hookform/resolvers  # Para integrar zod con react-hook-form

# Dev dependencies
npm install -D @types/node
```

### 4.2 Configuración de Supabase Client

**lib/supabase/client.ts** (Client-side)
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**lib/supabase/server.ts** (Server-side)
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // El método `set` fue llamado desde un Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // El método `delete` fue llamado desde un Server Component
          }
        },
      },
    }
  )
}
```

### 4.3 Middleware para Auth

**middleware.ts**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refrescar sesión si existe
  const { data: { user } } = await supabase.auth.getUser()

  // Proteger rutas de admin
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 4.4 Ejemplos de Server Actions

**lib/actions/news.ts**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPublishedNews(limit: number = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getNewsBySlug(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) throw error

  // Incrementar contador de vistas
  await supabase
    .from('news')
    .update({ views: data.views + 1 })
    .eq('id', data.id)

  return data
}

export async function createNews(formData: FormData) {
  const supabase = createClient()

  // Verificar que el usuario es admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'editor') {
    throw new Error('No autorizado')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const slug = title.toLowerCase().replace(/\s+/g, '-')

  const { data, error } = await supabase
    .from('news')
    .insert({
      title,
      slug,
      content,
      excerpt,
      author: user.email,
      is_published: false,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/noticias')
  revalidatePath('/dashboard/noticias')

  return data
}
```

**lib/actions/matches.ts**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUpcomingMatches(limit: number = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'scheduled')
    .gte('match_date', new Date().toISOString())
    .order('match_date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getRecentResults(limit: number = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'finished')
    .lte('match_date', new Date().toISOString())
    .order('match_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getMatchById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      team:teams(*),
      events:match_events(
        *,
        player:players(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
```

**lib/actions/gallery.ts**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAlbums(category?: string) {
  const supabase = createClient()

  let query = supabase
    .from('gallery_albums')
    .select('*')
    .eq('is_published', true)
    .order('event_date', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getAlbumWithPhotos(slug: string) {
  const supabase = createClient()

  const { data: album, error: albumError } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (albumError) throw albumError

  const { data: photos, error: photosError } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('album_id', album.id)
    .order('sort_order', { ascending: true })

  if (photosError) throw photosError

  return { ...album, photos }
}

export async function uploadPhotosToAlbum(albumId: string, files: File[]) {
  const supabase = createClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const uploadedPhotos = []

  for (const file of files) {
    // Generar nombre único
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${albumId}/${fileName}`

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath)

    // Insertar registro en gallery_photos
    const { data: photoData, error: photoError } = await supabase
      .from('gallery_photos')
      .insert({
        album_id: albumId,
        url: publicUrl,
        thumbnail_url: publicUrl, // Supabase puede generar thumbnails automáticos
      })
      .select()
      .single()

    if (photoError) throw photoError

    uploadedPhotos.push(photoData)
  }

  return uploadedPhotos
}
```

### 4.5 Componente de Ejemplo: Hero Section

**components/home/HeroSection.tsx**
```typescript
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-team.jpg"
          alt="Equipo Azul y Blanco"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60 z-10" />

      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
        <Image
          src="/images/escudo.png"
          alt="Escudo Azul y Blanco"
          width={120}
          height={120}
          className="mx-auto mb-6"
        />

        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          Azul y Blanco
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-gray-200 font-light">
          Pasión Amateur desde [Año de Fundación]
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/contacto">Únete al Club</Link>
          </Button>

          <Button size="lg" variant="outline" asChild className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
            <Link href="/club/historia">Nuestra Historia</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
```

### 4.6 Componente de Ejemplo: Match Card

**components/partidos/MatchCard.tsx**
```typescript
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MatchCardProps {
  match: {
    id: string
    opponent_name: string
    opponent_shield_url?: string
    match_date: string
    location: string
    is_home: boolean
    status: 'scheduled' | 'live' | 'finished'
    home_score?: number
    away_score?: number
  }
}

export function MatchCard({ match }: MatchCardProps) {
  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'

  const getStatusBadge = () => {
    if (isLive) return <Badge variant="destructive" className="animate-pulse">EN VIVO</Badge>
    if (isFinished) return <Badge variant="secondary">FINALIZADO</Badge>
    return <Badge variant="outline">PRÓXIMO</Badge>
  }

  return (
    <Link href={`/partidos/${match.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              {format(new Date(match.match_date), "EEEE d 'de' MMMM", { locale: es })}
            </span>
            {getStatusBadge()}
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between gap-4">
            {/* Home Team (Azul y Blanco) */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto mb-2 relative">
                <Image
                  src="/images/escudo.png"
                  alt="Azul y Blanco"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="font-semibold text-sm">Azul y Blanco</p>
              {isFinished && (
                <p className="text-3xl font-bold mt-2">
                  {match.is_home ? match.home_score : match.away_score}
                </p>
              )}
            </div>

            {/* VS / Score */}
            <div className="text-center px-4">
              {isFinished ? (
                <span className="text-2xl font-bold text-gray-400">-</span>
              ) : (
                <span className="text-lg font-semibold text-gray-500">VS</span>
              )}
              {!isFinished && (
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(match.match_date), 'HH:mm')}hs
                </p>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto mb-2 relative">
                {match.opponent_shield_url ? (
                  <Image
                    src={match.opponent_shield_url}
                    alt={match.opponent_name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs">
                    Sin escudo
                  </div>
                )}
              </div>
              <p className="font-semibold text-sm">{match.opponent_name}</p>
              {isFinished && (
                <p className="text-3xl font-bold mt-2">
                  {match.is_home ? match.away_score : match.home_score}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              📍 {match.location}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### 4.7 Página de Ejemplo: Home

**app/(pages)/page.tsx**
```typescript
import { HeroSection } from '@/components/home/HeroSection'
import { LatestNews } from '@/components/home/LatestNews'
import { NextMatch } from '@/components/home/NextMatch'
import { RecentResults } from '@/components/home/RecentResults'
import { GalleryPreview } from '@/components/home/GalleryPreview'
import { Sponsors } from '@/components/shared/Sponsors'

export default async function HomePage() {
  return (
    <main>
      <HeroSection />
      <LatestNews />
      <NextMatch />
      <RecentResults />
      <GalleryPreview />
      <Sponsors />
    </main>
  )
}
```

---

## 5. CONFIGURACIÓN DE TAILWIND CSS

**tailwind.config.ts**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores del club
        'azul-primario': '#0047AB',
        'azul-oscuro': '#002D6B',
        'azul-claro': '#4A90E2',

        // shadcn/ui colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#0047AB',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

**app/globals.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 6. SEO Y OPTIMIZACIÓN

### 6.1 Metadata en Next.js 14

**app/layout.tsx**
```typescript
import type { Metadata } from 'next'
import { Montserrat, Open_Sans, Roboto_Mono } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Azul y Blanco - Club de Fútbol Amateur',
    template: '%s | Azul y Blanco',
  },
  description: 'Club de fútbol amateur apasionado por el deporte. Únete a nuestra familia azul y blanco.',
  keywords: ['fútbol amateur', 'club deportivo', 'azul y blanco', 'fútbol'],
  authors: [{ name: 'Azul y Blanco' }],
  creator: 'Azul y Blanco',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://azulyblanco.com',
    siteName: 'Azul y Blanco',
    title: 'Azul y Blanco - Club de Fútbol Amateur',
    description: 'Club de fútbol amateur apasionado por el deporte.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Azul y Blanco',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Azul y Blanco - Club de Fútbol Amateur',
    description: 'Club de fútbol amateur apasionado por el deporte.',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${montserrat.variable} ${openSans.variable} ${robotoMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### 6.2 Sitemap Automático

**app/sitemap.ts**
```typescript
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://azulyblanco.com'
  const supabase = createClient()

  // Obtener noticias publicadas
  const { data: news } = await supabase
    .from('news')
    .select('slug, updated_at')
    .eq('is_published', true)

  // Obtener álbumes
  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('slug, updated_at')
    .eq('is_published', true)

  // Páginas estáticas
  const routes = [
    '',
    '/club',
    '/club/historia',
    '/club/directiva',
    '/equipos',
    '/noticias',
    '/partidos',
    '/galeria',
    '/contacto',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Páginas dinámicas de noticias
  const newsRoutes = (news || []).map((item) => ({
    url: `${baseUrl}/noticias/${item.slug}`,
    lastModified: item.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Páginas dinámicas de álbumes
  const albumRoutes = (albums || []).map((item) => ({
    url: `${baseUrl}/galeria/${item.slug}`,
    lastModified: item.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...routes, ...newsRoutes, ...albumRoutes]
}
```

### 6.3 next.config.js Optimizado

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Comprimir respuestas
  compress: true,

  // Habilitar React Strict Mode
  reactStrictMode: true,

  // Optimizaciones de producción
  swcMinify: true,

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## 7. PLAN DE IMPLEMENTACIÓN

### 7.1 Fase 1 - Setup y Fundamentos (Semana 1-2)

**Semana 1:**
- [ ] Crear cuenta en Supabase (gratis)
- [ ] Crear cuenta en Vercel (gratis)
- [ ] Registrar dominio (.com ~$15/año)
- [ ] Configurar proyecto Next.js localmente
- [ ] Instalar dependencias
- [ ] Configurar Tailwind + shadcn/ui
- [ ] Crear esquema de base de datos en Supabase
- [ ] Configurar Storage buckets
- [ ] Configurar políticas RLS

**Semana 2:**
- [ ] Implementar layout principal (Header, Footer)
- [ ] Crear componentes UI base (Button, Card, etc.)
- [ ] Implementar Hero Section
- [ ] Configurar sistema de rutas
- [ ] Setup de Supabase clients
- [ ] Primer deploy a Vercel
- [ ] Conectar dominio custom

### 7.2 Fase 2 - Páginas Core (Semana 3-5)

**Semana 3:**
- [ ] Página Home completa (Hero, Noticias, Próximo Partido, Resultados)
- [ ] Página Club/Historia (Timeline)
- [ ] Página Equipos (Grid de jugadores)
- [ ] Server Actions para obtener datos

**Semana 4:**
- [ ] Sistema de Noticias (listado + detalle)
- [ ] Página de Partidos (calendario, resultados)
- [ ] Componente MatchCard
- [ ] Página de detalle de partido

**Semana 5:**
- [ ] Sistema de Galería (álbumes + fotos)
- [ ] Lightbox para fotos
- [ ] Página de Contacto con formulario
- [ ] Integración de emails (Resend)

### 7.3 Fase 3 - Panel Admin (Semana 6-7)

**Semana 6:**
- [ ] Sistema de autenticación (Supabase Auth)
- [ ] Middleware de protección de rutas
- [ ] Dashboard admin básico
- [ ] CRUD de noticias (crear, editar, publicar)

**Semana 7:**
- [ ] CRUD de partidos
- [ ] CRUD de jugadores
- [ ] Sistema de upload de fotos (galería)
- [ ] Gestión de álbumes

### 7.4 Fase 4 - Optimización y Lanzamiento (Semana 8)

- [ ] Testing exhaustivo (responsive, performance)
- [ ] Optimización de imágenes
- [ ] SEO (metadata, sitemap, robots.txt)
- [ ] Google Analytics
- [ ] Migrar contenido inicial (textos, fotos)
- [ ] Deploy final a producción
- [ ] Configuración DNS del dominio
- [ ] Lanzamiento oficial

---

## 8. COSTOS Y PRESUPUESTO

### 8.1 Desglose de Costos (Anual)

| Servicio | Plan | Costo Anual |
|----------|------|-------------|
| **Next.js** | Open Source | $0 |
| **Vercel Hosting** | Hobby (Free) | $0 |
| **Supabase** | Free Tier | $0 |
| **Dominio .com** | Registro | ~$15 |
| **Cloudinary** | Free Tier (opcional) | $0 |
| **Resend (emails)** | Free Tier | $0 |
| **Google Analytics** | Gratis | $0 |
| **shadcn/ui** | Open Source | $0 |
| **TOTAL ANUAL** | | **~$15 USD** |

### 8.2 Límites de Free Tiers

**Vercel (Hobby Plan):**
- ✅ 100 GB bandwidth/mes
- ✅ Despliegues ilimitados
- ✅ Serverless Functions: 100 GB-Hrs
- ✅ Edge Functions: 100,000 invocaciones/día
- ✅ 100 dominios custom

**Supabase (Free Tier):**
- ✅ 500 MB de base de datos
- ✅ 1 GB de almacenamiento (Storage)
- ✅ 2 GB de transferencia/mes
- ✅ 50,000 usuarios activos mensuales
- ✅ 500,000 queries/mes

**Cloudinary (Free Tier - Opcional):**
- ✅ 25 GB de almacenamiento
- ✅ 25 GB de bandwidth/mes
- ✅ Transformaciones de imágenes ilimitadas

**Resend (Free Tier):**
- ✅ 100 emails/día
- ✅ 3,000 emails/mes

### 8.3 ¿Cuándo necesitarías upgradear?

**Muy difícilmente necesitarás pagar más** para un club amateur. Los límites son amplios:

- 100 GB bandwidth = ~100,000 visitas/mes (asumiendo 1 MB por visita)
- 500 MB DB = ~500,000 filas de datos
- 1 GB Storage = ~1,000 fotos de alta calidad (1 MB c/u)

Si creces mucho, los upgrades son accesibles:
- Supabase Pro: $25/mes
- Vercel Pro: $20/mes

---

## 9. MÉTRICAS Y ANALYTICS

### 9.1 Google Analytics 4 Setup

**app/layout.tsx** (agregar):
```typescript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 9.2 Eventos Custom a Trackear

```typescript
// lib/utils/analytics.ts
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Ejemplos de uso:
trackEvent('view_news', { news_id: '123', news_title: 'Título' })
trackEvent('view_match', { match_id: '456' })
trackEvent('view_gallery', { album_id: '789' })
trackEvent('contact_form_submit')
trackEvent('photo_view', { photo_id: '101' })
```

---

## 10. CHECKLIST PRE-LANZAMIENTO

### 10.1 Contenido

- [ ] Logo del club (PNG transparente, alta resolución)
- [ ] Escudo oficial (PNG, SVG preferible)
- [ ] Texto de historia del club (500-1000 palabras)
- [ ] Misión y valores (200 palabras)
- [ ] 15+ fotos de jugadores con datos (nombre, posición, número)
- [ ] Foto de equipo completo
- [ ] 30+ fotos de archivo para galería inicial
- [ ] 5-10 noticias/artículos para empezar
- [ ] Fixture de partidos (próximos y pasados si hay)
- [ ] Información de contacto (email, teléfono, dirección)
- [ ] Links de redes sociales

### 10.2 Técnico

- [ ] Proyecto Next.js configurado
- [ ] Base de datos Supabase creada con todas las tablas
- [ ] Storage buckets configurados
- [ ] RLS (Row Level Security) implementado
- [ ] Variables de entorno configuradas
- [ ] Deploy a Vercel funcionando
- [ ] Dominio registrado y conectado
- [ ] SSL/HTTPS activo
- [ ] Google Analytics configurado
- [ ] Formulario de contacto funcionando
- [ ] Sistema de emails (Resend) configurado

### 10.3 Testing

- [ ] Testing responsive (mobile, tablet, desktop)
- [ ] Testing en múltiples navegadores
- [ ] Testing de formularios
- [ ] Testing de carga de imágenes
- [ ] Testing de performance (Lighthouse >85)
- [ ] Testing de accesibilidad (a11y)
- [ ] Testing de enlaces rotos
- [ ] Testing de SEO (metadata, sitemap)

### 10.4 SEO

- [ ] Meta tags configurados en todas las páginas
- [ ] Open Graph images
- [ ] Sitemap.xml generado
- [ ] Robots.txt configurado
- [ ] Structured data (Schema.org)
- [ ] URLs amigables (slugs)
- [ ] Alt text en todas las imágenes

---

## 11. DOCUMENTACIÓN PARA EL CLIENTE

### 11.1 Cómo Administrar el Sitio

**Acceso al Panel Admin:**
1. Ir a `https://azulyblanco.com/login`
2. Ingresar con email y contraseña
3. Acceder al dashboard en `https://azulyblanco.com/dashboard`

**Publicar una Noticia:**
1. Dashboard → Noticias → Nueva Noticia
2. Escribir título, contenido y extracto
3. Subir imagen destacada
4. Click en "Publicar"

**Agregar Fotos a la Galería:**
1. Dashboard → Galería → Nuevo Álbum
2. Crear álbum con título y fecha
3. Subir fotos (múltiples a la vez)
4. Publicar álbum

**Cargar Resultado de Partido:**
1. Dashboard → Partidos → Nuevo Partido
2. Completar datos (rival, fecha, resultado)
3. Guardar

### 11.2 Mantenimiento Recomendado

**Semanal:**
- Publicar 1-2 noticias
- Subir fotos de partidos/entrenamientos
- Actualizar resultados de partidos

**Mensual:**
- Revisar analytics
- Actualizar plantel si hay cambios
- Verificar que formulario de contacto funciona

**Anual:**
- Renovar dominio
- Revisar límites de servicios
- Actualizar contenido antiguo

---

## 12. RECURSOS Y DOCUMENTACIÓN

### 12.1 Enlaces Útiles

**Documentación Oficial:**
- Next.js 14: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

**Tutoriales:**
- Next.js + Supabase Auth: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- Deploying to Vercel: https://vercel.com/docs/deployments/overview

### 12.2 Comunidad y Soporte

- Next.js Discord: https://nextjs.org/discord
- Supabase Discord: https://discord.supabase.com
- Stack Overflow (tag: nextjs, supabase)

---

## 13. PRÓXIMOS PASOS

### 13.1 Acción Inmediata

1. **Crear cuenta en Supabase:** https://supabase.com/dashboard
2. **Crear cuenta en Vercel:** https://vercel.com/signup
3. **Registrar dominio:** Namecheap, GoDaddy, Google Domains, etc.
4. **Recopilar contenido inicial:** Fotos, textos, datos del club

### 13.2 Comenzar Desarrollo

```bash
# 1. Clonar o crear proyecto
npx create-next-app@latest azulyblanco --typescript --tailwind --app

# 2. Navegar al proyecto
cd azulyblanco

# 3. Instalar dependencias necesarias
npm install @supabase/supabase-js @supabase/ssr

# 4. Inicializar shadcn/ui
npx shadcn-ui@latest init

# 5. Crear archivo .env.local con variables de Supabase

# 6. Iniciar servidor de desarrollo
npm run dev
```

---

**¿Estás listo para comenzar?** 🚀

Este stack te permitirá tener un sitio web profesional, rápido, moderno y totalmente gratuito (excepto el dominio). La arquitectura es escalable y si en el futuro el club crece, puedes upgradear los servicios de forma gradual.

**Inversión total: ~$15 USD/año (solo el dominio)**

---

*Documento creado: Octubre 2025*
*Stack: Next.js 14 + Supabase + Vercel*
*Autor: Claude - Diseñador UX/UI Senior*
