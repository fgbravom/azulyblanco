-- ============================================================================
-- ESQUEMA DE BASE DE DATOS - CLUB AZUL Y BLANCO
-- Sistema de gestión de equipos, jugadores, partidos y estadísticas
-- ============================================================================

-- Eliminar tablas existentes si es necesario (¡CUIDADO EN PRODUCCIÓN!)
-- DROP TABLE IF EXISTS estadisticas_partido CASCADE;
-- DROP TABLE IF EXISTS partidos CASCADE;
-- DROP TABLE IF EXISTS jugadores CASCADE;
-- DROP TABLE IF EXISTS equipos CASCADE;
-- DROP TABLE IF EXISTS categorias CASCADE;
-- DROP TABLE IF EXISTS posiciones CASCADE;

-- ============================================================================
-- 1. TABLA DE CATEGORÍAS
-- Define las categorías del club (Primera, Honor, 35)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categorias (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE, -- 'Primera', 'Honor', '35'
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0, -- Para ordenar en la UI
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. TABLA DE POSICIONES
-- Define las posiciones de los jugadores (Portero, Defensa, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS posiciones (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE, -- 'Portero', 'Defensa', 'Mediocampista', 'Delantero'
  abreviatura VARCHAR(5) NOT NULL, -- 'POR', 'DEF', 'MED', 'DEL'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLA DE EQUIPOS
-- Representa cada equipo del club
-- ============================================================================
CREATE TABLE IF NOT EXISTS equipos (
  id BIGSERIAL PRIMARY KEY,
  categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL, -- 'Azul y Blanco - Primera'
  temporada VARCHAR(20) NOT NULL, -- '2024-2025'
  entrenador VARCHAR(200),
  asistente_tecnico VARCHAR(200),
  preparador_fisico VARCHAR(200),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(categoria_id, temporada)
);

-- ============================================================================
-- 4. TABLA DE JUGADORES
-- Ficha completa de cada jugador
-- ============================================================================
CREATE TABLE IF NOT EXISTS jugadores (
  id BIGSERIAL PRIMARY KEY,

  -- Información personal
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  nacionalidad VARCHAR(100) DEFAULT 'España',
  dni VARCHAR(20),
  foto_url TEXT, -- URL de la foto del jugador

  -- Información deportiva
  equipo_id BIGINT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  posicion_id BIGINT NOT NULL REFERENCES posiciones(id),
  dorsal INTEGER,
  altura_cm INTEGER, -- Altura en centímetros
  peso_kg DECIMAL(5,2), -- Peso en kilogramos
  pie_preferido VARCHAR(20), -- 'Derecho', 'Izquierdo', 'Ambidiestro'

  -- Información de contacto
  email VARCHAR(255),
  telefono VARCHAR(20),
  direccion TEXT,

  -- Información médica
  tipo_sangre VARCHAR(10),
  contacto_emergencia VARCHAR(200),
  telefono_emergencia VARCHAR(20),
  alergias TEXT,
  lesiones_cronicas TEXT,

  -- Estado
  estado VARCHAR(50) DEFAULT 'Activo', -- 'Activo', 'Lesionado', 'Sancionado', 'Inactivo'
  fecha_alta DATE DEFAULT CURRENT_DATE,
  fecha_baja DATE,

  -- Metadata
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(equipo_id, dorsal),
  CONSTRAINT chk_dorsal CHECK (dorsal > 0 AND dorsal <= 99)
);

-- ============================================================================
-- 5. TABLA DE PARTIDOS
-- Registro de todos los partidos
-- ============================================================================
CREATE TABLE IF NOT EXISTS partidos (
  id BIGSERIAL PRIMARY KEY,

  -- Información del partido
  equipo_id BIGINT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL,
  hora TIME,
  ubicacion VARCHAR(200), -- 'Local', 'Visitante'

  -- Equipos
  equipo_local VARCHAR(200) NOT NULL,
  equipo_visitante VARCHAR(200) NOT NULL,

  -- Resultado
  goles_local INTEGER,
  goles_visitante INTEGER,
  estado VARCHAR(50) DEFAULT 'Programado', -- 'Programado', 'En curso', 'Finalizado', 'Suspendido', 'Cancelado'

  -- Información adicional
  competicion VARCHAR(200), -- 'Liga', 'Copa', 'Amistoso'
  jornada INTEGER,
  estadio VARCHAR(200),
  arbitro VARCHAR(200),
  asistencia INTEGER, -- Número de espectadores

  -- Notas
  resumen TEXT, -- Resumen del partido
  observaciones TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. TABLA DE ESTADÍSTICAS POR PARTIDO
-- Registro detallado de las estadísticas de cada jugador en cada partido
-- ============================================================================
CREATE TABLE IF NOT EXISTS estadisticas_partido (
  id BIGSERIAL PRIMARY KEY,

  -- Referencias
  partido_id BIGINT NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id BIGINT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,

  -- Participación
  titular BOOLEAN DEFAULT FALSE, -- ¿Fue titular?
  minutos_jugados INTEGER DEFAULT 0,
  minuto_entrada INTEGER, -- Minuto en que entró (si fue suplente)
  minuto_salida INTEGER, -- Minuto en que salió (si fue sustituido)

  -- Estadísticas ofensivas
  goles INTEGER DEFAULT 0,
  asistencias INTEGER DEFAULT 0,
  tiros_totales INTEGER DEFAULT 0,
  tiros_puerta INTEGER DEFAULT 0,
  regates_exitosos INTEGER DEFAULT 0,
  pases_clave INTEGER DEFAULT 0,

  -- Estadísticas defensivas
  tackles_exitosos INTEGER DEFAULT 0,
  intercepciones INTEGER DEFAULT 0,
  despejes INTEGER DEFAULT 0,
  duelos_ganados INTEGER DEFAULT 0,
  duelos_perdidos INTEGER DEFAULT 0,

  -- Disciplina
  tarjetas_amarillas INTEGER DEFAULT 0,
  tarjetas_rojas INTEGER DEFAULT 0,
  faltas_cometidas INTEGER DEFAULT 0,
  faltas_recibidas INTEGER DEFAULT 0,

  -- Portero (si aplica)
  paradas INTEGER DEFAULT 0,
  goles_encajados INTEGER DEFAULT 0,
  penales_detenidos INTEGER DEFAULT 0,

  -- Valoración
  valoracion DECIMAL(3,1), -- Valoración del 1.0 al 10.0

  -- Notas
  observaciones TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(partido_id, jugador_id),
  CONSTRAINT chk_minutos CHECK (minutos_jugados >= 0 AND minutos_jugados <= 120),
  CONSTRAINT chk_valoracion CHECK (valoracion IS NULL OR (valoracion >= 1.0 AND valoracion <= 10.0))
);

-- ============================================================================
-- 7. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índices para jugadores
CREATE INDEX IF NOT EXISTS idx_jugadores_equipo ON jugadores(equipo_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_posicion ON jugadores(posicion_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_activo ON jugadores(activo);
CREATE INDEX IF NOT EXISTS idx_jugadores_estado ON jugadores(estado);

-- Índices para partidos
CREATE INDEX IF NOT EXISTS idx_partidos_equipo ON partidos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON partidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_partidos_estado ON partidos(estado);

-- Índices para estadísticas
CREATE INDEX IF NOT EXISTS idx_estadisticas_partido ON estadisticas_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_estadisticas_jugador ON estadisticas_partido(jugador_id);

-- ============================================================================
-- 8. FUNCIONES Y TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipos_updated_at BEFORE UPDATE ON equipos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jugadores_updated_at BEFORE UPDATE ON jugadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partidos_updated_at BEFORE UPDATE ON partidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estadisticas_updated_at BEFORE UPDATE ON estadisticas_partido
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. VISTAS ÚTILES
-- ============================================================================

-- Vista de jugadores con información completa
CREATE OR REPLACE VIEW vista_jugadores_completa AS
SELECT
  j.id,
  j.nombre,
  j.apellidos,
  j.nombre || ' ' || j.apellidos AS nombre_completo,
  j.fecha_nacimiento,
  EXTRACT(YEAR FROM AGE(j.fecha_nacimiento)) AS edad,
  j.nacionalidad,
  j.foto_url,
  j.dorsal,
  p.nombre AS posicion,
  p.abreviatura AS posicion_abr,
  e.nombre AS equipo,
  c.nombre AS categoria,
  j.altura_cm,
  j.peso_kg,
  j.pie_preferido,
  j.estado,
  j.activo
FROM jugadores j
JOIN posiciones p ON j.posicion_id = p.id
JOIN equipos e ON j.equipo_id = e.id
JOIN categorias c ON e.categoria_id = c.id;

-- Vista de estadísticas acumuladas por jugador
CREATE OR REPLACE VIEW vista_estadisticas_jugador AS
SELECT
  j.id AS jugador_id,
  j.nombre || ' ' || j.apellidos AS jugador,
  e.nombre AS equipo,
  COUNT(DISTINCT ep.partido_id) AS partidos_jugados,
  SUM(ep.minutos_jugados) AS minutos_totales,
  SUM(ep.goles) AS goles_totales,
  SUM(ep.asistencias) AS asistencias_totales,
  SUM(ep.tarjetas_amarillas) AS amarillas_totales,
  SUM(ep.tarjetas_rojas) AS rojas_totales,
  ROUND(AVG(ep.valoracion), 2) AS valoracion_promedio
FROM jugadores j
JOIN equipos e ON j.equipo_id = e.id
LEFT JOIN estadisticas_partido ep ON j.id = ep.jugador_id
GROUP BY j.id, j.nombre, j.apellidos, e.nombre;

-- Vista de partidos con resultado
CREATE OR REPLACE VIEW vista_partidos_completa AS
SELECT
  p.id,
  p.fecha,
  p.hora,
  e.nombre AS equipo,
  c.nombre AS categoria,
  p.equipo_local,
  p.equipo_visitante,
  p.goles_local,
  p.goles_visitante,
  p.ubicacion,
  p.estado,
  p.competicion,
  p.jornada,
  p.estadio,
  CASE
    WHEN p.estado = 'Finalizado' AND p.ubicacion = 'Local' AND p.goles_local > p.goles_visitante THEN 'Victoria'
    WHEN p.estado = 'Finalizado' AND p.ubicacion = 'Visitante' AND p.goles_visitante > p.goles_local THEN 'Victoria'
    WHEN p.estado = 'Finalizado' AND p.goles_local = p.goles_visitante THEN 'Empate'
    WHEN p.estado = 'Finalizado' THEN 'Derrota'
    ELSE 'Sin resultado'
  END AS resultado
FROM partidos p
JOIN equipos e ON p.equipo_id = e.id
JOIN categorias c ON e.categoria_id = c.id;

-- ============================================================================
-- 10. DATOS INICIALES (SEEDS)
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

-- ============================================================================
-- 11. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estadisticas_partido ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para todas las tablas
CREATE POLICY "Lectura pública de categorías" ON categorias FOR SELECT USING (true);
CREATE POLICY "Lectura pública de posiciones" ON posiciones FOR SELECT USING (true);
CREATE POLICY "Lectura pública de equipos" ON equipos FOR SELECT USING (true);
CREATE POLICY "Lectura pública de jugadores" ON jugadores FOR SELECT USING (true);
CREATE POLICY "Lectura pública de partidos" ON partidos FOR SELECT USING (true);
CREATE POLICY "Lectura pública de estadísticas" ON estadisticas_partido FOR SELECT USING (true);

-- Políticas de escritura solo para usuarios autenticados
-- Nota: Ajustar según tu sistema de roles (admin, editor, etc.)
CREATE POLICY "Usuarios autenticados pueden insertar jugadores" ON jugadores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar jugadores" ON jugadores
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar partidos" ON partidos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar partidos" ON partidos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar estadísticas" ON estadisticas_partido
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar estadísticas" ON estadisticas_partido
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- FIN DEL ESQUEMA
-- ============================================================================

-- Para verificar que todo se creó correctamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
