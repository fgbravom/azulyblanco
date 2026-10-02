# Script de imágenes del hero

`optimize-hero-images.mjs` genera las fotos de portada que usa el hero del home y el escudo que aparece sobre la cortina.

Las fotos se sirven como archivos estáticos ya optimizados, sin pasar por `/_next/image`. Es a propósito: el optimizador de Vercel tarda más de un segundo la primera vez que alguien pide una variante, y esa espera es justo la que arruina la cortina en la primera visita.

## Uso

Desde la carpeta `website/`:

```bash
node scripts/optimize-hero-images.mjs
```

Usa `sharp`, que ya viene instalado con Next.js. Tarda un par de minutos.

## Qué lee y qué escribe

| | Ubicación |
|---|---|
| Originales (entrada) | `originals/` |
| Fotos generadas (salida) | `public/images/hero/` |
| Manifiesto (salida) | `components/hero/hero-manifest.json` |

Los originales no se suben al repositorio ni se publican: pesan ~215 MB, están en `.gitignore` y viven fuera de `public/`. Guárdalos en un respaldo aparte: sin ellos no se pueden regenerar las fotos.

Nomenclatura de los originales:

- **Desktop:** `fotoportada0.jpg`, `fotoportada1.jpg`, …
- **Mobile:** `portadamovil0.jpg`, `portadamovil1.jpg`, …

Por cada original se genera una versión AVIF y otra WebP en tres anchos:

| Set | Anchos (px) |
|---|---|
| Desktop | 1440, 1920, 2560 |
| Mobile | 640, 828, 1080 |

El navegador elige el formato y el ancho que le corresponde.

## Agregar, quitar o cambiar fotos

1. Deja el original en `originals/` con el nombre que corresponde (`fotoportada7.jpg`, `portadamovil7.jpg`).
2. Ejecuta el script.
3. Sube los cambios de `public/images/hero/` y `components/hero/hero-manifest.json`.

No hay que tocar código: el hero lee la lista de fotos desde el manifiesto.

Si **reemplazas** una foto, dale un número nuevo en vez de reutilizar el nombre. Las fotos se guardan en la caché del navegador por 7 días (ver `next.config.mjs`), así que con el mismo nombre los visitantes recurrentes seguirían viendo la anterior.

## Ajustes

Al inicio del script:

| Constante | Valor | Descripción |
|---|---|---|
| `SETS` | ver arriba | Prefijo y anchos de cada set |
| `AVIF_OPTIONS` | calidad 45 | Bajarla reduce el peso; sobre 55 casi lo duplica sin mejora visible |
| `WEBP_OPTIONS` | calidad 72 | Formato de respaldo para navegadores sin AVIF |
| `MOBILE_BOX_RATIO` | 1.3 | Proporción alto/ancho que la foto debe cubrir en móvil |
| `CREST_SIZE` | 384 | Tamaño del escudo de la cortina |
