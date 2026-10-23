-- ============================================================================
-- MIGRACIÓN 020 - CUENTAS DEL PANEL (ADMINISTRADOR Y COLABORADOR)
-- Una sola tabla con todas las cuentas que entran al panel:
--   · admin: la cuenta del administrador (sin redactor).
--   · colaborador: escribe noticias como un redactor y ve las secciones que
--     le corresponden. Siempre tiene un redactor asociado (su firma).
--
-- Copia las cuentas de cuentas_redactores como colaboradores. La tabla vieja
-- queda sin uso y se borra en una migración posterior, cuando esto esté probado.
--
-- Sin políticas de RLS: solo la lee el servidor con la service_role key.
--
-- Idempotente: volver a correrla no duplica nada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS cuentas_panel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario TEXT NOT NULL,                              -- se guarda en minúscula
  rol TEXT NOT NULL,                                  -- 'admin' | 'colaborador'
  redactor_id UUID UNIQUE REFERENCES redactores(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,                        -- bcrypt
  activa BOOLEAN NOT NULL DEFAULT true,
  debe_cambiar_password BOOLEAN NOT NULL DEFAULT true, -- contraseña temporal entregada por el admin
  version_sesion INT NOT NULL DEFAULT 0,              -- subirla invalida todas sus sesiones
  ultimo_ingreso TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cuentas_panel DROP CONSTRAINT IF EXISTS cuentas_panel_usuario_valido;
ALTER TABLE cuentas_panel ADD CONSTRAINT cuentas_panel_usuario_valido
  CHECK (usuario ~ '^[a-z0-9._-]{3,32}$');

ALTER TABLE cuentas_panel DROP CONSTRAINT IF EXISTS cuentas_panel_rol_valido;
ALTER TABLE cuentas_panel ADD CONSTRAINT cuentas_panel_rol_valido
  CHECK (rol IN ('admin', 'colaborador'));

-- El admin no tiene redactor; el colaborador siempre tiene uno
ALTER TABLE cuentas_panel DROP CONSTRAINT IF EXISTS cuentas_panel_redactor_por_rol;
ALTER TABLE cuentas_panel ADD CONSTRAINT cuentas_panel_redactor_por_rol
  CHECK ((rol = 'admin' AND redactor_id IS NULL) OR (rol = 'colaborador' AND redactor_id IS NOT NULL));

-- Un usuario por cuenta, sin importar mayúsculas
CREATE UNIQUE INDEX IF NOT EXISTS idx_cuentas_panel_usuario_unico ON cuentas_panel(LOWER(usuario));

DROP TRIGGER IF EXISTS update_cuentas_panel_updated_at ON cuentas_panel;
CREATE TRIGGER update_cuentas_panel_updated_at BEFORE UPDATE ON cuentas_panel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cuentas de redactores existentes pasan a colaboradores
INSERT INTO cuentas_panel (usuario, rol, redactor_id, password_hash, activa, debe_cambiar_password, version_sesion, ultimo_ingreso, created_at, updated_at)
SELECT usuario, 'colaborador', redactor_id, password_hash, activa, debe_cambiar_password, version_sesion, ultimo_ingreso, created_at, updated_at
FROM cuentas_redactores
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEGURIDAD (RLS)
-- Sin políticas a propósito: ni anon ni authenticated ven nada.
-- ============================================================================
ALTER TABLE cuentas_panel ENABLE ROW LEVEL SECURITY;
