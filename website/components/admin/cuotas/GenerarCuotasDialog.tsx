'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Campo, inputClass } from '@/components/admin/ui';
import { formatoCLP, nombreMes, periodoDe } from '@/lib/cuotas/tipos';
import { generarCuotas, type SerieCuotas } from '@/app/(admin)/admin/cuotas/actions';

export default function GenerarCuotasDialog({ serie, onClose }: { serie: SerieCuotas; onClose: () => void }) {
  const [mes, setMes] = useState(periodoDe().slice(0, 7));
  const [generando, setGenerando] = useState(false);

  const generar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerando(true);
    try {
      const creadas = await generarCuotas(serie.equipo_id, `${mes}-01`);
      toast.success(
        creadas
          ? `${creadas} cuota${creadas === 1 ? '' : 's'} creada${creadas === 1 ? '' : 's'} para ${nombreMes(`${mes}-01`).toLowerCase()}`
          : 'Todos los jugadores activos ya tenían la cuota de ese mes'
      );
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron generar');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-azul-primario">Generar cuotas del mes</DialogTitle>
          <DialogDescription className="text-gray-600">
            Crea una cuota de {formatoCLP(serie.cuota_monto)} para cada jugador activo de {serie.nombre} que aún no la tenga.
            Refuerzos, becados y lesionados quedan exentos; lo puedes cambiar después en cada celda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={generar} className="space-y-4">
          <Campo label="Mes" htmlFor="mes-generar">
            <input id="mes-generar" type="month" required value={mes} onChange={(e) => setMes(e.target.value)} className={inputClass} />
          </Campo>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={generando}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={generando || !mes}>
              {generando ? 'Generando…' : 'Generar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
