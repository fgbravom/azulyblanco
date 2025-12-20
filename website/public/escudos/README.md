# Historia del Escudo - Azul y Blanco

Esta carpeta contiene las imágenes de los diferentes escudos del club a lo largo de su historia.

## Nomenclatura de archivos:

Los archivos deben nombrarse con el año del escudo:

```
2006.png    - Escudo del año 2006
2010.png    - Escudo del año 2010
2015.png    - Escudo del año 2015
2020.png    - Escudo del año 2020
```

## Formatos soportados:

- `.png` (recomendado para logos con transparencia)
- `.jpg` / `.jpeg`
- `.svg` (ideal para escudos vectoriales)
- `.webp`

## Tamaño recomendado:

- Mínimo: 500x500px
- Recomendado: 1000x1000px
- Mantener aspecto cuadrado o similar

## Metadata opcional:

Puedes crear un archivo `escudos.json` para agregar descripciones:

```json
{
  "2006": {
    "year": 2006,
    "description": "Primer escudo oficial del club, diseño simple y tradicional",
    "designer": "Nombre del diseñador (opcional)"
  },
  "2010": {
    "year": 2010,
    "description": "Rediseño moderno con elementos más definidos"
  }
}
```

El sistema detectará automáticamente todos los archivos de imagen y los ordenará por año.
