# Sitio Web Azul y Blanco

Sitio web oficial del Club de Fútbol Amateur Azul y Blanco.

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router) + React 18
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel
- **TypeScript:** Para type safety

## Características

- ✅ Diseño responsive (mobile-first)
- ✅ Sistema de noticias dinámico
- ✅ Gestión de partidos y resultados
- ✅ Galería de fotos con álbumes
- ✅ Panel de administración
- ✅ SEO optimizado
- ✅ Performance optimizado (Lighthouse >85)
- ✅ Accesibilidad (WCAG AA)

## Instalación Local

### Prerrequisitos

- Node.js 18+ instalado
- npm o yarn
- Cuenta en Supabase (gratis)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/azulyblanco.git
cd azulyblanco/website
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp ../.env.example .env.local

# Editar .env.local con tus credenciales de Supabase
```

4. **Configurar Supabase**
- Crear proyecto en https://supabase.com
- Ejecutar el script SQL de `propuesta-tecnica-nextjs.md` (sección 3.1)
- Copiar URL y API Keys al .env.local

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
npm run type-check   # Verificar tipos TypeScript
```

## Estructura del Proyecto

```
website/
├── app/                    # App Router de Next.js
│   ├── (pages)/           # Páginas públicas
│   ├── (admin)/           # Panel admin (protegido)
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout raíz
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Header, Footer, Nav
│   ├── home/             # Componentes de Home
│   └── shared/           # Componentes compartidos
├── lib/                   # Utilities y configuración
│   ├── supabase/         # Clientes de Supabase
│   ├── actions/          # Server Actions
│   └── utils/            # Utilidades
├── types/                 # TypeScript types
├── public/               # Assets estáticos
└── tailwind.config.ts    # Configuración Tailwind
```

## Deployment en Vercel

1. **Conectar repositorio**
- Ir a https://vercel.com
- Import Git Repository
- Seleccionar este repositorio

2. **Configurar variables de entorno**
- Agregar todas las variables de `.env.local` en Vercel
- Settings → Environment Variables

3. **Deploy**
- Vercel despliega automáticamente en cada push a `main`
- Preview deployments en cada PR

## Configurar Dominio Custom

1. En Vercel: Settings → Domains
2. Agregar dominio: `azulyblanco.com`
3. Configurar DNS según instrucciones de Vercel
4. Esperar propagación (puede tomar hasta 48hs)

## Panel de Administración

### Acceso
- URL: `https://azulyblanco.com/dashboard`
- Requiere autenticación con Supabase Auth

### Crear Primer Usuario Admin

```sql
-- Ejecutar en Supabase SQL Editor
-- Reemplazar 'email@example.com' con tu email

INSERT INTO profiles (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'email@example.com'),
  'email@example.com',
  'admin'
);
```

### Funcionalidades Admin

- **Noticias:** Crear, editar, publicar noticias
- **Partidos:** Gestionar fixture y resultados
- **Galería:** Subir fotos y crear álbumes
- **Jugadores:** Administrar plantel
- **Mensajes:** Ver mensajes del formulario de contacto

## Gestión de Contenido

### Publicar una Noticia

1. Login en `/dashboard`
2. Ir a Noticias → Nueva Noticia
3. Completar título, contenido y extracto
4. Subir imagen destacada
5. Click en "Publicar"

### Subir Fotos a la Galería

1. Dashboard → Galería → Nuevo Álbum
2. Crear álbum con título, descripción y fecha
3. Subir múltiples fotos
4. Publicar álbum

### Cargar Resultados de Partidos

1. Dashboard → Partidos
2. Buscar el partido programado
3. Editar y agregar resultado
4. Guardar

## SEO

### Metadata
- Configurada automáticamente en cada página
- Open Graph tags para redes sociales
- Twitter Cards

### Sitemap
- Generado automáticamente: `/sitemap.xml`
- Se actualiza con contenido dinámico

### Robots.txt
- Configurado en `/robots.txt`

## Analytics

### Google Analytics 4
1. Crear propiedad en Google Analytics
2. Obtener Measurement ID (G-XXXXXXXXXX)
3. Agregar al `.env.local` como `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Costos

### Resumen
- **Dominio:** ~$15 USD/año
- **Hosting (Vercel):** $0 (plan Hobby)
- **Base de datos (Supabase):** $0 (plan Free)
- **Storage:** $0 (incluido en Supabase Free)
- **Total:** ~$15 USD/año

### Límites Free Tier
- **Vercel:** 100 GB bandwidth/mes
- **Supabase:** 500 MB DB + 1 GB Storage
- Suficiente para 100,000+ visitas/mes

## Soporte

### Documentación
- [Propuesta UX/UI](../propuesta-ux-ui-azulyblanco.md)
- [Propuesta Técnica](../propuesta-tecnica-nextjs.md)

### Enlaces Útiles
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Issues
Para reportar bugs o solicitar features, crear un issue en GitHub.

## Licencia

© 2025 Club Azul y Blanco. Todos los derechos reservados.

---

Desarrollado con ❤️ para el Club Azul y Blanco
