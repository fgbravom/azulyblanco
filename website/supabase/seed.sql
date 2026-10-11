-- ============================================================================
-- DATOS DE PRUEBA - SOLO SUPABASE LOCAL
-- Se cargan con `npm run db:reset` después de las migraciones de
-- supabase/migrations. Nada de esto se ejecuta en producción.
-- ============================================================================

-- Cuerpo técnico
UPDATE equipos SET entrenador = 'Director Técnico Primera', asistente_tecnico = 'Asistente Primera'
  WHERE nombre = 'Azul y Blanco - Primera';
UPDATE equipos SET entrenador = 'Director Técnico Honor' WHERE nombre = 'Azul y Blanco - Honor';
UPDATE equipos SET entrenador = 'Director Técnico 35' WHERE nombre = 'Azul y Blanco - 35';

-- Plantel de ejemplo
INSERT INTO jugadores (nombre, apellidos, nacionalidad, equipo_id, posicion_id, dorsal, estado)
SELECT j.nombre, j.apellidos, 'Chile',
  (SELECT id FROM equipos WHERE nombre = j.equipo),
  (SELECT id FROM posiciones WHERE nombre = j.posicion),
  j.dorsal, j.estado
FROM (VALUES
  ('Arquero', 'Prueba Uno', 'Azul y Blanco - Primera', 'Portero', 1, 'Activo'),
  ('Central', 'Prueba Dos', 'Azul y Blanco - Primera', 'Defensa Central', 4, 'Activo'),
  ('Lateral', 'Prueba Tres', 'Azul y Blanco - Primera', 'Lateral Derecho', 2, 'Lesionado'),
  ('Volante', 'Prueba Cuatro', 'Azul y Blanco - Primera', 'Mediocampista', 8, 'Activo'),
  ('Delantero', 'Prueba Cinco', 'Azul y Blanco - Primera', 'Delantero Centro', 9, 'Activo'),
  ('Arquero', 'Honor Uno', 'Azul y Blanco - Honor', 'Portero', 1, 'Activo'),
  ('Volante', 'Honor Dos', 'Azul y Blanco - Honor', 'Pivote', 5, 'Activo'),
  ('Puntero', 'Honor Tres', 'Azul y Blanco - Honor', 'Extremo Izquierdo', 11, 'Sancionado'),
  ('Defensa', 'Máster Uno', 'Azul y Blanco - 35', 'Defensa Central', 3, 'Activo'),
  ('Enganche', 'Máster Dos', 'Azul y Blanco - 35', 'Mediocampista Ofensivo', 10, 'Activo')
) AS j(nombre, apellidos, equipo, posicion, dorsal, estado);

-- Posiciones: la principal de cada uno, y una segunda para probar varias posiciones
INSERT INTO jugador_posiciones (jugador_id, posicion_id, orden)
SELECT id, posicion_id, 0 FROM jugadores
ON CONFLICT DO NOTHING;
INSERT INTO jugador_posiciones (jugador_id, posicion_id, orden)
SELECT j.id, (SELECT id FROM posiciones WHERE nombre = 'Lateral Izquierdo'), 1
FROM jugadores j WHERE j.apellidos = 'Prueba Dos'
ON CONFLICT DO NOTHING;

-- Programación relativa a hoy, para que siempre haya actividades próximas
INSERT INTO programacion (tipo, fecha, hora_inicio, rival, tipo_partido, actividad, titulo, descripcion, estadio, confirmado, llevar, series)
VALUES
  ('partido', CURRENT_DATE + 3, '16:00', 'AYB VS CLUB DE PRUEBA', 'Amistoso', NULL, NULL, NULL, 'ESTADIO ANFA', TRUE, '2.000', '{Serie Primera}'),
  ('entrenamiento', CURRENT_DATE + 5, '20:00', NULL, NULL, 'ENTRENAMIENTO', NULL, NULL, 'ESTADIO ANFA', FALSE, NULL, '{}'),
  ('partido', CURRENT_DATE + 10, '11:00', 'DEPORTIVO EJEMPLO VS AYB35', 'Oficial', NULL, NULL, NULL, 'LA GRANJA', FALSE, NULL, '{Serie 35}'),
  ('evento', CURRENT_DATE + 20, '10:00', NULL, NULL, NULL, 'Jornada de prueba', 'Evento de ejemplo para probar el calendario.', 'ESTADIO ANFA', TRUE, NULL, '{Serie Primera,Serie Honor,Serie 35}'),
  ('partido', CURRENT_DATE - 7, '16:00', 'AYB VS RIVAL PASADO', 'Amistoso', NULL, NULL, NULL, 'SOL DE SEPTIEMBRE', TRUE, NULL, '{Serie Honor}');

-- Una noticia publicada y un borrador
INSERT INTO noticias (slug, titulo, bajada, contenido, categoria, autor, fecha, publicado) VALUES
  ('noticia-de-prueba', 'Noticia de prueba', 'Bajada de ejemplo para el entorno local.',
   E'## Un subtítulo\n\nPárrafo con **negrita** y _cursiva_.\n\n- Punto uno\n- Punto dos', 'Institucional', 'Club Azul y Blanco', CURRENT_DATE, TRUE),
  ('borrador-de-prueba', 'Borrador de prueba', 'No debería verse en el sitio público.', 'Contenido en borrador.', 'Partidos', NULL, CURRENT_DATE, FALSE);
