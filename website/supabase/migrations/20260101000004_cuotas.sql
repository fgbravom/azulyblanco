-- ============================================================================
-- MIGRACIÓN 004 - CUOTAS DE LOS JUGADORES
--
-- 1. Cada serie (equipo de la temporada) define el monto de su cuota mensual
--    y los datos de transferencia que ve el jugador.
-- 2. Cada jugador tiene una condición (regular, refuerzo, becado) y un código
--    secreto para su link personal /cuotas/<código>.
-- 3. cuotas: lo que se le cobra a un jugador cada mes. Una exención (lesión,
--    ausencia, retiro...) la deja fuera de la deuda.
-- 4. pagos: abonos a una cuota. Hoy los registra el tesorero a mano; las
--    columnas estado y proveedor_id quedan listas para una pasarela de pago
--    (ver docs/CUOTAS.md).
-- 5. La posición del jugador pasa a ser opcional: un jugador recién agregado
--    puede quedar "por definir" hasta completar su ficha.
--
-- Nada de esto es legible con la clave pública: el admin y el link personal
-- leen con la service_role desde el servidor.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

-- 1. CONFIGURACIÓN POR SERIE -------------------------------------------------
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS cuota_monto INTEGER NOT NULL DEFAULT 0;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS cuota_datos_pago TEXT; -- banco, cuenta, RUT, a quién avisar

-- 2. CONDICIÓN Y LINK PERSONAL DEL JUGADOR -----------------------------------
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS cuota_condicion TEXT NOT NULL DEFAULT 'regular';
-- 128 bits aleatorios: el código es la única llave del link personal.
-- El default es volátil, así que cada jugador existente recibe el suyo.
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS codigo_cuotas TEXT NOT NULL
  DEFAULT replace(gen_random_uuid()::text, '-', '');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_cuota_condicion') THEN
    ALTER TABLE jugadores ADD CONSTRAINT chk_cuota_condicion
      CHECK (cuota_condicion IN ('regular', 'refuerzo', 'becado'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_cuota_monto') THEN
    ALTER TABLE equipos ADD CONSTRAINT chk_cuota_monto CHECK (cuota_monto >= 0);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_jugadores_codigo_cuotas ON jugadores(codigo_cuotas);

-- Posición opcional (la ficha la pide al guardar desde el admin)
ALTER TABLE jugadores ALTER COLUMN posicion_id DROP NOT NULL;

-- 3. CUOTAS ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cuotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id BIGINT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  -- Serie a la que se cobró: se conserva si el jugador cambia de serie
  equipo_id BIGINT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  periodo DATE NOT NULL CHECK (EXTRACT(DAY FROM periodo) = 1), -- primer día del mes
  monto INTEGER NOT NULL CHECK (monto >= 0),
  exencion TEXT CHECK (exencion IN ('lesion', 'ausente', 'retiro', 'refuerzo', 'becado', 'otro')),
  nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (jugador_id, periodo)
);

CREATE INDEX IF NOT EXISTS idx_cuotas_equipo_periodo ON cuotas(equipo_id, periodo);

DROP TRIGGER IF EXISTS update_cuotas_updated_at ON cuotas;
CREATE TRIGGER update_cuotas_updated_at BEFORE UPDATE ON cuotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. PAGOS -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuota_id UUID NOT NULL REFERENCES cuotas(id) ON DELETE CASCADE,
  monto INTEGER NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  medio TEXT NOT NULL DEFAULT 'transferencia'
    CHECK (medio IN ('transferencia', 'efectivo', 'mercadopago', 'flow', 'otro')),
  -- Solo 'aprobado' descuenta deuda. 'pendiente' y 'rechazado' son para la
  -- pasarela; 'anulado' es un pago registrado por error (queda el rastro).
  estado TEXT NOT NULL DEFAULT 'aprobado'
    CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'anulado')),
  referencia TEXT,      -- n° de transferencia, comprobante
  proveedor_id TEXT,    -- id de la transacción en Mercado Pago / Flow
  registrado_por TEXT,  -- texto libre mientras el admin tenga contraseña única
  nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_cuota ON pagos(cuota_id);
CREATE INDEX IF NOT EXISTS idx_pagos_proveedor ON pagos(proveedor_id) WHERE proveedor_id IS NOT NULL;

-- 5. ESTADO DE CADA CUOTA ----------------------------------------------------
CREATE OR REPLACE VIEW vista_cuotas AS
SELECT
  c.*,
  COALESCE(p.pagado, 0) AS pagado,
  CASE
    WHEN c.exencion IS NOT NULL THEN 'exenta'
    WHEN COALESCE(p.pagado, 0) >= c.monto THEN 'pagada'
    WHEN COALESCE(p.pagado, 0) > 0 THEN 'parcial'
    ELSE 'pendiente'
  END AS estado,
  CASE WHEN c.exencion IS NOT NULL THEN 0 ELSE GREATEST(c.monto - COALESCE(p.pagado, 0), 0) END AS saldo
FROM cuotas c
LEFT JOIN LATERAL (
  SELECT SUM(x.monto)::INT AS pagado FROM pagos x WHERE x.cuota_id = c.id AND x.estado = 'aprobado'
) p ON TRUE;

-- 6. VISTAS DEL PLANTEL CON POSICIÓN OPCIONAL --------------------------------
-- Se recrean (no basta CREATE OR REPLACE: j.* trae las columnas nuevas)
DROP VIEW IF EXISTS vista_plantel_publico;
DROP VIEW IF EXISTS vista_jugadores_completa;
CREATE VIEW vista_jugadores_completa AS
SELECT
  j.*,
  TRIM(j.nombre || ' ' || j.apellidos) AS nombre_completo,
  EXTRACT(YEAR FROM AGE(j.fecha_nacimiento))::INT AS edad,
  p.nombre AS posicion,
  p.abreviatura AS posicion_abr,
  e.nombre AS equipo,
  c.nombre AS categoria,
  COALESCE(jp.ids, ARRAY_REMOVE(ARRAY[j.posicion_id], NULL)) AS posiciones_ids,
  COALESCE(jp.nombres, ARRAY_REMOVE(ARRAY[p.nombre::TEXT], NULL)) AS posiciones,
  COALESCE(jp.abreviaturas, ARRAY_REMOVE(ARRAY[p.abreviatura::TEXT], NULL)) AS posiciones_abr
FROM jugadores j
LEFT JOIN posiciones p ON j.posicion_id = p.id
JOIN equipos e ON j.equipo_id = e.id
JOIN categorias c ON e.categoria_id = c.id
LEFT JOIN LATERAL (
  SELECT
    ARRAY_AGG(px.id ORDER BY x.orden, px.id) AS ids,
    ARRAY_AGG(px.nombre::TEXT ORDER BY x.orden, px.id) AS nombres,
    ARRAY_AGG(px.abreviatura::TEXT ORDER BY x.orden, px.id) AS abreviaturas
  FROM jugador_posiciones x
  JOIN posiciones px ON px.id = x.posicion_id
  WHERE x.jugador_id = j.id
) jp ON TRUE;

CREATE VIEW vista_plantel_publico AS
SELECT
  id, nombre, apellidos, nombre_completo, foto_url, dorsal, estado, activo,
  equipo_id, equipo, categoria, posicion, posicion_abr, posiciones, posiciones_abr
FROM vista_jugadores_completa;

-- 7. PERMISOS ----------------------------------------------------------------
-- RLS sin políticas: la clave pública no lee ni escribe nada de esto.
ALTER TABLE cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Las vistas corren con los permisos de su dueño y se saltan RLS
REVOKE ALL ON vista_cuotas FROM anon, authenticated;
REVOKE ALL ON vista_jugadores_completa FROM anon, authenticated;
GRANT SELECT ON vista_plantel_publico TO anon, authenticated;
