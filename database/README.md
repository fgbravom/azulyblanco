# Sistema de Gestión de Equipos - Azul y Blanco

Sistema completo de backend para la gestión de equipos, jugadores, partidos y estadísticas del Club Azul y Blanco.

## 📋 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
3. [API Endpoints](#api-endpoints)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Tipos TypeScript](#tipos-typescript)

---

## 🚀 Instalación

### 1. Configurar Base de Datos en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el SQL Editor
3. Ejecuta el archivo `database/schema.sql`

```sql
-- Esto creará todas las tablas, vistas, funciones y datos iniciales
```

### 2. Verificar la Instalación

Ejecuta esta consulta para verificar que todas las tablas se crearon correctamente:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver las siguientes tablas:
- `categorias`
- `posiciones`
- `equipos`
- `jugadores`
- `partidos`
- `estadisticas_partido`

---

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### 1. **categorias**
Categorías del club (Primera, Honor, 35)

```typescript
{
  id: number
  nombre: string  // 'Primera', 'Honor', '35'
  descripcion: string
  orden: number
  activo: boolean
}
```

#### 2. **posiciones**
Posiciones de los jugadores

```typescript
{
  id: number
  nombre: string  // 'Portero', 'Defensa', etc.
  abreviatura: string  // 'POR', 'DEF', etc.
}
```

#### 3. **equipos**
Equipos por categoría y temporada

```typescript
{
  id: number
  categoria_id: number
  nombre: string
  temporada: string  // '2024-2025'
  entrenador: string
  asistente_tecnico: string
  preparador_fisico: string
  activo: boolean
}
```

#### 4. **jugadores**
Ficha completa de cada jugador

```typescript
{
  id: number
  // Personal
  nombre: string
  apellidos: string
  fecha_nacimiento: date
  nacionalidad: string
  dni: string
  foto_url: string

  // Deportivo
  equipo_id: number
  posicion_id: number
  dorsal: number
  altura_cm: number
  peso_kg: number
  pie_preferido: 'Derecho' | 'Izquierdo' | 'Ambidiestro'

  // Contacto
  email: string
  telefono: string
  direccion: string

  // Médico
  tipo_sangre: string
  contacto_emergencia: string
  telefono_emergencia: string
  alergias: string
  lesiones_cronicas: string

  // Estado
  estado: 'Activo' | 'Lesionado' | 'Sancionado' | 'Inactivo'
  fecha_alta: date
  fecha_baja: date
  activo: boolean
}
```

#### 5. **partidos**
Registro de partidos

```typescript
{
  id: number
  equipo_id: number
  fecha: timestamp
  hora: time
  ubicacion: 'Local' | 'Visitante'
  equipo_local: string
  equipo_visitante: string
  goles_local: number
  goles_visitante: number
  estado: 'Programado' | 'En curso' | 'Finalizado' | 'Suspendido' | 'Cancelado'
  competicion: string  // 'Liga', 'Copa', 'Amistoso'
  jornada: number
  estadio: string
  arbitro: string
  asistencia: number
  resumen: string
  observaciones: string
}
```

#### 6. **estadisticas_partido**
Estadísticas detalladas por jugador y partido

```typescript
{
  id: number
  partido_id: number
  jugador_id: number

  // Participación
  titular: boolean
  minutos_jugados: number
  minuto_entrada: number
  minuto_salida: number

  // Ofensivas
  goles: number
  asistencias: number
  tiros_totales: number
  tiros_puerta: number
  regates_exitosos: number
  pases_clave: number

  // Defensivas
  tackles_exitosos: number
  intercepciones: number
  despejes: number
  duelos_ganados: number
  duelos_perdidos: number

  // Disciplina
  tarjetas_amarillas: number
  tarjetas_rojas: number
  faltas_cometidas: number
  faltas_recibidas: number

  // Portero
  paradas: number
  goles_encajados: number
  penales_detenidos: number

  // Valoración
  valoracion: number  // 1.0 - 10.0
  observaciones: string
}
```

### Vistas

#### vista_jugadores_completa
Jugadores con toda la información relacionada

#### vista_estadisticas_jugador
Estadísticas acumuladas por jugador

#### vista_partidos_completa
Partidos con resultado calculado

---

## 🔌 API Endpoints

### Jugadores

#### GET /api/jugadores
Obtiene lista de jugadores con filtros

**Query Parameters:**
- `equipo_id` - Filtrar por equipo
- `posicion_id` - Filtrar por posición
- `estado` - Filtrar por estado
- `activo` - Filtrar por activo (true/false)
- `busqueda` - Buscar por nombre
- `page` - Número de página
- `pageSize` - Tamaño de página
- `sort_campo` - Campo para ordenar
- `sort_orden` - Orden (asc/desc)

**Ejemplo:**
```javascript
const response = await fetch('/api/jugadores?equipo_id=1&activo=true&page=1&pageSize=20');
const { data, pagination } = await response.json();
```

#### GET /api/jugadores/[id]
Obtiene un jugador específico

**Ejemplo:**
```javascript
const response = await fetch('/api/jugadores/1');
const { data } = await response.json();
```

#### POST /api/jugadores
Crea un nuevo jugador

**Body:**
```javascript
{
  nombre: "Juan",
  apellidos: "Pérez García",
  equipo_id: 1,
  posicion_id: 5,
  dorsal: 10,
  fecha_nacimiento: "1995-05-15",
  nacionalidad: "España",
  altura_cm: 175,
  peso_kg: 70,
  pie_preferido: "Derecho",
  email: "juan.perez@example.com",
  telefono: "600123456"
}
```

#### PATCH /api/jugadores/[id]
Actualiza un jugador

**Body:**
```javascript
{
  dorsal: 11,
  estado: "Lesionado",
  lesiones_cronicas: "Esguince de tobillo"
}
```

#### DELETE /api/jugadores/[id]
Elimina un jugador (soft delete)

**Query Parameters:**
- `permanente=true` - Eliminar permanentemente

---

### Partidos

#### GET /api/partidos
Obtiene lista de partidos con filtros

**Query Parameters:**
- `equipo_id` - Filtrar por equipo
- `estado` - Filtrar por estado
- `competicion` - Filtrar por competición
- `ubicacion` - Filtrar por ubicación (Local/Visitante)
- `fecha_desde` - Fecha desde (YYYY-MM-DD)
- `fecha_hasta` - Fecha hasta (YYYY-MM-DD)
- `page` - Número de página
- `pageSize` - Tamaño de página

**Ejemplo:**
```javascript
const response = await fetch('/api/partidos?equipo_id=1&estado=Finalizado&page=1');
const { data, pagination } = await response.json();
```

#### POST /api/partidos
Crea un nuevo partido

**Body:**
```javascript
{
  equipo_id: 1,
  fecha: "2025-01-15T18:00:00Z",
  hora: "18:00",
  ubicacion: "Local",
  equipo_local: "Azul y Blanco - Primera",
  equipo_visitante: "Rival FC",
  competicion: "Liga",
  jornada: 15,
  estadio: "Campo Municipal"
}
```

#### PATCH /api/partidos/[id]
Actualiza un partido

**Actualizar resultado:**
```javascript
{
  actualizar_resultado: true,
  goles_local: 3,
  goles_visitante: 1
}
```

**Actualización general:**
```javascript
{
  estado: "Finalizado",
  resumen: "Gran partido con victoria del equipo local"
}
```

---

### Estadísticas

#### GET /api/estadisticas
Obtiene estadísticas

**Query Parameters:**
- `partido_id` - Estadísticas de un partido
- `jugador_id` - Estadísticas de un jugador
- `tipo` - Tipo de ranking (goleadores/asistentes)
- `equipo_id` - Filtrar por equipo
- `limit` - Límite de resultados

**Ejemplos:**
```javascript
// Estadísticas de un partido
const stats = await fetch('/api/estadisticas?partido_id=1');

// Estadísticas de un jugador
const playerStats = await fetch('/api/estadisticas?jugador_id=5');

// Máximos goleadores
const goleadores = await fetch('/api/estadisticas?tipo=goleadores&limit=10');

// Máximos asistentes de un equipo
const asistentes = await fetch('/api/estadisticas?tipo=asistentes&equipo_id=1');
```

#### POST /api/estadisticas
Crea estadísticas para un partido

**Jugador individual:**
```javascript
{
  partido_id: 1,
  jugador_id: 5,
  titular: true,
  minutos_jugados: 90,
  goles: 2,
  asistencias: 1,
  tarjetas_amarillas: 1,
  valoracion: 8.5
}
```

**Múltiples jugadores:**
```javascript
[
  {
    partido_id: 1,
    jugador_id: 5,
    titular: true,
    minutos_jugados: 90,
    goles: 2
  },
  {
    partido_id: 1,
    jugador_id: 7,
    titular: true,
    minutos_jugados: 90,
    asistencias: 3
  }
]
```

#### PATCH /api/estadisticas/[id]
Actualiza estadísticas

```javascript
{
  goles: 3,
  asistencias: 2,
  valoracion: 9.0
}
```

---

### Equipos

#### GET /api/equipos
Obtiene equipos, categorías o posiciones

**Query Parameters:**
- `tipo=categorias` - Obtiene categorías
- `tipo=posiciones` - Obtiene posiciones
- `temporada_actual=true` - Equipos de temporada actual

**Ejemplos:**
```javascript
// Todos los equipos
const equipos = await fetch('/api/equipos');

// Categorías
const categorias = await fetch('/api/equipos?tipo=categorias');

// Posiciones
const posiciones = await fetch('/api/equipos?tipo=posiciones');

// Equipos temporada actual
const equiposActuales = await fetch('/api/equipos?temporada_actual=true');
```

---

## 💡 Ejemplos de Uso

### Crear un nuevo jugador

```typescript
import { createJugador } from '@/lib/data/jugadores';

const nuevoJugador = await createJugador({
  nombre: "Carlos",
  apellidos: "Martínez López",
  equipo_id: 1,
  posicion_id: 3,
  dorsal: 7,
  fecha_nacimiento: "1998-03-20",
  nacionalidad: "España",
  altura_cm: 180,
  peso_kg: 75,
  pie_preferido: "Derecho",
  email: "carlos@example.com",
  telefono: "612345678"
});
```

### Registrar resultado de un partido

```typescript
import { updateResultadoPartido } from '@/lib/data/partidos';
import { createEstadisticasPartido } from '@/lib/data/estadisticas';

// Actualizar resultado
await updateResultadoPartido(partidoId, 3, 1);

// Registrar estadísticas de jugadores
await createEstadisticasPartido([
  {
    partido_id: partidoId,
    jugador_id: 5,
    titular: true,
    minutos_jugados: 90,
    goles: 2,
    valoracion: 9.0
  },
  {
    partido_id: partidoId,
    jugador_id: 7,
    titular: true,
    minutos_jugados: 90,
    asistencias: 2,
    valoracion: 8.5
  }
]);
```

### Obtener tabla de goleadores

```typescript
import { getMaximosGoleadores } from '@/lib/data/estadisticas';

const goleadores = await getMaximosGoleadores(equipoId, 10);

goleadores.forEach((jugador, index) => {
  console.log(`${index + 1}. ${jugador.jugador} - ${jugador.goles_totales} goles`);
});
```

### Obtener estadísticas de un equipo

```typescript
import { getEstadisticasEquipo } from '@/lib/data/partidos';

const stats = await getEstadisticasEquipo(equipoId);

console.log(`Partidos jugados: ${stats.partidosJugados}`);
console.log(`Victorias: ${stats.victorias}`);
console.log(`Goles a favor: ${stats.golesAFavor}`);
console.log(`Puntos: ${stats.puntos}`);
```

---

## 📚 Tipos TypeScript

Todos los tipos están definidos en [types/database.ts](../website/types/database.ts)

### Tipos principales:
- `Jugador`, `JugadorInsert`, `JugadorUpdate`, `JugadorCompleto`
- `Partido`, `PartidoInsert`, `PartidoUpdate`, `PartidoCompleto`
- `EstadisticaPartido`, `EstadisticaPartidoInsert`, `EstadisticaPartidoUpdate`
- `Equipo`, `Categoria`, `Posicion`
- `EstadisticasJugador`

### Enums:
- `EstadoJugador`: 'Activo' | 'Lesionado' | 'Sancionado' | 'Inactivo'
- `EstadoPartido`: 'Programado' | 'En curso' | 'Finalizado' | 'Suspendido' | 'Cancelado'
- `UbicacionPartido`: 'Local' | 'Visitante'
- `TipoCompeticion`: 'Liga' | 'Copa' | 'Amistoso'
- `PiePreferido`: 'Derecho' | 'Izquierdo' | 'Ambidiestro'

---

## 🔒 Seguridad

El esquema incluye Row Level Security (RLS):

- **Lectura pública**: Todas las tablas permiten lectura sin autenticación
- **Escritura protegida**: Solo usuarios autenticados pueden crear/actualizar/eliminar

Para modificar las políticas de seguridad, edita el archivo `schema.sql` en la sección de RLS.

---

## 📝 Notas Importantes

1. **Dorsales únicos**: Un dorsal no puede repetirse en un mismo equipo
2. **Soft delete**: Los jugadores se marcan como inactivos en lugar de eliminarse
3. **Triggers**: Los campos `updated_at` se actualizan automáticamente
4. **Vistas**: Usa las vistas para obtener datos con relaciones pre-cargadas
5. **Índices**: Los índices están optimizados para las consultas más comunes

---

## 🛠️ Mantenimiento

### Crear equipos para nueva temporada

```typescript
import { crearEquiposTemporada } from '@/lib/data/equipos';

await crearEquiposTemporada('2025-2026');
```

### Verificar disponibilidad de dorsal

```typescript
import { isDorsalDisponible } from '@/lib/data/jugadores';

const disponible = await isDorsalDisponible(equipoId, 10);
if (disponible) {
  // Asignar dorsal
}
```

---

## 📞 Soporte

Para problemas o preguntas sobre el sistema, consulta el código fuente o revisa los comentarios en los archivos.
