# Álbum de Ejemplo: Fundación 2006

Este es un álbum de ejemplo para demostrar cómo funciona el sistema de galería.

## Cómo agregar fotos reales:

1. **Agrega tus fotos** en esta carpeta (formatos: .jpg, .jpeg, .png, .webp)
2. **Optimiza las imágenes** antes de subirlas:
   - Tamaño máximo recomendado: 1920px de ancho
   - Usa herramientas como TinyPNG, Squoosh o ImageOptim
   - Calidad: 80-85% para JPG
3. **Actualiza album.json**:
   - Cambia el campo `cover` al nombre de la foto que quieres como portada
   - Ejemplo: `"cover": "foto-equipo-2006.jpg"`
4. **Elimina placeholder.jpg** cuando agregues fotos reales

## Nombres de archivos:

- Usa nombres descriptivos: `equipo-completo.jpg`, `primer-partido.jpg`
- Evita espacios: usa guiones `-` o guiones bajos `_`
- Solo minúsculas para evitar problemas

## El sistema detectará automáticamente:

- Todas las imágenes en esta carpeta
- Las mostrará en la galería con lightbox
- Las optimizará con Next.js Image
