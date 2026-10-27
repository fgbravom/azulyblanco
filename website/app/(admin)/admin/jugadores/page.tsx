'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileDown, FileUp, Plus, Search } from 'lucide-react';
import JugadoresTable from '@/components/admin/jugadores/JugadoresTable';
import JugadorForm from '@/components/admin/jugadores/JugadorForm';
import JugadorFicha from '@/components/admin/jugadores/JugadorFicha';
import ImportarJugadoresDialog from '@/components/admin/jugadores/ImportarJugadoresDialog';
import EliminarJugadorDialog from '@/components/admin/jugadores/EliminarJugadorDialog';
import { jugadoresACsv } from '@/lib/jugadores/exportar-csv';
import type { JugadorCompleto } from '@/types/database';
import { toast } from 'sonner';
import { FiltroChips, PageHeader, inputClass } from '@/components/admin/ui';

// Sin tildes ni mayúsculas, para que "perez" encuentre "Pérez"
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

export default function JugadoresPage() {
  const [jugadores, setJugadores] = useState<JugadorCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fichaOpen, setFichaOpen] = useState(false);
  const [importarOpen, setImportarOpen] = useState(false);
  const [editingJugador, setEditingJugador] = useState<JugadorCompleto | null>(null);
  const [viewingJugador, setViewingJugador] = useState<JugadorCompleto | null>(null);
  const [aEliminar, setAEliminar] = useState<JugadorCompleto | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [serie, setSerie] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  const series = useMemo(
    () => ['Todas', ...Array.from(new Set(jugadores.map((j) => j.categoria).filter(Boolean)))],
    [jugadores]
  );

  const termino = normalizar(busqueda);
  const visibles = jugadores
    .filter((j) => serie === 'Todas' || j.categoria === serie)
    .filter(
      (j) =>
        !termino ||
        normalizar(j.nombre_completo).includes(termino) ||
        (j.dorsal != null && String(j.dorsal) === termino)
    );
  const hayFiltro = serie !== 'Todas' || termino !== '';

  // Cargar jugadores
  useEffect(() => {
    fetchJugadores();
  }, []);

  const fetchJugadores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jugadores?activo=true&pageSize=1000');
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

  // Exporta lo que se está viendo: todo el plantel o solo la serie filtrada
  const exportarCsv = () => {
    const blob = new Blob([jugadoresACsv(visibles)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantel-${serie === 'Todas' ? 'completo' : `serie-${serie}`}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreate = () => {
    setEditingJugador(null);
    setDialogOpen(true);
  };

  const handleView = (jugador: JugadorCompleto) => {
    setViewingJugador(jugador);
    setFichaOpen(true);
  };

  const cerrarFicha = () => {
    setFichaOpen(false);
    setViewingJugador(null);
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

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);

    try {
      const res = await fetch(`/api/jugadores/${aEliminar.id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Error al eliminar jugador');

      toast.success('Jugador eliminado exitosamente');
      setAEliminar(null);
      await fetchJugadores();
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      toast.error('No se pudo eliminar al jugador. Inténtalo de nuevo.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Plantel"
        descripcion="Ficha completa de los jugadores de cada serie. La foto, el dorsal y la posición se muestran en la página de la serie."
        acciones={
          <>
            <Button variant="outline" onClick={() => setImportarOpen(true)}>
              <FileUp /> Importar CSV
            </Button>
            <Button variant="outline" onClick={exportarCsv} disabled={loading || visibles.length === 0}>
              <FileDown /> Exportar CSV
            </Button>
            <Button onClick={handleCreate}>
              <Plus /> Nuevo jugador
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72 sm:shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o dorsal"
            aria-label="Buscar jugador por nombre o dorsal"
            className={`${inputClass} pl-9`}
          />
        </div>

        {series.length > 2 && (
          <div className="min-w-0 flex-1">
            <FiltroChips
              etiqueta="Filtrar por serie"
              valor={serie}
              onChange={setSerie}
              opciones={series.map((s) => ({
                valor: s,
                etiqueta: s === 'Todas' ? 'Todas las series' : `Serie ${s}`,
                cantidad: s === 'Todas' ? jugadores.length : jugadores.filter((j) => j.categoria === s).length,
              }))}
            />
          </div>
        )}
      </div>

      <JugadoresTable
        jugadores={visibles}
        loading={loading}
        hayFiltro={hayFiltro}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={setAEliminar}
        onCreate={handleCreate}
      />

      {/* Modal de ficha completa */}
      <JugadorFicha
        jugador={viewingJugador}
        open={fichaOpen}
        onClose={cerrarFicha}
        onEditar={(jugador) => {
          cerrarFicha();
          handleEdit(jugador);
        }}
        onEliminar={(jugador) => {
          cerrarFicha();
          setAEliminar(jugador);
        }}
      />

      <EliminarJugadorDialog
        jugador={aEliminar}
        eliminando={eliminando}
        onCancelar={() => setAEliminar(null)}
        onConfirmar={confirmarEliminar}
      />

      <ImportarJugadoresDialog open={importarOpen} onOpenChange={setImportarOpen} onImportado={fetchJugadores} />

      {/* Modal de formulario */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-azul-primario">
              {editingJugador ? 'Editar jugador' : 'Nuevo jugador'}
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
