'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Campo, inputClass, textareaClass } from '@/components/admin/ui';
import { guardarConfigCuotas, type SerieCuotas } from '@/app/(admin)/admin/cuotas/actions';

export default function ConfigCuotasDialog({ serie, onClose }: { serie: SerieCuotas; onClose: () => void }) {
  const [monto, setMonto] = useState(String(serie.cuota_monto || ''));
  const [datosPago, setDatosPago] = useState(serie.cuota_datos_pago ?? '');
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await guardarConfigCuotas(serie.equipo_id, { cuota_monto: Number(monto), cuota_datos_pago: datosPago });
      toast.success('Configuración guardada');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-azul-primario">Cuotas de {serie.nombre}</DialogTitle>
          <DialogDescription className="text-gray-600">Temporada {serie.temporada}</DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          <Campo label="Cuota mensual (CLP)" htmlFor="cuota-mensual" ayuda="Se usa al generar las cuotas de cada mes. Cambiarla no modifica las cuotas ya creadas.">
            <input
              id="cuota-mensual"
              type="number"
              min={0}
              step={1}
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="7000"
              className={inputClass}
            />
          </Campo>
          <Campo label="Datos para pagar" htmlFor="datos-pago" ayuda="Lo ven los jugadores en su link personal.">
            <textarea
              id="datos-pago"
              rows={6}
              value={datosPago}
              onChange={(e) => setDatosPago(e.target.value)}
              placeholder={'Banco Estado · Cuenta RUT\nN° 12345678\nRUT 12.345.678-9\nNombre del tesorero\nEnviar comprobante al +56 9 ...'}
              className={textareaClass}
            />
          </Campo>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
