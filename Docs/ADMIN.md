# Panel de administración

`/admin` permite editar el contenido del sitio sin tocar código: fotos de la portada, programación, noticias, galerías, biblioteca de imágenes, plantel e información de las series.

## Dónde vive cada cosa

| Sección | Tabla / almacenamiento | Se ve en |
|---|---|---|
| Portada | `hero_fotos`, archivos en `medios/hero/<id>/` | Hero del inicio |
| Programación | `programacion` | Inicio y `/partidos` |
| Noticias | `noticias` (contenido en Markdown) | Inicio, `/noticias` |
| Galerías | `albumes` + `fotos`, archivos en `medios/galeria/<album>/` | `/galeria` |
| Imágenes | `medios`, archivos en `medios/biblioteca/` | Portadas, fotos de jugadores, series |
| Plantel | `jugadores` (APIs `/api/jugadores`) | `/series/*` |
| Series | columnas nuevas de `categorias` + cuerpo técnico en `equipos` | `/series/*` |

Las imágenes se suben desde el navegador directo a Supabase Storage (bucket público `medios`) con una URL firmada que entrega el servidor. Antes de subir se reducen a 2400 px y se pasan a WebP.

Las fotos de la portada se procesan en el servidor con sharp, con los mismos parámetros que `scripts/optimize-hero-images.mjs`: 1440/1920/2560 px en escritorio y 640/828/1080 px en móvil, cada una en AVIF y WebP. Las 14 fotos originales siguen en `public/images/hero` y la migración 002 las registra; quitarlas de la portada no borra esos archivos. sharp se carga en tiempo de ejecución (`lib/admin/sharp.ts`) porque Turbopack en Windows no puede crear el enlace simbólico que usa para paquetes externos.

Al guardar, el admin regenera las páginas públicas afectadas (`revalidatePath`). Además se regeneran solas cada 5 minutos.

## Puesta en marcha

1. **Migraciones**: ejecutar en orden, en el SQL Editor de Supabase, los archivos de [`database/migrations/`](../database/migrations/): `001_admin_contenido.sql` (tablas de contenido, RLS y bucket `medios`) y `002_hero.sql` (fotos de la portada). Se pueden volver a correr sin duplicar nada.
2. **Variables de entorno** (Vercel y `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`: texto aleatorio largo (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
   - `ADMIN_PASSWORD_HASH`: hash bcrypt de la contraseña, en base64 para que los `$` no se rompan:
     ```bash
     node -e "const b=require('bcryptjs');console.log(Buffer.from(b.hashSync(process.argv[1],10)).toString('base64'))" 'contraseña-nueva'
     ```
     Mientras no exista, rige la contraseña temporal de `lib/auth/password.ts`.
3. **Importar el contenido actual, antes de desplegar**: con `npm run dev` y `.env.local` apuntando a la base de producción, entrar a `/admin` y pulsar «Importar». Copia los eventos de `lib/data/eventos-enero.ts`, las noticias de `noticias/*.md` y los álbumes de `public/galeria`. Hay que hacerlo desde el equipo que tiene las fotos de la galería, porque no están en git.
4. **Desplegar el código.**

El orden importa: el sitio nuevo lee de la base y solo vuelve a los archivos si la base no responde. Si se despliega con la migración aplicada pero sin importar, la carta y la galería no se verían hasta pulsar «Importar». Con este orden no hay ese hueco, porque el sitio antiguo sigue leyendo los archivos hasta el despliegue.

El inicio del admin muestra el aviso «Hay contenido anterior sin importar» mientras falte algo; se puede cerrar con la ×.

## Entorno local para probar antes de producción

Supabase corre en Docker con la configuración de [`website/supabase/`](../website/supabase/config.toml). Al arrancar carga `database/schema.sql`, las migraciones de `database/migrations` y los datos de prueba de `website/supabase/seed.sql`.

| Comando (desde `website/`) | Qué hace |
|---|---|
| `npm run db:start` | Levanta Supabase local (necesita Docker Desktop abierto) |
| `npm run db:stop` | Lo apaga; los datos se conservan |
| `npm run db:reset` | Borra todo y vuelve a cargar esquema, migraciones y datos de prueba |
| `npm run db:status` | Muestra URLs y claves |

- API: http://127.0.0.1:54321 · Studio (ver y editar tablas): http://127.0.0.1:54323
- `website/.env.local` apunta al Supabase local. Para probar contra producción, reemplaza las tres variables de Supabase por las reales.
- Una migración nueva se agrega como `database/migrations/00N_*.sql` y a la lista `sql_paths` de `website/supabase/config.toml`; luego `npm run db:reset`.

## Seguridad

- La sesión es una cookie `httpOnly` firmada con HMAC (`SESSION_SECRET`) que expira a las 8 horas.
- El middleware protege `/admin/*` y todas las `/api/*` salvo login/logout: esas APIs devuelven datos personales del plantel.
- Las escrituras usan la `service_role` key solo en el servidor, siempre después de `requireAdmin()`. El sitio público lee con la anon key y RLS solo le muestra lo publicado.
