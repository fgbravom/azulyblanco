# Panel de administración

`/admin` permite editar el contenido del sitio sin tocar código: fotos de la portada, programación, noticias, galerías, biblioteca de imágenes, plantel e información de las series. Hay además un sistema de cuotas de los jugadores, oculto por ahora ([CUOTAS.md](CUOTAS.md)).

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
| Cuotas (oculto, se activa con `CUOTAS_HABILITADAS=true`) | `cuotas`, `pagos`, configuración en `equipos` (ver [CUOTAS.md](CUOTAS.md)) | Link personal `/cuotas/<código>` |

Las imágenes se suben desde el navegador directo a Supabase Storage (bucket público `medios`) con una URL firmada que entrega el servidor. Antes de subir se reducen a 2400 px y se pasan a WebP.

Las fotos de la portada se procesan en el servidor con sharp, con los mismos parámetros que `scripts/optimize-hero-images.mjs`: 1440/1920/2560 px en escritorio y 640/828/1080 px en móvil, cada una en AVIF y WebP. Las 14 fotos originales siguen en `public/images/hero` y la migración 002 las registra; quitarlas de la portada no borra esos archivos. sharp se carga en tiempo de ejecución (`lib/admin/sharp.ts`) porque Turbopack en Windows no puede crear el enlace simbólico que usa para paquetes externos.

Al guardar, el admin regenera las páginas públicas afectadas (`revalidatePath`). Además se regeneran solas cada 5 minutos.

## Puesta en marcha

1. **Migraciones**: `npm run db:push` desde `website/` (ver [Migraciones](#migraciones)). Después, cargar los datos de la Serie 35 con `database/privado/serie35_cuotas_2026.sql` en el SQL Editor (no está en git; ver [CUOTAS.md](CUOTAS.md)).
2. **Variables de entorno** (Vercel y `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`: texto aleatorio largo (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
   - `ADMIN_PASSWORD_HASH`: hash bcrypt de la contraseña, en base64 para que los `$` no se rompan:
     ```bash
     node -e "const b=require('bcryptjs');console.log(Buffer.from(b.hashSync(process.argv[1],10)).toString('base64'))" 'contraseña-nueva'
     ```
     Es obligatoria en producción: sin ella el login queda cerrado. En local (`npm run dev`) rige la contraseña de desarrollo de `lib/auth/password.ts`.
   - Después de aplicar la migración 005, en Supabase → Authentication → Sign In / Providers, desactivar «Allow new users to sign up». El sitio no usa Supabase Auth, y una cuenta registrada era la puerta a las políticas de escritura antiguas.
   - `CUOTAS_HABILITADAS`: `true` muestra el sistema de cuotas. Sin la variable queda oculto ([CUOTAS.md](CUOTAS.md)).
3. **Importar el contenido actual, antes de desplegar**: con `npm run dev` y `.env.local` apuntando a la base de producción, entrar a `/admin` y pulsar «Importar». Copia los eventos de `lib/data/eventos-enero.ts`, las noticias de `noticias/*.md` y los álbumes de `public/galeria`. Hay que hacerlo desde el equipo que tiene las fotos de la galería, porque no están en git.
4. **Desplegar el código.**

El orden importa: el sitio nuevo lee de la base y solo vuelve a los archivos si la base no responde. Si se despliega con la migración aplicada pero sin importar, la carta y la galería no se verían hasta pulsar «Importar». Con este orden no hay ese hueco, porque el sitio antiguo sigue leyendo los archivos hasta el despliegue.

El inicio del admin muestra el aviso «Hay contenido anterior sin importar» mientras falte algo; se puede cerrar con la ×.

## Entorno local para probar antes de producción

Supabase corre en Docker con la configuración de [`website/supabase/`](../website/supabase/config.toml). `npm run db:reset` aplica las migraciones de `website/supabase/migrations` y luego los datos de prueba de `website/supabase/seed.sql`.

| Comando (desde `website/`) | Qué hace |
|---|---|
| `npm run db:start` | Levanta Supabase local (necesita Docker Desktop abierto) |
| `npm run db:stop` | Lo apaga; los datos se conservan |
| `npm run db:reset` | Borra todo y vuelve a cargar migraciones y datos de prueba (después hay que volver a correr el script privado de la Serie 35) |
| `npm run db:status` | Muestra URLs y claves |

- API: http://127.0.0.1:54321 · Studio (ver y editar tablas): http://127.0.0.1:54323
- `website/.env.local` apunta al Supabase local. Para probar contra producción, reemplaza las tres variables de Supabase por las reales.

## Migraciones

El esquema vive en [`website/supabase/migrations/`](../website/supabase/migrations/) y lo aplica la CLI de Supabase. Cada base (local y producción) guarda en `supabase_migrations.schema_migrations` qué migraciones ya tiene, así que `db:push` solo corre las que faltan. Ya no se pega SQL a mano en el SQL Editor.

| Comando (desde `website/`) | Qué hace |
|---|---|
| `npm run db:nueva -- <nombre>` | Crea `supabase/migrations/<fecha>_<nombre>.sql` vacío |
| `npm run db:reset` | Prueba todas las migraciones desde cero en local |
| `npm run db:pendientes` | Compara lo que hay en el repo con lo aplicado en producción |
| `npm run db:push` | Aplica en producción las migraciones pendientes (pide confirmación) |
| `npm run db:reparar -- --status applied <versión>` | Marca una migración como aplicada sin correrla |

**Flujo para un cambio de esquema**

1. `npm run db:nueva -- agregar_algo` y escribir el SQL. Conviene que sea idempotente (`IF NOT EXISTS`, `DROP ... IF EXISTS`) y que no rompa el código que está desplegado: agregar columnas o tablas, no borrarlas en el mismo cambio.
2. `npm run db:reset` y probar el sitio en local.
3. `npm run db:pendientes` y `npm run db:push` **antes** de hacer push del código. Vercel despliega en cuanto llega el push; si la migración va primero, el código nuevo nunca corre sin sus tablas.
4. Commit de la migración junto con el código que la usa.

Nunca se edita una migración que ya está aplicada en producción: la CLI no la vuelve a correr. Los cambios van en una migración nueva.

**Primera vez en un equipo**

Los comandos contra producción (`db:pendientes`, `db:push`, `db:reparar`) pasan por [`scripts/db-remoto.mjs`](../website/scripts/db-remoto.mjs), que se conecta con `--db-url`. No se usa `supabase link`: en este proyecto falla al crear su usuario temporal (`cli_login_postgres`, «permission denied to alter role»).

Agregar a `website/.env.produccion.local` (ignorado por git) la URL de Supabase → **Connect** → **Session pooler**, con la contraseña de la base en lugar de `[YOUR-PASSWORD]`:

```
SUPABASE_DB_URL=postgresql://postgres.<ref>:<contraseña>@aws-...pooler.supabase.com:5432/postgres
```

La contraseña se puede pegar tal cual: el script la codifica (sin eso, caracteres como `#` o `@` rompen la URL). También se puede pasar `SUPABASE_DB_URL` como variable de entorno en vez de guardarla en el archivo.

**Registro inicial de producción (una sola vez, octubre 2026).** Antes de este sistema, el esquema base y las migraciones 001 a 003 se aplicaron a mano, así que producción no tiene historial. Hay que marcarlas como aplicadas para que `db:push` no intente correrlas de nuevo (el esquema base no es idempotente: fallaría al recrear triggers y políticas):

```bash
npm run db:reparar -- --status applied 20260101000000 20260101000001 20260101000002 20260101000003
npm run db:pendientes   # debe mostrar solo 20260101000004 como pendiente
npm run db:push
```

Se verificó en producción que existen las tablas de cada una (`jugadores`, `programacion`, `hero_fotos`, `jugador_posiciones`) y que falta `cuotas`.

Los datos (por ejemplo el script privado de la Serie 35) no son migraciones: se siguen corriendo a mano.

## Seguridad

- La sesión es una cookie `httpOnly` firmada con HMAC (`SESSION_SECRET`) que expira a las 8 horas.
- El middleware protege `/admin/*` y todas las `/api/*` salvo login/logout: esas APIs devuelven datos personales del plantel.
- `/cuotas/<código>` (solo con las cuotas activadas) es público a propósito: el código (128 bits aleatorios) es la llave. No se indexa ni manda referrer, y se puede regenerar desde el admin.
- Las escrituras usan la `service_role` key solo en el servidor, siempre después de `requireAdmin()`. El sitio público lee con la anon key y RLS solo le muestra lo publicado.
