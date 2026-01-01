# 🔍 Pasos de Verificación - Base de Datos Azul y Blanco

## ✅ Estado Actual

### Lo que ya funciona:
- ✅ Servidor de desarrollo corriendo en `http://localhost:3000`
- ✅ Conexión a Supabase exitosa
- ✅ Todas las 6 tablas accesibles desde la aplicación
- ✅ Panel de administración implementado
- ✅ Sistema de autenticación funcionando

### Lo que falta:
- ⚠️ **Datos iniciales (seed data) no insertados** - Las tablas están vacías
- ⚠️ **Schema SQL necesita ejecutarse en Supabase**

---

## 📋 Pasos para Completar la Configuración

### Paso 1: Ejecutar el Schema SQL en Supabase

1. **Ir a Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/xmdmetscdojdlrngdemz
   ```

2. **Abrir el SQL Editor:**
   - Click en "SQL Editor" en el menú lateral izquierdo
   - Click en "New Query"

3. **Copiar y Pegar el Schema Completo:**
   - Abrir el archivo: `database/schema.sql`
   - Copiar **TODO** el contenido (líneas 1-404)
   - Pegarlo en el editor de Supabase

4. **Ejecutar el Script:**
   - Click en el botón "Run" (o presionar Ctrl+Enter)
   - Esperar a que termine (debería tomar 2-5 segundos)

5. **Verificar que no hay errores:**
   - Si hay errores relacionados con políticas RLS existentes, es normal
   - Puedes ignorarlos o eliminar las políticas existentes primero

---

### Paso 2: Verificar que los Datos Iniciales se Insertaron

#### Opción A: Usando la Aplicación Web

1. **Probar la API de Test:**
   ```
   http://localhost:3000/api/test-db
   ```
   Debe retornar: `"success": true`

2. **Verificar Equipos:**
   ```
   http://localhost:3000/api/equipos
   ```
   Debe mostrar 3 equipos:
   - Azul y Blanco - Primera
   - Azul y Blanco - Honor
   - Azul y Blanco - 35

#### Opción B: Usando Supabase Table Editor

1. **Ir a Table Editor:**
   ```
   https://supabase.com/dashboard/project/xmdmetscdojdlrngdemz/editor
   ```

2. **Verificar cada tabla:**
   - **categorias**: Debe tener 3 registros (Primera, Honor, 35)
   - **posiciones**: Debe tener 10 registros (Portero, Defensa Central, etc.)
   - **equipos**: Debe tener 3 registros (uno por categoría)
   - **jugadores**: Debe estar vacía (normal)
   - **partidos**: Debe estar vacía (normal)
   - **estadisticas_partido**: Debe estar vacía (normal)

---

### Paso 3: Probar el Panel de Administración

1. **Acceder al Login:**
   ```
   http://localhost:3000/admin/login
   ```

2. **Ingresar contraseña:**
   ```
   admin123
   ```

3. **Debería redirigir al Dashboard:**
   ```
   http://localhost:3000/admin
   ```

---

### Paso 4: Crear un Jugador de Prueba

1. **Ir a Gestión de Jugadores:**
   - Click en "Jugadores" en el sidebar
   - O ir directamente a: `http://localhost:3000/admin/jugadores`

2. **Click en "Nuevo Jugador"**

3. **Llenar el formulario:**

   **Tab "Personal":**
   - Nombre: `Juan`
   - Apellidos: `Pérez García`
   - Fecha de Nacimiento: `1995-05-15`
   - DNI: `12345678A`
   - Nacionalidad: `España` (ya viene por defecto)

   **Tab "Deportiva":**
   - Equipo: Seleccionar `Azul y Blanco - Primera`
   - Posición: Seleccionar `Delantero Centro`
   - Dorsal: `9`
   - Altura (cm): `180`
   - Peso (kg): `75`
   - Pie Preferido: Seleccionar `Derecho`
   - Estado: `Activo` (ya viene por defecto)

   **Tab "Contacto":** (opcional)
   - Email: `juan.perez@example.com`
   - Teléfono: `600123456`

   **Tab "Médica":** (opcional)
   - Tipo de Sangre: `O+`
   - Contacto de Emergencia: `María Pérez`
   - Teléfono de Emergencia: `600654321`

4. **Click en "Crear Jugador"**

5. **Verificar:**
   - Debe aparecer una notificación verde: "Jugador creado exitosamente"
   - El jugador debe aparecer en la tabla
   - Debe mostrarse: `#9 Juan Pérez García - Delantero Centro - Azul y Blanco - Primera`

---

### Paso 5: Verificar en Supabase

1. **Ir al Table Editor de Supabase:**
   ```
   https://supabase.com/dashboard/project/xmdmetscdojdlrngdemz/editor/jugadores
   ```

2. **Verificar que el jugador existe:**
   - Debe aparecer Juan Pérez García con todos sus datos
   - El `equipo_id` debe ser un número (probablemente 1, 2 o 3)
   - El `posicion_id` debe ser un número (probablemente 10 para Delantero Centro)

---

### Paso 6: Probar Editar y Eliminar

#### Editar:
1. En la tabla de jugadores, click en el ícono de lápiz (editar)
2. Cambiar el dorsal a `10`
3. Click en "Guardar"
4. Verificar que la notificación dice "Jugador actualizado exitosamente"
5. Verificar que el cambio se refleja en la tabla

#### Eliminar:
1. Click en el ícono de papelera (eliminar)
2. Confirmar la eliminación
3. Verificar que el jugador desaparece de la tabla

---

## 🎯 Resultado Esperado

Si todo funciona correctamente:

1. ✅ Puedes acceder al panel en `http://localhost:3000/admin`
2. ✅ El login funciona con `admin123`
3. ✅ Los selects de "Equipo" y "Posición" muestran opciones
4. ✅ Puedes crear un jugador y aparece en la tabla
5. ✅ El jugador se guarda en Supabase
6. ✅ Puedes editar y eliminar jugadores
7. ✅ Las notificaciones toast aparecen en cada acción

---

## 🐛 Solución de Problemas Comunes

### Problema 1: Los selects de Equipo/Posición están vacíos

**Causa:** El schema SQL no se ejecutó correctamente o los datos semilla no se insertaron.

**Solución:**
1. Ir a Supabase SQL Editor
2. Ejecutar solo la sección de SEEDS (líneas 327-356 del schema.sql):

```sql
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
```

### Problema 2: Error al crear jugador

**Causa 1:** Validaciones fallando

**Solución:** Asegúrate de llenar al menos:
- Nombre
- Apellidos
- Equipo (seleccionar de la lista)
- Posición (seleccionar de la lista)

**Causa 2:** Error de base de datos

**Solución:**
1. Abrir la consola del navegador (F12)
2. Ver el error específico en la pestaña "Console"
3. Si dice "relation 'jugadores' does not exist", ejecutar el schema completo
4. Si dice "foreign key constraint", verificar que equipos y posiciones existen

### Problema 3: No puedo hacer login

**Causa:** Variables de entorno no configuradas

**Solución:**
1. Verificar que existe el archivo `.env.local` en la carpeta `website/`
2. Verificar que contiene:
   ```
   ADMIN_PASSWORD_HASH=$2a$10$Q7J5KZ... (tu hash)
   SESSION_SECRET=tu-secreto-aqui
   ```
3. Reiniciar el servidor:
   ```bash
   # Matar el proceso actual
   taskkill /F /PID 23172

   # Iniciar de nuevo
   cd website
   npm run dev
   ```

### Problema 4: Las notificaciones no aparecen

**Causa:** Componente Toaster no agregado al layout

**Solución:**
Verificar que `website/app/layout.tsx` incluye:
```typescript
import { Toaster } from "@/components/ui/sonner";

// ... dentro del return
<Toaster />
```

---

## 📊 Checklist de Verificación Completa

Usa este checklist para asegurarte de que todo funciona:

- [ ] El servidor corre en `http://localhost:3000`
- [ ] `/api/test-db` retorna `success: true`
- [ ] `/api/equipos` retorna 3 equipos
- [ ] Puedo acceder a `/admin/login`
- [ ] El login funciona con `admin123`
- [ ] Veo el dashboard con el sidebar
- [ ] Puedo navegar a "Jugadores"
- [ ] El botón "Nuevo Jugador" abre el modal
- [ ] El select de "Equipo" tiene 3 opciones
- [ ] El select de "Posición" tiene 10 opciones
- [ ] Puedo crear un jugador sin errores
- [ ] Veo la notificación "Jugador creado exitosamente"
- [ ] El jugador aparece en la tabla
- [ ] El jugador existe en Supabase Table Editor
- [ ] Puedo editar el jugador
- [ ] Puedo eliminar el jugador
- [ ] Todas las notificaciones aparecen correctamente

---

## 🚀 Siguientes Pasos

Una vez verificado que todo funciona:

1. **Agregar más jugadores** para tener datos de prueba
2. **Implementar Gestión de Partidos** (Fase 5)
3. **Implementar Gestión de Estadísticas** (Fase 6)
4. **Cambiar la contraseña por defecto** por una segura
5. **Configurar el sidebar mobile** para responsive

---

## 📞 Información de Contacto y Recursos

**Archivos importantes:**
- `database/schema.sql` - Schema completo de la base de datos
- `SETUP_ADMIN.md` - Guía de configuración paso a paso
- `ADMIN_COMPLETADO.md` - Resumen de implementación
- `database/README.md` - Documentación del esquema
- `database/EJEMPLOS_FRONTEND.md` - Ejemplos de uso

**Supabase Project:**
- Project ID: `xmdmetscdojdlrngdemz`
- Dashboard: https://supabase.com/dashboard/project/xmdmetscdojdlrngdemz

**Contraseña Admin:**
- Contraseña actual: `admin123`
- Para cambiar: Ver `ADMIN_COMPLETADO.md` sección "Cambiar Contraseña"

---

¡Buena suerte con la verificación! 🎉
