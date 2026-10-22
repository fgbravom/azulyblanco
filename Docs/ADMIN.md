# Panel de administración

`/admin` permite editar el contenido del sitio sin tocar código: fotos de la portada, programación, noticias, galerías, biblioteca de imágenes, plantel e información de las series. Hay además un sistema de cuotas de los jugadores, oculto por ahora ([CUOTAS.md](CUOTAS.md)).

## Dónde vive cada cosa

| Sección | Tabla / almacenamiento | Se ve en |
|---|---|---|
| Portada | `hero_fotos`, archivos en `medios/hero/<id>/` | Hero del inicio |
| Programación | `programacion`; goleadores y asistencias en `goles` | Inicio y `/partidos` |
| Noticias | `noticias` (contenido en Markdown; un link de YouTube solo en su línea se incrusta como video); motivos de despublicación en `noticias_despublicaciones` | Inicio, `/noticias` |
| Galerías | `albumes` + `fotos`, archivos en `medios/galeria/<album>/` | `/galeria` |
| Redactores | `redactores` (nombre y avatar, de lectura pública) y `cuentas_redactores` (acceso al panel, solo servidor) | Firma de cada noticia |
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

## Pruebas

Unitarias con [Vitest](https://vitest.dev), en [`website/tests/`](../website/tests/). No necesitan base de datos ni Docker: Supabase se reemplaza por un cliente falso ([`tests/helpers/supabase-falso.ts`](../website/tests/helpers/supabase-falso.ts)) que registra qué se le pide a cada tabla.

| Comando (desde `website/`) | Qué hace |
|---|---|
| `npm test` | Corre todas las pruebas una vez |
| `npm run test:watch` | Las vuelve a correr al guardar |

| Carpeta | Qué cubre |
|---|---|
| `tests/admin/auth/` | Token de sesión, contraseña, freno de intentos, login/logout y middleware |
| `tests/admin/` | Que **cada** ruta `/api` y **cada** server action rechace sin sesión sin tocar la base, y que un redactor solo pueda usar las acciones de `ACCIONES_REDACTOR`; permisos de noticias y medios, cuentas de redactores, cuotas, series, slugs y validaciones |
| `tests/sitio/` | Calendario, plantel público, respaldo a archivos y el link personal de cuotas |
| `tests/seguridad/` | Guardianes estáticos: leen las migraciones y la configuración y fallan si un cambio vuelve a exponer datos personales a la clave pública |
| `tests/componentes/` | Login, menú por rol, diálogo de motivo y componentes de calendario y cuotas, renderizados con Testing Library (jsdom) |

Una server action o ruta `/api` nueva queda cubierta sola por las pruebas de protección: si no llama a `requireAdmin()` o `rechazarSinSesion()`, la suite falla. Si una acción se abre a redactores con `requireEditorNoticias()`, hay que agregarla a `ACCIONES_REDACTOR` en `tests/admin/acciones-protegidas.test.ts` y probar sus reglas por separado.

## Redactores con acceso

El panel tiene dos roles. El **admin** (usuario `ab06`, contraseña de `ADMIN_PASSWORD_HASH`) conserva todo. Un **redactor** ingresa con el usuario y la contraseña de su cuenta y solo ve `/admin/noticias` y `/admin/cuenta`.

| | Admin | Redactor |
|---|---|---|
| Noticias | Todas | Solo las suyas (`redactor_id` propio); firma siempre con su nombre |
| Publicar / despublicar | Sí, sin motivo obligatorio | Sí; para despublicar debe escribir un motivo (10 a 500 caracteres) |
| Eliminar noticias | Sí | No |
| Imágenes | Biblioteca completa, puede eliminar | Subir a la biblioteca y su avatar, listar y elegir; no eliminar ni subir a otros destinos |
| Resto del panel y `/api/*` | Sí | No (el middleware redirige o responde 401, y cada acción lo vuelve a comprobar) |
| Mi cuenta | No aplica (su contraseña es una variable de entorno) | Cambiar su contraseña y su avatar (este último, después de cambiar la temporal) |

**Dar acceso a un redactor.** En `/admin/redactores`, botón «Acceso al panel» del redactor → «Crear acceso» con un usuario (3 a 32 caracteres: minúsculas, números, punto, guion y guion bajo; `ab06` está reservado). El panel muestra una contraseña temporal **una sola vez**: hay que entregársela al redactor. Al ingresar, el redactor es enviado a «Mi cuenta» y no puede usar nada más hasta cambiarla (mínimo 10 caracteres).

**Restablecer, cambiar usuario o desactivar.** Desde el mismo diálogo. Restablecer genera otra contraseña temporal; desactivar impide ingresar hasta que se reactive.

**Revocación de sesiones.** El token de sesión lleva el id del redactor y la `version_sesion` de su cuenta. En cada petición al servidor se compara con la base y se confirma que la cuenta siga activa. Restablecer la contraseña, desactivar la cuenta o que el propio redactor cambie su contraseña suben `version_sesion` y cierran sus demás sesiones (al cambiarla él mismo, su sesión actual se vuelve a emitir). El middleware no consulta la base: solo valida la firma.

**Despublicaciones.** Cada vez que una noticia publicada vuelve a borrador se guarda una fila en `noticias_despublicaciones` (`redactor_id` nulo si la despublicó el admin; motivo vacío si el admin no escribió uno). El admin ve en el listado y en el editor quién la despublicó, cuándo y por qué.

**Migración 013.** Crea `cuentas_redactores` y `noticias_despublicaciones` (con RLS y sin políticas: solo `service_role`). **Debe aplicarse en producción antes de desplegar el código** (`npm run db:push`, con autorización), porque el login y el listado de redactores ya consultan esas tablas.

## Goles y asistencias

Al editar un partido con resultado, el formulario muestra una fila por cada gol de AYB (solo los lados que son de AYB; en un partido interno, de ambos). En cada fila se elige el goleador (o «Autogol del rival») y, opcionalmente, quien lo asistió. Los jugadores aparecen agrupados por serie, con las series del partido primero y los inactivos al final. Dejar un gol sin goleador es válido: simplemente no se muestra. Si el rival hizo goles, aparece también una fila por cada uno para marcar si fue autogol de un jugador de AYB; se guarda en el lado del rival y el sitio lo muestra bajo el rival como «Nombre Apellido (autogol)».

Se guardan en `goles`, una fila por gol con su `lado` y `orden`. La tabla tiene RLS sin políticas (solo `service_role`); el sitio los lee desde `vista_goles_publico`, que trae únicamente nombre y apellidos de los jugadores y solo de partidos publicados. En el detalle del partido se muestran bajo cada equipo con nombre y primer apellido. Si el resultado se borra, se borran los goleadores; si se borra un jugador, su gol queda sin nombre y deja de mostrarse.

**Migración 015.** Permite que un autogol tenga autor (el jugador de AYB que lo hizo) y exige que un autogol no tenga asistencia. Hay que aplicarla en producción antes de desplegar: sin ella, guardar un autogol de AYB falla.

**Migración 014.** Crea `goles` y `vista_goles_publico`. Conviene aplicarla en producción antes de desplegar (`npm run db:push`, con autorización): sin ella el sitio sigue funcionando, pero el admin no puede guardar partidos porque al guardar actualiza los goleadores.

## Canchas y estadios

`/admin/estadios` mantiene el catálogo de canchas y estadios donde juega el club: nombre (obligatorio y único sin importar mayúsculas), ubicación y link al mapa (opcionales).

En el formulario de actividad, «Lugar guardado» elige una cancha del catálogo y rellena el campo «Lugar»; si no está en la lista se puede escribir a mano y queda como texto sin vínculo. Las actividades antiguas solo tienen el texto y siguen funcionando igual. Al **renombrar** una cancha se actualiza también el lugar de las actividades que la usan; al **eliminarla**, esas actividades conservan el lugar escrito (el texto ya no está vinculado).

El sitio público muestra el lugar tal como se escribe en la actividad, y en la ficha del partido es un link a Google Maps: el del catálogo si la actividad tiene cancha vinculada con mapa, o una búsqueda con el lugar escrito si no.

**Migración 016.** Crea `estadios` (con lectura pública por RLS; la escritura es solo `service_role`), agrega `programacion.estadio_id` y siembra los lugares que ya aparecen en las programaciones. **Debe aplicarse en producción antes de desplegar el código** (`npm run db:push`, con autorización): guardar una actividad ya manda `estadio_id` y falla sin la columna.

## Encuadre de las fotos

El admin deja mover una foto dentro de marcos con la proporción real de cada lugar donde se muestra: se arrastra la foto con el mouse o el dedo (con el teclado, las flechas) para elegir qué parte se ve, y los marcos cambian al instante. En un eje donde la foto no sobra el marco no hay nada que mover, así que ahí arrastrarla no cambia nada.

**Portada de noticia** (panel «Portada» del editor): los marcos son el artículo (16/9) y las tarjetas del inicio (3/4), y «Centrar» devuelve la foto al medio. El encuadre se guarda como un punto de 0 a 100 en cada eje (`noticias.portada_foco_x/y`, ver `lib/contenido/foco.ts`) y se aplica como `object-position` en el artículo, el listado de noticias, las tarjetas del inicio y el listado del admin.

**Fotos del plantel y del cuerpo técnico** (formulario del jugador y panel «Cuerpo técnico» de cada serie): los marcos son la ficha de la serie (3/4) y el avatar redondo del admin. El encuadre se guarda en `jugadores.foto_foco_x/y` y en `equipos.<cargo>_foco_x/y`, y se aplica en las fichas de las series y en los avatares del admin. Estas fotos **pueden quedar sin ajustar** (columnas anulables): mientras nadie mueva la foto, cada lugar muestra su recorte de siempre (la ficha de la serie desde arriba, los avatares al centro). «Quitar ajuste» vuelve a eso, y cambiar la foto también.

**Migración 017.** Agrega `portada_foco_x` y `portada_foco_y` a `noticias`, con `DEFAULT 50`: las portadas ya guardadas quedan recortadas como hasta ahora. **Debe aplicarse en producción antes de desplegar el código** (`npm run db:push`, con autorización): sin ella, guardar una noticia falla porque el formulario ya manda el encuadre.

**Migración 018.** Agrega `foto_foco_x/y` a `jugadores` y seis columnas de encuadre a `equipos` (una por foto del cuerpo técnico), con permiso de lectura por columna para la clave pública, y recrea `vista_jugadores_completa` y `vista_plantel_publico` (como en la migración 004) para exponer el encuadre. **Debe aplicarse en producción antes de desplegar el código** (`npm run db:push`, con autorización): sin ella, guardar un jugador falla y las series se quedan sin plantel, porque la vista ya no coincide con lo que el sitio le pide.

## Seguridad

- La sesión es una cookie `httpOnly` firmada con HMAC (`SESSION_SECRET`) que expira a las 8 horas. El token lleva el rol (admin o redactor) y, para un redactor, su id y la versión de su sesión.
- El admin entra con el usuario `ab06` y la contraseña de `ADMIN_PASSWORD_HASH`. Los redactores entran con la cuenta de la tabla `cuentas_redactores` (RLS sin políticas: solo `service_role`); subir su `version_sesion` o desactivarla cierra sus sesiones. Un redactor solo ve `/admin/noticias` y `/admin/cuenta`, y `requireAdmin()` y las rutas `/api` lo rechazan.
- Tras 10 intentos fallidos de login desde una IP, el login responde 429 durante 15 minutos (tabla `login_intentos`).
- El middleware protege `/admin/*` y todas las `/api/*` salvo login/logout: esas APIs devuelven datos personales del plantel. Además, cada ruta revisa la sesión por su cuenta (`rechazarSinSesion()`), por si el middleware fallara.
- `/cuotas/<código>` (solo con las cuotas activadas) es público a propósito: el código (128 bits aleatorios) es la llave. No se indexa ni manda referrer, y se puede regenerar desde el admin.
- Las escrituras usan la `service_role` key solo en el servidor, siempre después de `requireAdmin()`. El sitio público lee con la anon key y RLS solo le muestra lo publicado.
