-- ============================================================================
-- DATOS INICIALES (SEEDS) - CLUB AZUL Y BLANCO
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- Temporalmente deshabilitar RLS para permitir inserciones
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE posiciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipos DISABLE ROW LEVEL SECURITY;

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

-- Volver a habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;

-- Verificar que se insertaron correctamente
SELECT 'Categorías insertadas:' as info, COUNT(*) as total FROM categorias;
SELECT 'Posiciones insertadas:' as info, COUNT(*) as total FROM posiciones;
SELECT 'Equipos insertados:' as info, COUNT(*) as total FROM equipos;

-- Mostrar los datos insertados
SELECT 'CATEGORÍAS:' as tabla;
SELECT * FROM categorias ORDER BY orden;

SELECT 'POSICIONES:' as tabla;
SELECT * FROM posiciones ORDER BY id;

SELECT 'EQUIPOS:' as tabla;
SELECT * FROM equipos ORDER BY id;
