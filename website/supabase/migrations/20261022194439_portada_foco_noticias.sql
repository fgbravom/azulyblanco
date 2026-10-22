-- Encuadre de la portada de una noticia: el punto de la foto que se mantiene
-- visible al recortarla. Va de 0 a 100 en cada eje y se aplica como
-- object-position en el artículo, el listado y las tarjetas del inicio.
-- 50/50 es el centro: las portadas guardadas quedan como hasta ahora.

ALTER TABLE noticias ADD COLUMN IF NOT EXISTS portada_foco_x smallint NOT NULL DEFAULT 50;
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS portada_foco_y smallint NOT NULL DEFAULT 50;

ALTER TABLE noticias DROP CONSTRAINT IF EXISTS noticias_portada_foco_rango;
ALTER TABLE noticias ADD CONSTRAINT noticias_portada_foco_rango
  CHECK (portada_foco_x BETWEEN 0 AND 100 AND portada_foco_y BETWEEN 0 AND 100);
