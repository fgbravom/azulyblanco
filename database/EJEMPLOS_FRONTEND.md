# Ejemplos de Uso desde el Frontend

Este documento muestra cómo usar el sistema de gestión desde componentes React/Next.js.

## 📋 Tabla de Contenidos

1. [Componentes de Ejemplo](#componentes-de-ejemplo)
2. [Hooks Personalizados](#hooks-personalizados)
3. [Formularios](#formularios)
4. [Visualización de Datos](#visualización-de-datos)

---

## 🧩 Componentes de Ejemplo

### 1. Lista de Jugadores

```typescript
// app/admin/jugadores/page.tsx
'use client';

import { useEffect, useState } from 'react';
import type { JugadorCompleto } from '@/types/database';

export default function JugadoresPage() {
  const [jugadores, setJugadores] = useState<JugadorCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipoId, setEquipoId] = useState<number | null>(null);

  useEffect(() => {
    async function cargarJugadores() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (equipoId) params.append('equipo_id', equipoId.toString());
        params.append('activo', 'true');

        const response = await fetch(`/api/jugadores?${params}`);
        const { data } = await response.json();
        setJugadores(data);
      } catch (error) {
        console.error('Error al cargar jugadores:', error);
      } finally {
        setLoading(false);
      }
    }

    cargarJugadores();
  }, [equipoId]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Jugadores</h1>

      {/* Filtro por equipo */}
      <select
        value={equipoId || ''}
        onChange={(e) => setEquipoId(e.target.value ? Number(e.target.value) : null)}
        className="mb-4 p-2 border rounded"
      >
        <option value="">Todos los equipos</option>
        <option value="1">Primera</option>
        <option value="2">Honor</option>
        <option value="3">35</option>
      </select>

      {/* Lista de jugadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jugadores.map((jugador) => (
          <div key={jugador.id} className="border rounded-lg p-4 shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold">
                {jugador.dorsal}
              </div>
              <div>
                <h3 className="font-bold">{jugador.nombre_completo}</h3>
                <p className="text-sm text-gray-600">{jugador.posicion}</p>
                <p className="text-xs text-gray-500">{jugador.equipo}</p>
              </div>
            </div>
            {jugador.edad && (
              <p className="mt-2 text-sm">Edad: {jugador.edad} años</p>
            )}
            <span
              className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                jugador.estado === 'Activo'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {jugador.estado}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Próximos Partidos

```typescript
// components/ProximosPartidos.tsx
'use client';

import { useEffect, useState } from 'react';
import type { PartidoCompleto } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProximosPartidos({ equipoId }: { equipoId?: number }) {
  const [partidos, setPartidos] = useState<PartidoCompleto[]>([]);

  useEffect(() => {
    async function cargarPartidos() {
      const params = new URLSearchParams({
        estado: 'Programado',
        sort_campo: 'fecha',
        sort_orden: 'asc',
        pageSize: '5',
      });

      if (equipoId) params.append('equipo_id', equipoId.toString());

      const response = await fetch(`/api/partidos?${params}`);
      const { data } = await response.json();
      setPartidos(data);
    }

    cargarPartidos();
  }, [equipoId]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Próximos Partidos</h2>

      <div className="space-y-4">
        {partidos.map((partido) => (
          <div key={partido.id} className="border-l-4 border-blue-500 pl-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">
                  {format(new Date(partido.fecha), "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="font-bold mt-1">
                  {partido.equipo_local} vs {partido.equipo_visitante}
                </p>
                <p className="text-sm text-gray-600">
                  {partido.competicion} - Jornada {partido.jornada}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{partido.hora}</p>
                <p className="text-xs text-gray-500">{partido.estadio}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Tabla de Goleadores

```typescript
// components/TablaGoleadores.tsx
'use client';

import { useEffect, useState } from 'react';
import type { EstadisticasJugador } from '@/types/database';

export default function TablaGoleadores({ equipoId }: { equipoId?: number }) {
  const [goleadores, setGoleadores] = useState<EstadisticasJugador[]>([]);

  useEffect(() => {
    async function cargarGoleadores() {
      const params = new URLSearchParams({
        tipo: 'goleadores',
        limit: '10',
      });

      if (equipoId) params.append('equipo_id', equipoId.toString());

      const response = await fetch(`/api/estadisticas?${params}`);
      const { data } = await response.json();
      setGoleadores(data);
    }

    cargarGoleadores();
  }, [equipoId]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
        <h2 className="text-2xl font-bold text-white">Máximos Goleadores</h2>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Jugador</th>
            <th className="px-4 py-2 text-center">Partidos</th>
            <th className="px-4 py-2 text-center">Goles</th>
            <th className="px-4 py-2 text-center">Asist.</th>
          </tr>
        </thead>
        <tbody>
          {goleadores.map((jugador, index) => (
            <tr key={jugador.jugador_id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 font-bold text-gray-600">{index + 1}</td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-semibold">{jugador.jugador}</p>
                  <p className="text-xs text-gray-500">{jugador.equipo}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-center">{jugador.partidos_jugados}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                  {jugador.goles_totales}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-gray-600">
                {jugador.asistencias_totales}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🎣 Hooks Personalizados

### useJugadores

```typescript
// hooks/useJugadores.ts
import { useState, useEffect } from 'react';
import type { JugadorCompleto, JugadoresFilter } from '@/types/database';

export function useJugadores(filter?: JugadoresFilter) {
  const [jugadores, setJugadores] = useState<JugadorCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJugadores() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filter?.equipo_id) params.append('equipo_id', filter.equipo_id.toString());
        if (filter?.posicion_id) params.append('posicion_id', filter.posicion_id.toString());
        if (filter?.estado) params.append('estado', filter.estado);
        if (filter?.activo !== undefined) params.append('activo', filter.activo.toString());
        if (filter?.busqueda) params.append('busqueda', filter.busqueda);

        const response = await fetch(`/api/jugadores?${params}`);
        if (!response.ok) throw new Error('Error al cargar jugadores');

        const { data } = await response.json();
        setJugadores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchJugadores();
  }, [filter]);

  return { jugadores, loading, error };
}
```

### usePartidos

```typescript
// hooks/usePartidos.ts
import { useState, useEffect } from 'react';
import type { PartidoCompleto, PartidosFilter } from '@/types/database';

export function usePartidos(filter?: PartidosFilter) {
  const [partidos, setPartidos] = useState<PartidoCompleto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartidos() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter?.equipo_id) params.append('equipo_id', filter.equipo_id.toString());
        if (filter?.estado) params.append('estado', filter.estado);
        if (filter?.competicion) params.append('competicion', filter.competicion);

        const response = await fetch(`/api/partidos?${params}`);
        const { data } = await response.json();
        setPartidos(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPartidos();
  }, [filter]);

  return { partidos, loading };
}
```

### useEstadisticas

```typescript
// hooks/useEstadisticas.ts
import { useState, useEffect } from 'react';
import type { EstadisticasJugador } from '@/types/database';

export function useEstadisticas(tipo: 'goleadores' | 'asistentes', equipoId?: number) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasJugador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEstadisticas() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ tipo, limit: '10' });
        if (equipoId) params.append('equipo_id', equipoId.toString());

        const response = await fetch(`/api/estadisticas?${params}`);
        const { data } = await response.json();
        setEstadisticas(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEstadisticas();
  }, [tipo, equipoId]);

  return { estadisticas, loading };
}
```

---

## 📝 Formularios

### Formulario de Nuevo Jugador

```typescript
// components/FormularioJugador.tsx
'use client';

import { useState } from 'react';
import type { JugadorInsert } from '@/types/database';

export default function FormularioJugador({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<Partial<JugadorInsert>>({
    nacionalidad: 'España',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/jugadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al crear jugador');

      const { data } = await response.json();
      console.log('Jugador creado:', data);
      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear jugador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            required
            value={formData.nombre || ''}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Apellidos *</label>
          <input
            type="text"
            required
            value={formData.apellidos || ''}
            onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dorsal</label>
          <input
            type="number"
            min="1"
            max="99"
            value={formData.dorsal || ''}
            onChange={(e) => setFormData({ ...formData, dorsal: Number(e.target.value) })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
          <input
            type="date"
            value={formData.fecha_nacimiento || ''}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            value={formData.telefono || ''}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear Jugador'}
      </button>
    </form>
  );
}
```

### Formulario de Nuevo Partido

```typescript
// components/FormularioPartido.tsx
'use client';

import { useState } from 'react';
import type { PartidoInsert } from '@/types/database';

export default function FormularioPartido({ equipoId }: { equipoId: number }) {
  const [formData, setFormData] = useState<Partial<PartidoInsert>>({
    equipo_id: equipoId,
    ubicacion: 'Local',
    estado: 'Programado',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/partidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al crear partido');

      alert('Partido creado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear partido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha *</label>
          <input
            type="date"
            required
            value={formData.fecha?.split('T')[0] || ''}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hora</label>
          <input
            type="time"
            value={formData.hora || ''}
            onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Equipo Local *</label>
          <input
            type="text"
            required
            value={formData.equipo_local || ''}
            onChange={(e) => setFormData({ ...formData, equipo_local: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Equipo Visitante *</label>
          <input
            type="text"
            required
            value={formData.equipo_visitante || ''}
            onChange={(e) => setFormData({ ...formData, equipo_visitante: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Competición</label>
          <select
            value={formData.competicion || ''}
            onChange={(e) => setFormData({ ...formData, competicion: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccionar...</option>
            <option value="Liga">Liga</option>
            <option value="Copa">Copa</option>
            <option value="Amistoso">Amistoso</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estadio</label>
          <input
            type="text"
            value={formData.estadio || ''}
            onChange={(e) => setFormData({ ...formData, estadio: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Creando...' : 'Crear Partido'}
      </button>
    </form>
  );
}
```

---

## 📊 Visualización de Datos

### Estadísticas de Equipo

```typescript
// components/EstadisticasEquipo.tsx
'use client';

import { useEffect, useState } from 'react';

interface EstadisticasEquipo {
  partidosJugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  puntos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
}

export default function EstadisticasEquipo({ equipoId }: { equipoId: number }) {
  const [stats, setStats] = useState<EstadisticasEquipo | null>(null);

  useEffect(() => {
    // Implementar llamada a la función getEstadisticasEquipo
    // desde lib/data/partidos.ts
  }, [equipoId]);

  if (!stats) return <div>Cargando...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Partidos" value={stats.partidosJugados} />
      <StatCard label="Victorias" value={stats.victorias} color="green" />
      <StatCard label="Empates" value={stats.empates} color="yellow" />
      <StatCard label="Derrotas" value={stats.derrotas} color="red" />
      <StatCard label="Puntos" value={stats.puntos} color="blue" />
      <StatCard label="Goles a Favor" value={stats.golesAFavor} />
      <StatCard label="Goles en Contra" value={stats.golesEnContra} />
      <StatCard label="Diferencia" value={stats.diferenciaGoles} />
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'gray',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
    </div>
  );
}
```

---

## 🎯 Mejores Prácticas

1. **Siempre valida los datos** antes de enviarlos a la API
2. **Maneja errores** apropiadamente y muestra mensajes al usuario
3. **Usa loading states** para mejorar la UX
4. **Implementa debouncing** en búsquedas
5. **Cachea datos** cuando sea apropiado
6. **Usa TypeScript** para type safety

---

Este documento proporciona ejemplos básicos. Puedes extenderlos según tus necesidades específicas.
