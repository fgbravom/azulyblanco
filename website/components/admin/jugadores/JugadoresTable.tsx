'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2, Eye } from 'lucide-react';
import type { JugadorCompleto } from '@/types/database';

interface Props {
  jugadores: JugadorCompleto[];
  loading: boolean;
  onView: (jugador: JugadorCompleto) => void;
  onEdit: (jugador: JugadorCompleto) => void;
  onDelete: (id: number) => void;
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
          Haz clic en "Nuevo Jugador" para agregar el primero
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Dorsal</TableHead>
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
              <TableCell className="font-mono font-bold text-center">
                {jugador.dorsal || '-'}
              </TableCell>
              <TableCell className="font-medium">
                {jugador.nombre_completo}
              </TableCell>
              <TableCell>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {jugador.posicion_abr}
                </span>
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
  );
}
