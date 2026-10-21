# Tabla de posiciones del Campeonato ANFA

Las páginas `/series/primera`, `/series/honor` y `/series/35` muestran la tabla de posiciones del Campeonato ANFA (Clausura) en curso. No hay tabla en Supabase ni módulo en `/admin`: el dato vive en `website/lib/data/posiciones.json` y se actualiza con un commit. Se publica solo la fecha vigente de cada serie.

## Cómo se actualiza

La Asociación de Fútbol Curicó Aguas Negras publica cada fecha una imagen con las tablas de las tres series. Esa imagen es la fuente, y el JSON reproduce sus cifras.

1. Guarda la imagen nueva de ANFA.
2. Transcribe las tres series a `website/lib/data/posiciones.json` (o pídele a un agente que lea la imagen y actualice el archivo). Mantén la forma: `fecha_numero`, `leyenda`, `series[].tabla[]` con `pos, equipo, pts, pj, g, e, p, gf, gc, dg`, y `es_ayb: true` en la fila de Azul y Blanco.
3. Actualiza `fecha_numero` y revisa `inconsistencias`: si la imagen nueva corrige una anomalía, quita esa entrada.
4. Corre `npm test`. La prueba `tests/sitio/posiciones.test.ts` falla si una cifra no cuadra con G, E y P, si la numeración tiene saltos o si dejaste una discrepancia sin documentar en `inconsistencias`.
5. Push a `Principal`: el despliegue publica los cambios en las tres páginas.

## Criterios de transcripción

- Las cifras se copian tal como están en la imagen, aunque no cuadren entre sí (PTS, PJ, DG). No se corrigen.
- Los nombres de equipo se escriben como en la imagen, salvo erratas evidentes de la propia imagen (`SAN MARTN` → `San Martin`). Conviene usar el mismo nombre entre series para el mismo club.
- Cada anomalía detectada se documenta en `inconsistencias` con serie, equipo y detalle. La web no las muestra: quedan registradas para consultarlas con la asociación.
- Si una serie no aparece en la imagen, se quita del JSON: la sección no se renderiza en esa página.
- El flag `es_ayb` resalta la fila del club en la tabla pública.

## Escudos

Cada fila lleva el escudo del club entre la posición y el nombre. El logo sale del catálogo de rivales (`/admin/rivales`), cruzado por nombre sin tildes ni mayúsculas; Azul y Blanco usa el escudo del club. Si el nombre de la tabla no coincide con el del catálogo (por ejemplo `J. Valvanera` ↔ `CD Valvanera`), se declara en `equivalencias_catalogo` del JSON. Un equipo sin logo en el catálogo muestra un círculo con su inicial: súbele el logo desde `/admin/rivales` o agrega la equivalencia.
