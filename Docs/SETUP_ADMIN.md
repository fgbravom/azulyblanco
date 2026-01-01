# 🚀 Guía de Configuración del Panel de Administración

## ✅ Lo que ya está implementado

### 1. Sistema de Autenticación ✅
- Login con contraseña simple
- Protección de rutas `/admin/*`
- Sesiones con cookies HTTP-only
- **Contraseña actual:** `admin123`

### 2. Layout del Admin ✅
- Sidebar lateral con navegación
- Header con botón de logout
- Dashboard principal

### 3. Gestión de Jugadores ✅
- Tabla de jugadores con búsqueda y filtros
- Formulario completo con 4 tabs (Personal, Deportiva, Contacto, Médica)
- Validaciones con Zod
- CRUD completo (Crear, Leer, Actualizar, Eliminar)

## 📋 Configuración de la Base de Datos en Supabase

### Paso 1: Verificar Conexión con Supabase

Tu configuración actual en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xmdmetscdojdlrngdemz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable__rnetxE0W_SI_y50NAdBAw_15f7T3G7
```

### Paso 2: Ejecutar el Schema SQL

1. **Ve a Supabase Dashboard:**
   - Abre https://supabase.com/dashboard
   - Selecciona tu proyecto "xmdmetscdojdlrngdemz"
   - Ve a "SQL Editor" en el menú lateral

2. **Ejecuta el Schema:**
   - Click en "New Query"
   - Copia TODO el contenido del archivo `database/schema.sql`
   - Pega en el editor
   - Click en "Run" (o presiona Ctrl+Enter)

3. **Verifica que se crearon las tablas:**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver las siguientes tablas:
     - ✅ categorias
     - ✅ posiciones
     - ✅ equipos
     - ✅ jugadores
     - ✅ partidos
     - ✅ estadisticas_partido

### Paso 3: Verificar Datos Iniciales

El script SQL ya crea datos iniciales:

**Categorías:**
- Primera
- Honor
- 35

**Posiciones:**
- Portero (POR)
- Defensa Central (DFC)
- Lateral Derecho (LTD)
- Lateral Izquierdo (LTI)
- Pivote (PIV)
- Mediocampista (MED)
- Mediocampista Ofensivo (MCO)
- Extremo Derecho (EXD)
- Extremo Izquierdo (EXI)
- Delantero Centro (DC)

**Equipos (temporada 2024-2025):**
- Azul y Blanco - Primera
- Azul y Blanco - Honor
- Azul y Blanco - 35

## 🧪 Probar la Conexión

### Método 1: Usar la API de Prueba

1. Inicia el servidor:
```bash
cd website
npm run dev
```

2. Abre en tu navegador:
```
http://localhost:3000/api/test-db
```

3. Deberías ver un JSON con:
```json
{
  "success": true,
  "message": "Conexión a Supabase exitosa",
  "tests": {
    "connection": true,
    "tables": {
      "categorias": true,
      "posiciones": true,
      "equipos": true,
      "jugadores": true,
      "partidos": true,
      "estadisticas_partido": true
    },
    "errors": []
  }
}
```

### Método 2: Probar el Panel de Admin

1. Ve a:
```
http://localhost:3000/admin/login
```

2. Ingresa la contraseña: `admin123`

3. Una vez dentro, ve a "Jugadores"

4. Click en "Nuevo Jugador"

5. Llena el formulario:
   - **Tab Personal:**
     - Nombre: Juan
     - Apellidos: Pérez

   - **Tab Deportiva:**
     - Equipo: Azul y Blanco - Primera
     - Posición: Delantero Centro
     - Dorsal: 9
     - Pie Preferido: Derecho
     - Estado: Activo

6. Click en "Crear Jugador"

7. Si ves el mensaje "Jugador creado exitosamente" → ✅ **¡La conexión funciona!**

## 🔍 Verificar en Supabase

Después de crear un jugador:

1. Ve a Supabase Dashboard
2. Table Editor → tabla `jugadores`
3. Deberías ver el jugador que acabas de crear

## ❌ Solución de Problemas

### Error: "relation 'categorias' does not exist"

**Solución:** El schema SQL no se ejecutó correctamente.
1. Ve a Supabase SQL Editor
2. Ejecuta nuevamente el archivo `database/schema.sql`
3. Asegúrate de que no haya errores en la consola

### Error: "JWTExpired" o "Invalid API key"

**Solución:** La clave de Supabase es incorrecta.
1. Ve a Supabase Dashboard → Settings → API
2. Copia la "anon/public" key
3. Actualiza `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`
4. Reinicia el servidor de desarrollo

### Error: "Cannot connect to Supabase"

**Solución:** Verifica la URL.
1. Ve a Supabase Dashboard → Settings → API
2. Copia la "Project URL"
3. Actualiza `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`
4. Reinicia el servidor de desarrollo

### No se muestran equipos o posiciones en el formulario

**Solución:** Los datos iniciales no se crearon.
1. Ve a Supabase SQL Editor
2. Ejecuta solo la sección "DATOS INICIALES (SEEDS)" del archivo `database/schema.sql`
3. Verifica en Table Editor que las tablas tengan datos

## 📦 Datos de Ejemplo

Si quieres crear datos de ejemplo rápidamente, ejecuta este SQL en Supabase:

```sql
-- Insertar jugadores de ejemplo
INSERT INTO jugadores (nombre, apellidos, equipo_id, posicion_id, dorsal, fecha_nacimiento, nacionalidad, estado, activo)
VALUES
  ('Juan', 'Pérez',
    (SELECT id FROM equipos WHERE nombre = 'Azul y Blanco - Primera' LIMIT 1),
    (SELECT id FROM posiciones WHERE nombre = 'Delantero Centro' LIMIT 1),
    9, '1995-05-15', 'España', 'Activo', true),

  ('Carlos', 'García',
    (SELECT id FROM equipos WHERE nombre = 'Azul y Blanco - Primera' LIMIT 1),
    (SELECT id FROM posiciones WHERE nombre = 'Portero' LIMIT 1),
    1, '1992-03-20', 'España', 'Activo', true),

  ('Luis', 'Martínez',
    (SELECT id FROM equipos WHERE nombre = 'Azul y Blanco - Primera' LIMIT 1),
    (SELECT id FROM posiciones WHERE nombre = 'Defensa Central' LIMIT 1),
    4, '1997-08-10', 'España', 'Activo', true);
```

## 🎯 Próximos Pasos

Una vez verificada la conexión:

1. ✅ Crea algunos jugadores de prueba
2. ✅ Verifica que aparezcan en la tabla
3. ✅ Prueba editar un jugador
4. ✅ Prueba eliminar un jugador
5. 📝 Continúa con la implementación de Partidos (Fase 5)

## 🔐 Cambiar Contraseña de Admin

Para cambiar la contraseña por defecto:

1. Genera un nuevo hash:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-nueva-contraseña', 10));"
```

2. Copia el hash generado

3. Actualiza en `.env.local`:
```
ADMIN_PASSWORD_HASH=$2a$10$tu-nuevo-hash-aqui
```

4. Reinicia el servidor

## 📞 Ayuda

Si algo no funciona:
1. Verifica los logs en la consola del navegador (F12)
2. Verifica los logs del servidor (terminal donde corre `npm run dev`)
3. Usa la API de prueba: `http://localhost:3000/api/test-db`
4. Verifica la configuración en Supabase Dashboard

---

**¡Listo para comenzar! 🎉**
