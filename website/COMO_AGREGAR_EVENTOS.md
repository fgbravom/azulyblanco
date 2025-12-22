# Cómo Agregar Eventos al Calendario

Este documento explica cómo agregar eventos (partidos y entrenamientos) al calendario del sitio web.

## Ubicación del Archivo

Los eventos se encuentran en:
```
website/lib/data/eventos-diciembre.ts
```

## Estructura de un Evento

Cada evento debe tener la siguiente estructura:

```typescript
{
  id: 'dic-X',              // ID único del evento (ej: dic-1, dic-2, etc.)
  fecha: 'YYYY-MM-DD',      // Fecha en formato ISO (ej: 2025-12-25)
  dia: 'DÍA',               // Día de la semana en MAYÚSCULAS (ej: LUNES, MARTES, etc.)
  diaMes: XX,               // Número del día del mes (ej: 25)
  mes: 'MES',               // Mes en MAYÚSCULAS (ej: DICIEMBRE)
  tipo: 'partido' | 'entrenamiento',  // Tipo de evento
  rival: 'NOMBRE',          // (Solo para partidos) Nombre del equipo rival
  actividad: 'NOMBRE',      // (Solo para entrenamientos) Nombre de la actividad
  estadio: 'NOMBRE',        // Lugar del evento
  horaInicio: 'HH:MM',      // Hora de inicio (opcional) en formato 24hrs
  confirmado: true | false  // Si el evento está confirmado
}
```

## Ejemplo de Partido

**IMPORTANTE**: Para partidos, el campo `rival` debe incluir ambos equipos en formato "AYB VS NOMBRE_RIVAL"

```typescript
{
  id: 'dic-7',
  fecha: '2025-12-29',
  dia: 'DOMINGO',
  diaMes: 29,
  mes: 'DICIEMBRE',
  tipo: 'partido',
  rival: 'AYB VS DEPORTIVO CENTRAL',  // ⚠️ Siempre incluir ambos equipos
  estadio: 'ESTADIO MUNICIPAL',
  horaInicio: '15:00',
  confirmado: true
}
```

## Ejemplo de Entrenamiento

```typescript
{
  id: 'dic-8',
  fecha: '2025-12-30',
  dia: 'LUNES',
  diaMes: 30,
  mes: 'DICIEMBRE',
  tipo: 'entrenamiento',
  actividad: 'ENTRENAMIENTO FÍSICO',
  estadio: 'ESTADIO ANFA',
  horaInicio: '19:00',
  confirmado: true
}
```

## Pasos para Agregar un Evento

1. **Abrir el archivo**: `website/lib/data/eventos-diciembre.ts`

2. **Agregar el evento al array**: Copia uno de los eventos existentes y modifica los valores

3. **Asignar ID único**: Usa el siguiente número disponible (ej: si el último es 'dic-6', usa 'dic-7')

4. **Verificar la fecha**: Asegúrate de que el formato sea correcto (YYYY-MM-DD)

5. **Verificar el día de la semana**: Usa un calendario para confirmar que el día corresponde a la fecha

6. **Guardar el archivo**: Los cambios se reflejarán automáticamente en:
   - Página principal (próximos 3 eventos)
   - Página de partidos (calendario completo)
   - Vista de próximos partidos

## Notas Importantes

### ✅ Sincronización Automática

El sistema ahora usa **funciones centralizadas** en `website/lib/utils/calendario.ts` que garantizan:

- ✅ Comparación consistente de fechas
- ✅ Filtrado correcto de eventos futuros
- ✅ Ordenamiento cronológico automático
- ✅ Sincronización entre todas las vistas (Home, Partidos, Calendario)

### 🔄 No Requiere Reinicio

Una vez que guardes el archivo, los cambios se aplicarán automáticamente. No necesitas:
- ❌ Reiniciar el servidor
- ❌ Limpiar caché
- ❌ Modificar otros archivos

### 📅 Gestión de Meses

Cuando llegue un nuevo mes:

1. Crea un nuevo archivo (ej: `eventos-enero.ts`)
2. Actualiza las importaciones en:
   - `website/app/page.tsx`
   - `website/app/partidos/page.tsx`

### ⚠️ Errores Comunes a Evitar

1. **Fecha incorrecta**: Verifica que el formato sea YYYY-MM-DD
   ```typescript
   ✅ fecha: '2025-12-25'
   ❌ fecha: '25-12-2025'
   ❌ fecha: '2025/12/25'
   ```

2. **Día de semana equivocado**: Usa un calendario para verificar
   ```typescript
   ✅ fecha: '2025-12-25', dia: 'JUEVES'  // 25 de diciembre de 2025 es jueves
   ❌ fecha: '2025-12-25', dia: 'VIERNES'
   ```

3. **ID duplicado**: Cada evento debe tener un ID único
   ```typescript
   ✅ id: 'dic-7'  // Nuevo, único
   ❌ id: 'dic-6'  // Ya existe
   ```

4. **Campos requeridos faltantes**: Para partidos usa `rival` (con ambos equipos), para entrenamientos usa `actividad`
   ```typescript
   // Partido ✅
   tipo: 'partido',
   rival: 'AYB VS CLUB AMÉRICA'  // Siempre incluir ambos equipos

   // Partido ❌ (formato incorrecto)
   tipo: 'partido',
   rival: 'CLUB AMÉRICA'  // Falta "AYB VS"

   // Entrenamiento ✅
   tipo: 'entrenamiento',
   actividad: 'PRÁCTICA TÁCTICA'
   ```

## Funciones de Utilidad Disponibles

El archivo `website/lib/utils/calendario.ts` proporciona:

- `getFechaHoy()`: Obtiene la fecha actual en formato YYYY-MM-DD
- `filtrarEventosFuturos()`: Filtra eventos futuros
- `ordenarEventosPorFecha()`: Ordena eventos cronológicamente
- `obtenerProximosEventos()`: Obtiene los N próximos eventos
- `esFechaHoy()`: Verifica si una fecha es hoy
- `filtrarSoloPartidos()`: Filtra solo partidos

Estas funciones garantizan consistencia en todo el sitio.

## Soporte

Si tienes problemas al agregar eventos, verifica:
1. La estructura del objeto
2. El formato de la fecha
3. Que todos los campos requeridos estén presentes
4. Los mensajes de error en la consola del navegador
