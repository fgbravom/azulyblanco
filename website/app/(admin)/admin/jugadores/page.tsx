'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import JugadoresTable from '@/components/admin/jugadores/JugadoresTable';
import JugadorForm from '@/components/admin/jugadores/JugadorForm';
import JugadorFicha from '@/components/admin/jugadores/JugadorFicha';
import type { JugadorCompleto } from '@/types/database';
import { toast } from 'sonner';

export default function JugadoresPage() {
  const [jugadores, setJugadores] = useState<JugadorCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fichaOpen, setFichaOpen] = useState(false);
  const [editingJugador, setEditingJugador] = useState<JugadorCompleto | null>(null);
  const [viewingJugador, setViewingJugador] = useState<JugadorCompleto | null>(null);

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
    toast.success(editingJugador ? 'Jugador actualizado exitosamente' : 'Jugador creado exitosamente');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-azul-primario">Gestión de Jugadores</h1>
          <p className="text-gray-600 mt-2">
            Administra la ficha completa de todos los jugadores del club
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-azul-primario hover:bg-azul-oscuro">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Jugador
        </Button>
      </div>

      <JugadoresTable
        jugadores={jugadores}
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
