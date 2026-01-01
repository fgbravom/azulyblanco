-- ============================================================================
-- DATOS INICIALES (SEEDS) - CLUB AZUL Y BLANCO
-- Solo ejecutar si las tablas ya fueron creadas
-- ============================================================================

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, orden) VALUES
  ('Primera', 'Equipo de Primera División', 1),
  ('Honor', 'Equipo de Honor', 2),
  ('35', 'Equipo de Mayores de 35', 3)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar posiciones
INSERT INTO posiciones (nombre, abreviatura) VALUES
  ('Portero', 'POR'),
  ('Defensa Central', 'DFC'),
  ('Lateral Derecho', 'LTD'),
  ('Lateral Izquierdo', 'LTI'),
  ('Pivote', 'PIV'),
  ('Mediocampista', 'MED'),
  ('Mediocampista Ofensivo', 'MCO'),
  ('Extremo Derecho', 'EXD'),
  ('Extremo Izquierdo', 'EXI'),
  ('Delantero Centro', 'DC')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar equipos para la temporada actual
INSERT INTO equipos (categoria_id, nombre, temporada, activo) VALUES
  ((SELECT id FROM categorias WHERE nombre = 'Primera'), 'Azul y Blanco - Primera', '2024-2025', true),
  ((SELECT id FROM categorias WHERE nombre = 'Honor'), 'Azul y Blanco - Honor', '2024-2025', true),
  ((SELECT id FROM categorias WHERE nombre = '35'), 'Azul y Blanco - 35', '2024-2025', true)
ON CONFLICT (categoria_id, temporada) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT 'Categorías insertadas:' as info, COUNT(*) as total FROM categorias;
SELECT 'Posiciones insertadas:' as info, COUNT(*) as total FROM posiciones;
SELECT 'Equipos insertados:' as info, COUNT(*) as total FROM equipos;
