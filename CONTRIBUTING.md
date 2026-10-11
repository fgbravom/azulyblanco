# Cómo colaborar

Gracias por querer aportar al sitio del club. No hace falta ser experto: arreglar un texto, mejorar cómo se ve una página en el celular o reportar algo que no funciona también ayuda.

Si no sabes por dónde empezar, revisa los [issues](https://github.com/fgbravom/azulyblanco/issues), sobre todo los marcados con `good first issue`. Si quieres trabajar en algo, coméntalo en el issue para que no lo hagan dos personas a la vez. Para una idea nueva, abre un issue antes de programar y la conversamos.

## 1. Lo que necesitas instalado

- [Node.js](https://nodejs.org) 20 o superior
- [Git](https://git-scm.com)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), para correr la base de datos en tu computador
- Una cuenta de [GitHub](https://github.com)

## 2. Copiar el proyecto

1. En GitHub, aprieta **Fork** (arriba a la derecha). Eso crea tu propia copia del repositorio en tu cuenta.
2. Clona tu copia y entra a la carpeta de la aplicación:

   ```bash
   git clone https://github.com/<tu-usuario>/azulyblanco.git
   cd azulyblanco/website
   npm install
   ```

## 3. Levantar la base de datos local

Trabajas con una base de datos propia en tu computador, con datos de prueba. Nunca necesitas acceso a la base real del club.

Con Docker Desktop abierto, desde `website/`:

```bash
npm run db:start    # la primera vez descarga las imágenes de Docker y tarda unos minutos
npm run db:reset    # crea las tablas y carga los datos de prueba
npm run db:status   # muestra la URL y las claves de tu base local
```

Studio, para ver y editar las tablas, queda en http://127.0.0.1:54323.

## 4. Variables de entorno

Copia el archivo de ejemplo:

```bash
cp ../.env.example .env.local
```

Completa `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`: los valores que mostró `npm run db:status` (API URL, anon key y service_role key).
- `SESSION_SECRET`: cualquier texto largo. Puedes generarlo con:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- `ADMIN_PASSWORD_HASH`: déjalo vacío.

`.env.local` no se sube a git.

## 5. Correr el sitio

```bash
npm run dev
```

- Sitio: http://localhost:3000
- Panel de administración: http://localhost:3000/admin, con la contraseña de desarrollo `asd123`. Solo funciona en local: en producción se usa otra.

Algunas fotos (por ejemplo las de la galería) no están en el repositorio, así que en tu copia pueden aparecer espacios vacíos. Es normal.

## 6. Hacer tu cambio

1. Crea una rama para tu cambio:

   ```bash
   git checkout -b arreglar-menu-celular
   ```

2. Haz el cambio y pruébalo en el navegador.
3. Antes de subirlo, corre las pruebas y el linter:

   ```bash
   npm test
   npm run lint
   ```

4. Haz commit siguiendo el formato de abajo y súbelo a tu fork:

   ```bash
   git push origin arreglar-menu-celular
   ```

5. En GitHub, abre un **Pull Request** hacia la rama `Repositiorios` del repositorio del club. Cuenta qué cambiaste y por qué, y si cambia algo visible agrega una captura.

Un mantenedor lo revisa y puede pedirte ajustes. Cuando se aprueba y se une, el cambio sale publicado en el sitio en un par de minutos.

### Formato de los commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/), con la descripción en español:

```
tipo(alcance): descripción breve en minúscula
```

- La descripción va en infinitivo ("agregar", "corregir"), en minúscula y sin punto final.
- Un commit tiene un solo propósito.

| Tipo | Para qué |
|---|---|
| `feat` | Algo nuevo visible en el sitio |
| `fix` | Corregir un error |
| `copy` | Cambiar textos, sin cambiar funcionalidad |
| `perf` | Que cargue más rápido o pese menos |
| `refactor` | Reordenar código sin cambiar lo que hace |
| `test` | Agregar o corregir pruebas |
| `docs` | Documentación |
| `chore` | Mantención (limpieza, renombres) |

Ejemplos:

```
fix(galeria): corregir el desborde de las fotos en el celular
copy(historia): corregir el año de fundación
feat(partidos): mostrar la cancha en la programación
```

## Cambios en la base de datos

Si tu cambio necesita una tabla o una columna nueva:

1. Crea una migración: `npm run db:nueva -- agregar_algo`, y escribe el SQL en el archivo que se genera en `supabase/migrations/`.
2. Pruébala con `npm run db:reset`.
3. Inclúyela en el mismo pull request que el código que la usa.

No edites migraciones que ya existen: los cambios van en una nueva. Las migraciones se aplican en producción solo cuando el mantenedor las revisa. Los comandos `db:push`, `db:pendientes` y `db:reparar` son para eso y no los necesitas. Más detalles en [Docs/ADMIN.md](Docs/ADMIN.md#migraciones).

## Datos personales

El repositorio es público. Nunca subas:

- Archivos `.env` ni claves de ningún tipo.
- Datos reales de jugadores o socios (nombres, RUT, teléfonos, correos, deudas), ni en el código, ni en los datos de prueba, ni en capturas.

Los datos de prueba de `supabase/seed.sql` son inventados y deben seguir así.

Si encuentras un problema de seguridad, no abras un issue público: avísale directamente al mantenedor.
