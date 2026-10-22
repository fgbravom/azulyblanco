'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2, Eye } from 'lucide-react';
import { MenuAcciones } from '@/components/admin/ui';
import type { JugadorCompleto } from '@/types/database';
import { recorteDe } from '@/lib/contenido/foco';
import FotoRecorte from '@/components/ui/foto-recorte';

interface Props {
  jugadores: JugadorCompleto[];
  loading: boolean;
  onView: (jugador: JugadorCompleto) => void;
  onEdit: (jugador: JugadorCompleto) => void;
  onDelete: (id: number) => void;
}

function Posiciones({ jugador }: { jugador: JugadorCompleto }) {
  return (
    <div className="flex flex-wrap gap-1">
      {!jugador.posiciones_abr?.length && !jugador.posicion_abr && (
        <span className="text-xs text-gray-400">Por definir</span>
      )}
      {(jugador.posiciones_abr?.length ? jugador.posiciones_abr : [jugador.posicion_abr]).filter(Boolean).map((abr, i) => (
        <span
          key={abr}
          title={i === 0 ? 'Posición principal' : undefined}
          className={i === 0 ? 'text-xs bg-azul-primario/10 text-azul-primario font-semibold px-2 py-1 rounded' : 'text-xs bg-gray-100 px-2 py-1 rounded'}
        >
          {abr}
        </span>
      ))}
    </div>
  );
}

export default function JugadoresTable({ jugadores, loading, onView, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-azul-primario" />
      </div>
    );
  }

  if (jugadores.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-muted-foreground">No hay jugadores registrados</p>
        <p className="text-sm text-muted-foreground mt-2">
          Haz clic en «Nuevo jugador» para agregar el primero
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Celular: lista de tarjetas */}
      <ul className="space-y-3 md:hidden">
        {jugadores.map((jugador) => (
          <li
            key={jugador.id}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <button
              type="button"
              onClick={() => onView(jugador)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              {jugador.foto_url ? (
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-azul-primario/20">
                  <FotoRecorte
                    url={jugador.foto_url}
                    alt={jugador.nombre_completo}
                    recorte={recorteDe(jugador.foto_cara_x, jugador.foto_cara_y, jugador.foto_cara_ancho)}
                    sizes="48px"
                  />
                </span>
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 font-mono font-bold text-gray-700">
                  {jugador.dorsal || '-'}
                </span>
              )}
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block truncate font-medium text-gray-900">{jugador.nombre_completo}</span>
                <Posiciones jugador={jugador} />
                <span className="flex flex-wrap items-center gap-2">
                  {jugador.categoria && <span className="text-xs text-gray-500">{jugador.categoria}</span>}
                  <Badge variant={jugador.estado === 'Activo' ? 'default' : 'secondary'}>{jugador.estado}</Badge>
                </span>
              </span>
            </button>
            <MenuAcciones
              etiqueta={`Acciones de ${jugador.nombre_completo}`}
              acciones={[
                { etiqueta: 'Ver ficha', icono: Eye, onSelect: () => onView(jugador) },
                { etiqueta: 'Editar', icono: Edit, onSelect: () => onEdit(jugador) },
                { etiqueta: 'Eliminar', icono: Trash2, peligro: true, onSelect: () => onDelete(jugador.id) },
              ]}
            />
          </li>
        ))}
      </ul>

    <div className="hidden bg-white rounded-lg border md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Foto</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Posición</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jugadores.map((jugador) => (
            <TableRow
              key={jugador.id}
              className="cursor-pointer hover:bg-azul-claro/5"
              onClick={() => onView(jugador)}
            >
              <TableCell className="text-center">
                {jugador.foto_url ? (
                  <span className="relative mx-auto block h-10 w-10 overflow-hidden rounded-full border-2 border-azul-primario/20">
                    <FotoRecorte
                      url={jugador.foto_url}
                      alt={jugador.nombre_completo}
                      recorte={recorteDe(jugador.foto_cara_x, jugador.foto_cara_y, jugador.foto_cara_ancho)}
                      sizes="40px"
                    />
                  </span>
                ) : (
                  <span className="font-mono font-bold">{jugador.dorsal || '-'}</span>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {jugador.nombre_completo}
              </TableCell>
              <TableCell>
                <Posiciones jugador={jugador} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {jugador.categoria}
              </TableCell>
              <TableCell>
                <Badge
                  variant={jugador.estado === 'Activo' ? 'default' : 'secondary'}
                >
                  {jugador.estado}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(jugador);
                  }}
                  title="Ver ficha completa"
                >
                  <Eye className="h-4 w-4 text-azul-primario" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(jugador);
                  }}
                  title="Editar jugador"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(jugador.id);
                  }}
                  title="Eliminar jugador"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
