'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Plus, RotateCcw, Users } from 'lucide-react';
import { MenuAcciones, Vacio } from '@/components/admin/ui';
import type { JugadorCompleto } from '@/types/database';
import { recorteDe } from '@/lib/contenido/foco';
import FotoRecorte from '@/components/ui/foto-recorte';
import { cn } from '@/lib/utils';
import EstadoJugadorBadge from './EstadoJugadorBadge';

interface Props {
  jugadores: JugadorCompleto[];
  loading: boolean;
  /** Hay texto de búsqueda o serie elegida: cambia el mensaje de lista vacía */
  hayFiltro: boolean;
  onView: (jugador: JugadorCompleto) => void;
  onEdit: (jugador: JugadorCompleto) => void;
  onDelete: (jugador: JugadorCompleto) => void;
  onCreate: () => void;
  /** Vista que se muestra: los inactivos se reactivan o se eliminan de forma definitiva */
  modo: 'activos' | 'inactivos';
  onReactivar: (jugador: JugadorCompleto) => void;
  /** Ids marcados para una acción masiva */
  seleccion: Set<number>;
  onToggle: (id: number) => void;
  onToggleTodos: () => void;
}

function Casilla({
  marcada,
  indeterminada,
  etiqueta,
  onChange,
}: {
  marcada: boolean;
  indeterminada?: boolean;
  etiqueta: string;
  onChange: () => void;
}) {
  return (
    <input
      type="checkbox"
      checked={marcada}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(indeterminada);
      }}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      aria-label={etiqueta}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-azul-primario"
    />
  );
}

function Avatar({ jugador, className, sizes }: { jugador: JugadorCompleto; className: string; sizes: string }) {
  if (!jugador.foto_url) {
    const iniciales = `${jugador.nombre?.[0] ?? ''}${jugador.apellidos?.[0] ?? ''}`;
    return (
      <span
        aria-hidden
        className={cn('flex items-center justify-center rounded-full bg-azul-pastel/50 text-xs font-semibold text-azul-primario', className)}
      >
        {iniciales}
      </span>
    );
  }
  return (
    <span className={cn('relative block overflow-hidden rounded-full border-2 border-azul-primario/20', className)}>
      <FotoRecorte
        url={jugador.foto_url}
        alt={jugador.nombre_completo}
        recorte={recorteDe(jugador.foto_cara_x, jugador.foto_cara_y, jugador.foto_cara_ancho)}
        sizes={sizes}
      />
    </span>
  );
}

function Posiciones({ jugador }: { jugador: JugadorCompleto }) {
  const abreviaturas = (jugador.posiciones_abr?.length ? jugador.posiciones_abr : [jugador.posicion_abr]).filter(
    (abr): abr is string => Boolean(abr)
  );
  if (abreviaturas.length === 0) {
    return <span className="text-xs text-gray-400">Por definir</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {abreviaturas.map((abr, i) => (
        <span
          key={abr}
          title={i === 0 ? 'Posición principal' : undefined}
          className={cn(
            'rounded px-2 py-0.5 text-xs',
            i === 0 ? 'bg-azul-primario/10 font-semibold text-azul-primario' : 'bg-gray-100 text-gray-700'
          )}
        >
          {abr}
        </span>
      ))}
    </span>
  );
}

function Esqueleto() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Cargando plantel</span>
      <ul className="space-y-3 md:hidden" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-gray-100 px-4 py-4 last:border-0">
            <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
            <div className="flex flex-1 items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JugadoresTable({
  jugadores,
  loading,
  hayFiltro,
  onView,
  onEdit,
  onDelete,
  onCreate,
  modo,
  onReactivar,
  seleccion,
  onToggle,
  onToggleTodos,
}: Props) {
  const marcados = jugadores.filter((j) => seleccion.has(j.id)).length;
  const inactivos = modo === 'inactivos';

  if (loading) {
    return <Esqueleto />;
  }

  if (jugadores.length === 0) {
    return hayFiltro ? (
      <Vacio
        icono={Users}
        titulo="Ningún jugador coincide"
        descripcion="Revisa el texto de la búsqueda o cambia la serie."
      />
    ) : inactivos ? (
      <Vacio
        icono={Users}
        titulo="No hay jugadores inactivos"
        descripcion="Los jugadores dados de baja aparecen aquí, donde puedes reactivarlos o eliminarlos."
      />
    ) : (
      <Vacio
        icono={Users}
        titulo="Aún no hay jugadores"
        descripcion="Agrega el primero o importa el plantel desde un CSV."
        accion={
          <Button onClick={onCreate}>
            <Plus /> Nuevo jugador
          </Button>
        }
      />
    );
  }

  return (
    <>
      {/* Celular: lista de tarjetas */}
      <ul className="space-y-3 md:hidden">
        {jugadores.map((jugador) => (
          <li key={jugador.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <Casilla
              marcada={seleccion.has(jugador.id)}
              etiqueta={`Seleccionar a ${jugador.nombre_completo}`}
              onChange={() => onToggle(jugador.id)}
            />
            <button
              type="button"
              onClick={() => onView(jugador)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-primario"
            >
              <span className="w-7 shrink-0 text-center font-mono text-lg font-bold text-azul-primario">
                {jugador.dorsal ?? '-'}
              </span>
              <Avatar jugador={jugador} className="h-12 w-12 shrink-0" sizes="48px" />
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block truncate font-medium text-gray-900">{jugador.nombre_completo}</span>
                <Posiciones jugador={jugador} />
                <span className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  {jugador.categoria && <span>Serie {jugador.categoria}</span>}
                  <EstadoJugadorBadge estado={jugador.estado} />
                </span>
              </span>
            </button>
            <MenuAcciones
              etiqueta={`Acciones de ${jugador.nombre_completo}`}
              acciones={[
                { etiqueta: 'Ver ficha', icono: Eye, onSelect: () => onView(jugador) },
                { etiqueta: 'Editar', icono: Edit, onSelect: () => onEdit(jugador) },
                ...(inactivos ? [{ etiqueta: 'Reactivar', icono: RotateCcw, onSelect: () => onReactivar(jugador) }] : []),
                {
                  etiqueta: inactivos ? 'Eliminar definitivamente' : 'Eliminar',
                  icono: Trash2,
                  peligro: true,
                  onSelect: () => onDelete(jugador),
                },
              ]}
            />
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-10">
                <Casilla
                  marcada={marcados > 0 && marcados === jugadores.length}
                  indeterminada={marcados > 0 && marcados < jugadores.length}
                  etiqueta="Seleccionar todos los jugadores de la lista"
                  onChange={onToggleTodos}
                />
              </TableHead>
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead>Jugador</TableHead>
              <TableHead>Posición</TableHead>
              <TableHead>Serie</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-40 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jugadores.map((jugador) => (
              <TableRow key={jugador.id} className="cursor-pointer hover:bg-azul-claro/5" onClick={() => onView(jugador)}>
                <TableCell className="w-10">
                  <Casilla
                    marcada={seleccion.has(jugador.id)}
                    etiqueta={`Seleccionar a ${jugador.nombre_completo}`}
                    onChange={() => onToggle(jugador.id)}
                  />
                </TableCell>
                <TableCell className="text-center font-mono text-base font-bold text-azul-primario">
                  {jugador.dorsal ?? '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar jugador={jugador} className="h-10 w-10 shrink-0" sizes="40px" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(jugador);
                      }}
                      className="rounded text-left font-medium text-gray-900 hover:text-azul-primario hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-primario"
                    >
                      {jugador.nombre_completo}
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <Posiciones jugador={jugador} />
                </TableCell>
                <TableCell className="text-sm text-gray-600">{jugador.categoria ? `Serie ${jugador.categoria}` : '-'}</TableCell>
                <TableCell>
                  <EstadoJugadorBadge estado={jugador.estado} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Ver ficha de ${jugador.nombre_completo}`}
                      title="Ver ficha completa"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(jugador);
                      }}
                    >
                      <Eye className="h-4 w-4 text-azul-primario" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Editar a ${jugador.nombre_completo}`}
                      title="Editar jugador"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(jugador);
                      }}
                    >
                      <Edit className="h-4 w-4 text-gray-700" />
                    </Button>
                    {inactivos && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Reactivar a ${jugador.nombre_completo}`}
                        title="Reactivar jugador"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReactivar(jugador);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 text-green-700" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${inactivos ? 'Eliminar definitivamente a' : 'Eliminar a'} ${jugador.nombre_completo}`}
                      title={inactivos ? 'Eliminar definitivamente' : 'Eliminar jugador'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(jugador);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
