# Guía de Inicio Rápido - Sitio Web Azul y Blanco

## ¿Qué se ha creado?

✅ **Propuesta UX/UI completa** ([propuesta-ux-ui-azulyblanco.md](propuesta-ux-ui-azulyblanco.md))
- Diseño visual y paleta de colores
- Arquitectura de información
- Wireframes de páginas principales
- Guía de estilo

✅ **Propuesta técnica detallada** ([propuesta-tecnica-nextjs.md](propuesta-tecnica-nextjs.md))
- Stack tecnológico: Next.js 14 + Supabase + Vercel
- Esquema completo de base de datos
- Estructura del proyecto
- Ejemplos de código
- Plan de implementación

✅ **Proyecto Next.js inicializado** (carpeta `website/`)
- Next.js 14 con App Router
- TypeScript configurado
- Tailwind CSS + shadcn/ui
- Dependencias de Supabase instaladas
- Layout base (Header + Footer)
- Página de inicio funcional

## Inversión Total

**~$15 USD/año** (solo el dominio .com)

Todo lo demás es 100% gratuito:
- Hosting en Vercel (plan Hobby)
- Base de datos en Supabase (plan Free)
- Storage de imágenes incluido
- SSL/HTTPS automático

## Próximos Pasos

### 1. Configurar Supabase (15 minutos)

**a) Crear cuenta y proyecto:**
1. Ir a https://supabase.com
2. Sign Up (gratis)
3. Crear nuevo proyecto
   - Nombre: "azulyblanco"
   - Contraseña de base de datos: (guardar bien)
   - Región: South America (São Paulo)

**b) Ejecutar SQL de base de datos:**
1. En Supabase Dashboard → SQL Editor
2. Copiar el código SQL de [propuesta-tecnica-nextjs.md](propuesta-tecnica-nextjs.md) (Sección 3.1)
3. Ejecutar todo el script
4. Verificar que se crearon las tablas en Table Editor

**c) Obtener credenciales:**
1. Supabase Dashboard → Project Settings → API
2. Copiar:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

**d) Configurar variables de entorno:**
1. Abrir `website/.env.local`
2. Pegar las credenciales de Supabase
3. Guardar archivo

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 2. Probar el sitio localmente (5 minutos)

```bash
# Navegar a la carpeta del proyecto
cd website

# Instalar dependencias (si no se hizo)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir http://localhost:3000 en el navegador.

**Deberías ver:**
- Header con logo y navegación
- Hero section azul con título "Azul y Blanco"
- Secciones de noticias y próximo partido
- Footer completo

### 3. Preparar contenido inicial (1-2 horas)

**Antes de continuar el desarrollo, recopila:**

📸 **Imágenes necesarias:**
- Logo del club (PNG transparente, 500x500px mínimo)
- Escudo oficial (PNG o SVG, alta resolución)
- Foto del equipo completo
- 15+ fotos individuales de jugadores
- 30+ fotos de partidos/entrenamientos para galería
- Foto de instalaciones/cancha

📝 **Textos necesarios:**
- Historia del club (500-1000 palabras)
- Misión y valores (200 palabras)
- Información de contacto (email, teléfono, dirección)
- Lista de jugadores actuales (nombre, número, posición)

📊 **Datos deportivos:**
- Fixture de partidos (próximos)
- Resultados recientes (si hay)
- Datos de directiva (nombres y cargos)

### 4. Agregar contenido al sitio (2-3 horas)

Una vez tengas las credenciales de Supabase y el contenido:

**a) Subir imágenes:**
1. Supabase Dashboard → Storage
2. Crear buckets (ya deberían estar creados por el SQL)
3. Subir fotos a los buckets correspondientes

**b) Insertar datos de prueba:**

```sql
-- Ejemplo: Insertar información del club
INSERT INTO clubs (name, slug, founded_year, description)
VALUES (
  'Azul y Blanco',
  'azul-y-blanco',
  2010,
  'Club de fútbol amateur apasionado por el deporte'
);

-- Ejemplo: Insertar jugador
INSERT INTO players (first_name, last_name, jersey_number, position)
VALUES ('Juan', 'Pérez', 10, 'Mediocampista');

-- Ejemplo: Insertar noticia
INSERT INTO news (title, slug, content, excerpt, is_published, published_at)
VALUES (
  'Bienvenidos al nuevo sitio web',
  'bienvenidos-al-nuevo-sitio',
  'Estamos felices de presentar nuestro nuevo sitio web...',
  'Conoce nuestro nuevo sitio web oficial',
  true,
  NOW()
);
```

### 5. Desarrollar páginas restantes (2-4 semanas)

**Orden recomendado:**

**Semana 1:**
- ✅ Home (ya hecha)
- [ ] Página Club → Historia
- [ ] Página Equipos → Plantel
- [ ] Página Contacto

**Semana 2:**
- [ ] Sistema de Noticias (listado + detalle)
- [ ] Página de Partidos (calendario)
- [ ] Componentes de MatchCard

**Semana 3:**
- [ ] Sistema de Galería (álbumes)
- [ ] Lightbox para fotos
- [ ] Upload de imágenes

**Semana 4:**
- [ ] Panel de administración básico
- [ ] Sistema de autenticación
- [ ] Testing y ajustes

### 6. Deploy a Vercel (30 minutos)

**a) Crear repositorio Git:**
```bash
cd website
git init
git add .
git commit -m "Initial commit"

# Crear repo en GitHub y pushear
git remote add origin https://github.com/tu-usuario/azulyblanco.git
git push -u origin main
```

**b) Conectar a Vercel:**
1. Ir a https://vercel.com
2. Sign Up con GitHub
3. Import Git Repository
4. Seleccionar el repositorio "azulyblanco"
5. Configurar:
   - Framework Preset: Next.js
   - Root Directory: `website`
6. Agregar variables de entorno (copiar de .env.local)
7. Deploy

**c) Configurar dominio custom:**
1. Registrar dominio (GoDaddy, Namecheap, Google Domains)
2. En Vercel: Settings → Domains
3. Agregar dominio: `azulyblanco.com`
4. Configurar DNS según instrucciones de Vercel
5. Esperar propagación (24-48hs)

### 7. Crear primer usuario admin

Una vez que el sitio esté en producción:

```sql
-- En Supabase SQL Editor
-- Primero crear usuario en Auth (vía UI de Supabase)
-- Luego ejecutar:

INSERT INTO profiles (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tu-email@gmail.com'),
  'tu-email@gmail.com',
  'admin'
);
```

Ahora podrás acceder a `https://azulyblanco.com/dashboard`

## Estructura del Proyecto

```
azulyblanco/
├── propuesta-ux-ui-azulyblanco.md    # Diseño UX/UI
├── propuesta-tecnica-nextjs.md       # Documentación técnica
├── INICIO-RAPIDO.md                  # Este archivo
├── README.md                         # Documentación general
├── .env.example                      # Ejemplo de variables
└── website/                          # Proyecto Next.js
    ├── app/                          # Páginas y rutas
    │   ├── (pages)/                  # Páginas públicas
    │   │   ├── layout.tsx            # Layout con Header/Footer
    │   │   └── page.tsx              # Home
    │   ├── layout.tsx                # Root layout
    │   └── globals.css               # Estilos globales
    ├── components/                   # Componentes React
    │   ├── ui/                       # shadcn/ui
    │   ├── layout/                   # Header, Footer
    │   │   ├── Header.tsx
    │   │   └── Footer.tsx
    │   ├── home/                     # Componentes de Home
    │   └── shared/                   # Compartidos
    ├── lib/                          # Utilities
    │   ├── supabase/                 # Clientes Supabase
    │   │   ├── client.ts
    │   │   └── server.ts
    │   ├── actions/                  # Server Actions
    │   └── constants.ts              # Configuración
    ├── public/                       # Assets estáticos
    │   └── images/                   # Imágenes
    ├── .env.local                    # Variables (NO commitear)
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor local (http://localhost:3000)
npm run build            # Build de producción
npm run start            # Servidor de producción local
npm run lint             # Linter

# Agregar componentes de shadcn/ui
npx shadcn@latest add [nombre-componente]

# Ejemplos:
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add select
```

## Recursos

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

### Tutoriales Útiles
- [Next.js + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Deploying to Vercel](https://nextjs.org/docs/deployment)

### Soporte
- Si tienes problemas, revisa la [propuesta-tecnica-nextjs.md](propuesta-tecnica-nextjs.md)
- Sección 4: Implementación técnica detallada
- Ejemplos de código para cada funcionalidad

## Checklist de Progreso

### Fase 1: Setup ✅
- [x] Crear propuesta UX/UI
- [x] Crear propuesta técnica
- [x] Inicializar proyecto Next.js
- [x] Instalar dependencias
- [x] Configurar Tailwind + shadcn/ui
- [ ] Configurar Supabase (tú debes hacerlo)
- [ ] Probar sitio localmente

### Fase 2: Contenido
- [ ] Recopilar imágenes del club
- [ ] Escribir textos (historia, valores)
- [ ] Preparar datos de jugadores
- [ ] Subir contenido a Supabase

### Fase 3: Desarrollo
- [ ] Página Club/Historia
- [ ] Página Equipos
- [ ] Página Contacto
- [ ] Sistema de Noticias
- [ ] Sistema de Partidos
- [ ] Sistema de Galería
- [ ] Panel Admin

### Fase 4: Lanzamiento
- [ ] Testing completo
- [ ] Optimización de performance
- [ ] SEO
- [ ] Deploy a Vercel
- [ ] Configurar dominio
- [ ] Lanzamiento oficial

---

## ¿Necesitas Ayuda?

**Pregunta:** ¿Cómo agrego un nuevo componente de shadcn/ui?
**Respuesta:** `npx shadcn@latest add [nombre]`

**Pregunta:** ¿Cómo leo datos de Supabase en una página?
**Respuesta:** Ver ejemplos en [propuesta-tecnica-nextjs.md](propuesta-tecnica-nextjs.md) sección 4.4 (Server Actions)

**Pregunta:** ¿Cómo agrego una nueva página?
**Respuesta:** Crear archivo en `app/(pages)/nueva-pagina/page.tsx`

**Pregunta:** ¿Cómo subo fotos a Supabase?
**Respuesta:** Ver ejemplo en sección 4.4 de propuesta técnica (uploadPhotosToAlbum)

---

**¡El proyecto está listo para empezar a construir!** 🚀

**Siguiente paso inmediato:** Configurar Supabase (15 minutos) y probar el sitio localmente.
