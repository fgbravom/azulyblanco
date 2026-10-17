# Azul y Blanco

Sitio web del Club de Fútbol Amateur Azul y Blanco: [www.azulyblanco.cl](https://www.azulyblanco.cl)

Muestra la programación y los resultados, las noticias, las galerías de fotos, el plantel de cada serie y la historia del club. Tiene un panel de administración (`/admin`) para editar todo ese contenido sin tocar código.

¿Quieres colaborar? Lee [CONTRIBUTING.md](CONTRIBUTING.md): explica cómo levantar el proyecto en tu computador y cómo proponer cambios.

## Tecnologías

- [Next.js 16](https://nextjs.org/docs) (App Router) con React 19 y TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/docs) y componentes de [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com/docs): base de datos PostgreSQL y almacenamiento de imágenes
- [Vitest](https://vitest.dev) y Testing Library para las pruebas
- Desplegado en [Vercel](https://vercel.com)

## Estructura

```
azulyblanco/
├── website/                 # La aplicación (aquí se trabaja)
│   ├── app/                 # Páginas y rutas /api
│   │   ├── (pages)/  club/  galeria/  noticias/  partidos/  series/  contacto/ ...
│   │   ├── (admin)/  admin/ # Panel de administración
│   │   └── api/
│   ├── components/          # Componentes por sección (admin, hero, calendario, ui...)
│   ├── lib/                 # Acceso a datos, autenticación, validaciones
│   ├── noticias/            # Noticias antiguas en Markdown (respaldo de la base)
│   ├── public/              # Imágenes y escudos
│   ├── supabase/            # Migraciones y datos de prueba para la base local
│   ├── scripts/             # Utilidades (optimizar imágenes, migraciones, importar)
│   └── tests/               # Pruebas unitarias
├── Docs/                    # Documentación
└── .env.example             # Variables de entorno de ejemplo
```

## Comandos principales

Desde `website/`:

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm test` | Corre las pruebas |
| `npm run lint` | Revisa el código con ESLint |
| `npm run build` | Compila como en producción |
| `npm run db:start` / `db:stop` | Levanta o apaga Supabase local (necesita Docker) |
| `npm run db:reset` | Recrea la base local con las migraciones y los datos de prueba |

## Documentación

- [CONTRIBUTING.md](CONTRIBUTING.md): entorno local y cómo enviar cambios
- [Docs/ADMIN.md](Docs/ADMIN.md): panel de administración, migraciones, pruebas y seguridad
- [Docs/CUOTAS.md](Docs/CUOTAS.md): sistema de cuotas de los jugadores (oculto por ahora)

El resto de `Docs/` son notas de etapas anteriores del proyecto y pueden estar desactualizadas.

## Despliegue

Cada cambio que llega a la rama `Principal` se publica solo en producción a través de Vercel. Por eso los cambios entran mediante pull request y alguien los revisa antes.

## Licencia

© Club Azul y Blanco. Todos los derechos reservados.
