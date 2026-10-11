'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import JugadoresTable from '@/components/admin/jugadores/JugadoresTable';
import JugadorForm from '@/components/admin/jugadores/JugadorForm';
import JugadorFicha from '@/components/admin/jugadores/JugadorFicha';
import type { JugadorCompleto } from '@/types/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/ui';

export default function JugadoresPage() {
  const [jugadores, setJugadores] = useState<JugadorCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fichaOpen, setFichaOpen] = useState(false);
  const [editingJugador, setEditingJugador] = useState<JugadorCompleto | null>(null);
  const [viewingJugador, setViewingJugador] = useState<JugadorCompleto | null>(null);
  const [serie, setSerie] = useState('Todas');

  const series = useMemo(
    () => ['Todas', ...Array.from(new Set(jugadores.map((j) => j.categoria).filter(Boolean)))],
    [jugadores]
  );
  const visibles = serie === 'Todas' ? jugadores : jugadores.filter((j) => j.categoria === serie);

  // Cargar jugadores
  useEffect(() => {
    fetchJugadores();
  }, []);

  const fetchJugadores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jugadores?activo=true');
      if (!res.ok) throw new Error('Error al cargar jugadores');

      const data = await res.json();
      setJugadores(data.data || []);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      toast.error('Error al cargar jugadores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingJugador(null);
    setDialogOpen(true);
  };

  const handleView = (jugador: JugadorCompleto) => {
    setViewingJugador(jugador);
    setFichaOpen(true);
  };

  const handleEdit = (jugador: JugadorCompleto) => {
    setEditingJugador(jugador);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    await fetchJugadores(); // Recargar lista
    setDialogOpen(false);
    setEditingJugador(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este jugador?')) {
      return;
    }

    try {
      const res = await fetch(`/api/jugadores/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Error al eliminar jugador');

      toast.success('Jugador eliminado exitosamente');
      await fetchJugadores();
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      toast.error('Error al eliminar jugador');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Plantel"
        descripcion="Ficha completa de los jugadores de cada serie. La foto, el dorsal y la posición se muestran en la página de la serie."
        acciones={
          <Button onClick={handleCreate}>
            <Plus /> Nuevo jugador
          </Button>
        }
      />

      {series.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {series.map((s) => (
            <button
              key={s}
              onClick={() => setSerie(s)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                serie === s ? 'border-azul-primario bg-azul-primario text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-azul-claro'
              )}
            >
              {s === 'Todas' ? 'Todas las series' : `Serie ${s}`}
              <span className="ml-1 opacity-70">
                ({s === 'Todas' ? jugadores.length : jugadores.filter((j) => j.categoria === s).length})
              </span>
            </button>
          ))}
        </div>
      )}

      <JugadoresTable
        jugadores={visibles}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de ficha completa */}
      <JugadorFicha
        jugador={viewingJugador}
        open={fichaOpen}
        onClose={() => {
          setFichaOpen(false);
          setViewingJugador(null);
        }}
      />

      {/* Modal de formulario */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-azul-primario">
              {editingJugador ? 'Editar Jugador' : 'Nuevo Jugador'}
            </DialogTitle>
          </DialogHeader>
          <JugadorForm
            jugador={editingJugador}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
