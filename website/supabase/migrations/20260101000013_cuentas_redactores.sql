-- ============================================================================
-- MIGRACIÓN 013 - CUENTAS DE REDACTORES Y DESPUBLICACIONES
-- Un redactor puede tener una cuenta (usuario y contraseña) para escribir sus
-- propias noticias desde el admin. Las credenciales van en una tabla aparte
-- porque "redactores" tiene lectura pública.
--
-- noticias_despublicaciones guarda el motivo cada vez que una noticia publicada
-- vuelve a borrador.
--
-- Ambas tablas quedan con RLS y sin políticas: solo las lee el servidor con
-- la service_role key.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS cuentas_redactores (
  redactor_id UUID PRIMARY KEY REFERENCES redactores(id) ON DELETE CASCADE,
  usuario TEXT NOT NULL,                              -- se guarda en minúscula
  password_hash TEXT NOT NULL,                        -- bcrypt
  activa BOOLEAN NOT NULL DEFAULT true,
  debe_cambiar_password BOOLEAN NOT NULL DEFAULT true, -- contraseña temporal entregada por el admin
  version_sesion INT NOT NULL DEFAULT 0,              -- subirla invalida todas sus sesiones
  ultimo_ingreso TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cuentas_redactores DROP CONSTRAINT IF EXISTS cuentas_redactores_usuario_valido;
ALTER TABLE cuentas_redactores ADD CONSTRAINT cuentas_redactores_usuario_valido
  CHECK (usuario ~ '^[a-z0-9._-]{3,32}$');

-- Un usuario por cuenta, sin importar mayúsculas
CREATE UNIQUE INDEX IF NOT EXISTS idx_cuentas_redactores_usuario_unico ON cuentas_redactores(LOWER(usuario));

DROP TRIGGER IF EXISTS update_cuentas_redactores_updated_at ON cuentas_redactores;
CREATE TRIGGER update_cuentas_redactores_updated_at BEFORE UPDATE ON cuentas_redactores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS noticias_despublicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  noticia_id UUID NOT NULL REFERENCES noticias(id) ON DELETE CASCADE,
  redactor_id UUID REFERENCES redactores(id) ON DELETE SET NULL, -- NULL = la despublicó el admin
  motivo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_noticias_despublicaciones_noticia
  ON noticias_despublicaciones(noticia_id, created_at DESC);

-- ============================================================================
-- SEGURIDAD (RLS)
-- Sin políticas a propósito: ni anon ni authenticated ven nada.
-- ============================================================================
ALTER TABLE cuentas_redactores ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias_despublicaciones ENABLE ROW LEVEL SECURITY;
