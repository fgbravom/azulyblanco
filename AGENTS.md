# AGENTS.md

Instrucciones para agentes de código (Claude Code, opencode u otros) que trabajan en este repo. Para personas: [README.md](README.md) y [CONTRIBUTING.md](CONTRIBUTING.md).

Todo texto para el usuario, comentarios y mensajes de commit van en español.

## Proyecto

- `website/` es la aplicación: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, Supabase y Vitest. Casi todo el trabajo ocurre aquí.
- `website-v2/` es un experimento ignorado por git. No tocarlo salvo que se pida.
- `database/` y la mayoría de `Docs/` son de etapas anteriores y pueden estar desactualizados. Vigentes: [Docs/ADMIN.md](Docs/ADMIN.md) (panel, migraciones, seguridad), [Docs/CUOTAS.md](Docs/CUOTAS.md) y [Docs/POSICIONES.md](Docs/POSICIONES.md) (tabla ANFA, actualización desde la imagen oficial).
- Acceso a datos en `website/lib/data/`, tipos de la base en `website/types/database.ts`, panel de administración en `website/app/(admin)/`.

## Comandos (desde `website/`)

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor local en http://localhost:3000 |
| `npm run lint` · `npx tsc --noEmit` · `npm test` | Lo mismo que exige el hook pre-push |
| `npm run build` | Compilación de producción (la corre Vercel en cada despliegue) |
| `npm run db:start` · `db:reset` | Supabase local con Docker y datos de prueba |
| `npm run db:nueva <nombre>` | Nueva migración en `website/supabase/migrations/` |

## Despliegue

- `Principal` es la única rama y **cada push despliega a producción** (https://www.azulyblanco.cl) en Vercel, en ~75 s.
- El hook `.githooks/pre-push` corre lint, tipos y tests de `website/` y bloquea el push si algo falla. En un clon nuevo se activa con `git config core.hooksPath .githooks`. No usar `--no-verify` sin autorización explícita del usuario.
- Después de un push, confirmar contra el dominio de producción que el cambio llegó.

## Base de datos

- `npm run db:push`, `db:pendientes` y `db:reparar` actúan sobre la **base de producción**. Solo con autorización explícita del usuario.
- El repo es público: nunca commitear datos personales, claves ni archivos `.env*`. Los scripts con datos de personas viven en `database/privado/` (ignorado por git) y se corren a mano.

## Commits

Conventional Commits con la descripción en español: `tipo(alcance): descripción en minúscula`, en infinitivo, sin punto final, idealmente bajo 72 caracteres. Tipos: `feat`, `fix`, `copy`, `perf`, `refactor`, `style`, `docs`, `test`, `build`, `ci`, `chore`, `revert`. Un commit, un propósito. Sin firmas ni líneas `Co-Authored-By`.

## Sesiones en paralelo

Puede haber varias sesiones de agentes trabajando en este repo a la vez. **Cada sesión sube solo sus propios cambios:**

- Si hay otra sesión activa, trabajar en un worktree propio, no en la carpeta compartida:
  - Claude Code: `claude --worktree <nombre>` crea `.claude/worktrees/<nombre>/` con la rama `worktree-<nombre>` desde `origin/Principal` y copia los archivos listados en `.worktreeinclude` (como `website/.env.local`).
  - Otras herramientas: `git worktree add ../azulyblanco-<nombre> -b <nombre> origin/Principal` y copiar `website/.env.local` a mano.
  - Un worktree no trae `node_modules`: correr `npm ci` en `website/` antes de trabajar (sin eso el hook pre-push falla).
- No stagear ni commitear cambios que no hizo esta sesión, aunque aparezcan en el árbol de trabajo.
- Antes de hacer push, revisar `git log origin/Principal..HEAD` y confirmar que todos los commits son de esta sesión.
- Desde un worktree se publica con `git fetch origin && git rebase origin/Principal && git push origin HEAD:Principal`.
