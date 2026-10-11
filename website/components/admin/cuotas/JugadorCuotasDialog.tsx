'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, ExternalLink, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Campo, inputClass } from '@/components/admin/ui';
import { CONDICIONES, formatoCLP, type CondicionCuota } from '@/lib/cuotas/tipos';
import {
  guardarCondicion,
  regenerarCodigo,
  type JugadorCuotas,
  type SerieCuotas,
} from '@/app/(admin)/admin/cuotas/actions';

/** Número para wa.me: solo dígitos, con 56 delante si es un celular chileno de 9 dígitos */
function numeroWhatsApp(telefono: string | null) {
  const digitos = (telefono ?? '').replace(/\D/g, '');
  if (digitos.length === 9 && digitos.startsWith('9')) return `56${digitos}`;
  return digitos.length >= 10 ? digitos : '';
}

export default function JugadorCuotasDialog({
  jugador,
  serie,
  deuda,
  onClose,
}: {
  jugador: JugadorCuotas;
  serie: SerieCuotas;
  deuda: number;
  onClose: () => void;
}) {
  const [condicion, setCondicion] = useState(jugador.cuota_condicion);
  const [ocupado, setOcupado] = useState(false);

  const link = `${window.location.origin}/cuotas/${jugador.codigo_cuotas}`;
  const mensaje = [
    `Hola ${jugador.nombre_completo.split(' ')[0]}, este es tu estado de cuotas de ${serie.nombre} en Azul y Blanco:`,
    link,
    deuda > 0 ? `Saldo pendiente: ${formatoCLP(deuda)}.` : '¡Estás al día!',
  ].join('\n');
  const whatsapp = `https://wa.me/${numeroWhatsApp(jugador.telefono)}?text=${encodeURIComponent(mensaje)}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado');
    } catch {
      toast.error('No se pudo copiar; selecciónalo a mano');
    }
  };

  const cambiarCondicion = async (valor: CondicionCuota) => {
    setCondicion(valor);
    setOcupado(true);
    try {
      await guardarCondicion(jugador.id, valor);
      toast.success('Condición actualizada. Se aplica a las cuotas que se generen desde ahora.');
    } catch (e) {
      setCondicion(jugador.cuota_condicion);
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setOcupado(false);
    }
  };

  const regenerar = async () => {
    if (!confirm('El link actual dejará de funcionar y habrá que enviarle el nuevo. ¿Continuar?')) return;
    setOcupado(true);
    try {
      await regenerarCodigo(jugador.id);
      toast.success('Link nuevo generado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo regenerar');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-azul-primario">{jugador.nombre_completo}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {deuda > 0 ? `Deuda del año: ${formatoCLP(deuda)}` : 'Al día este año'}
            {!jugador.activo && ' · dado de baja'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Campo label="Link personal" ayuda="Muestra su estado de cuenta y los datos para pagar. Cualquiera con el link puede verlo.">
            <div className="flex gap-2">
              <input readOnly value={link} onFocus={(e) => e.target.select()} className={`${inputClass} font-mono text-xs`} />
              <Button variant="outline" size="icon" onClick={copiar} title="Copiar">
                <Copy />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" asChild className="bg-[#1fa855] hover:bg-[#178a45]">
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle /> Enviar por WhatsApp
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={link} target="_blank" rel="noreferrer">
                  <ExternalLink /> Abrir
                </a>
              </Button>
              <Button size="sm" variant="ghost" onClick={regenerar} disabled={ocupado} className="text-gray-500">
                <RefreshCw /> Generar link nuevo
              </Button>
            </div>
            {!numeroWhatsApp(jugador.telefono) && (
              <p className="text-xs text-gray-500">Sin teléfono en su ficha: WhatsApp te pedirá elegir el contacto.</p>
            )}
          </Campo>

          <Campo label="Condición" htmlFor="condicion" ayuda={CONDICIONES[condicion].descripcion}>
            <select
              id="condicion"
              value={condicion}
              disabled={ocupado}
              onChange={(e) => cambiarCondicion(e.target.value as CondicionCuota)}
              className={inputClass}
            >
              {Object.entries(CONDICIONES).map(([valor, { label }]) => (
                <option key={valor} value={valor}>{label}</option>
              ))}
            </select>
          </Campo>
        </div>
      </DialogContent>
    </Dialog>
  );
}
