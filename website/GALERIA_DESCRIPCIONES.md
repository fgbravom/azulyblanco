# Sistema de Descripciones de Fotos en Galería

## Descripción General

El sistema ahora permite agregar descripciones opcionales a las fotos individuales de cada álbum. Las fotos con descripción muestran un pequeño ícono de información (ℹ️) en la esquina superior derecha, y al hacer clic en la foto para verla en el lightbox, se muestra la descripción completa debajo de la imagen.

## Cómo Agregar Descripciones

### 1. Editar el archivo `album.json`

En el directorio de cada álbum, edita el archivo `album.json` y agrega un campo `photoDescriptions` con un array de objetos que contengan:
- `filename`: El nombre exacto del archivo de la foto
- `description`: El texto descriptivo (puede incluir nombres de personas, contexto, etc.)

### 2. Ejemplo

```json
{
  "title": "Internacional 2007",
  "description": "Recuerdos del torneo Internacional 2007...",
  "date": "2007-08-15",
  "categoria": "historia",
  "tags": ["torneo", "internacional", "2007"],
  "cover": "foto1.jpg",
  "photoDescriptions": [
    {
      "filename": "foto1.jpg",
      "description": "Equipo completo. Fila superior (izq a der): Juan Pérez, Pedro González, Luis Martínez, Carlos Silva. Fila inferior: Miguel Rojas, Diego Torres, Fernando Castro, Roberto Muñoz."
    },
    {
      "filename": "foto2.jpg",
      "description": "Celebración del gol en el minuto 78. Anotador: Juan Pérez, asistencia de Pedro González."
    }
  ]
}
```

## Características

- **Indicador Visual**: Las fotos con descripción muestran un ícono de información en la esquina superior derecha
- **Lightbox Mejorado**: Al abrir la foto, la descripción aparece en la parte inferior con un diseño elegante
- **Opcional**: No es necesario agregar descripciones a todas las fotos, solo a las que lo requieran
- **Flexible**: Las descripciones pueden ser tan largas o cortas como necesites

## Notas Técnicas

- El campo `photoDescriptions` es completamente opcional
- Si no se especifica, las fotos se muestran sin el ícono de información
- El `filename` debe coincidir exactamente con el nombre del archivo en el directorio
- Las descripciones soportan texto largo y se formatean automáticamente para buena legibilidad
