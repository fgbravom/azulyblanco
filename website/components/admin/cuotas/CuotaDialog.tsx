'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Ban, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Campo, formatearFecha, inputClass, textareaClass } from '@/components/admin/ui';
import {
  EXENCIONES,
  MEDIOS,
  MEDIOS_MANUALES,
  etiquetaCuota,
  formatoCLP,
  nombreMes,
  type Cuota,
  type Exencion,
  type MedioPago,
  type Pago,
} from '@/lib/cuotas/tipos';
import {
  anularPago,
  eliminarCuota,
  guardarCuota,
  registrarPago,
  type JugadorCuotas,
  type SerieCuotas,
} from '@/app/(admin)/admin/cuotas/actions';
import { estiloCuota } from './CeldaCuota';

const CLAVE_REGISTRADOR = 'cuotas:registrado_por';

function leerRegistrador() {
  try {
    return localStorage.getItem(CLAVE_REGISTRADOR) ?? '';
  } catch {
    return '';
  }
}

function hoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

export default function CuotaDialog({
  serie,
  jugador,
  periodo,
  cuota,
  pagos,
  onClose,
}: {
  serie: SerieCuotas;
  jugador: JugadorCuotas;
  periodo: string;
  cuota?: Cuota;
  pagos: Pago[];
  onClose: () => void;
}) {
  const delMes = cuota ? pagos.filter((p) => p.cuota_id === cuota.id) : [];
  const montoCuota = cuota?.monto ?? serie.cuota_monto;
  const sugerido = cuota ? cuota.saldo || cuota.monto : serie.cuota_monto;

  const [pago, setPago] = useState({
    monto: String(sugerido || ''),
    fecha: hoy(),
    medio: 'transferencia' as MedioPago,
    referencia: '',
    registrado_por: leerRegistrador(),
    nota: '',
  });
  const [ajuste, setAjuste] = useState({
    monto: String(montoCuota),
    exencion: (cuota?.exencion ?? '') as Exencion | '',
    nota: cuota?.nota ?? '',
  });
  const [ocupado, setOcupado] = useState<string | null>(null);

  const ejecutar = async (clave: string, accion: () => Promise<unknown>, exito: string) => {
    setOcupado(clave);
    try {
      await accion();
      toast.success(exito);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
      return false;
    } finally {
      setOcupado(null);
    }
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(CLAVE_REGISTRADOR, pago.registrado_por.trim());
    } catch {
      // Sin almacenamiento: solo no se recuerda el nombre
    }
    const ok = await ejecutar(
      'pago',
      () =>
        registrarPago({
          jugador_id: jugador.id,
          equipo_id: serie.equipo_id,
          periodo,
          monto: Number(pago.monto),
          fecha: pago.fecha,
          medio: pago.medio as 'transferencia' | 'efectivo' | 'otro',
          referencia: pago.referencia,
          registrado_por: pago.registrado_por,
          nota: pago.nota,
        }),
      'Pago registrado'
    );
    if (ok) onClose();
  };

  const guardarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutar(
      'ajuste',
      () =>
        guardarCuota({
          jugador_id: jugador.id,
          equipo_id: serie.equipo_id,
          periodo,
          monto: Number(ajuste.monto),
          exencion: ajuste.exencion || null,
          nota: ajuste.nota,
        }),
      'Cuota actualizada'
    );
  };

  const anular = (p: Pago) => {
    if (!confirm(`¿Anular el pago de ${formatoCLP(p.monto)} del ${formatearFecha(p.fecha)}? Queda registrado como anulado.`)) return;
    ejecutar(`anular-${p.id}`, () => anularPago(p.id), 'Pago anulado');
  };

  const eliminar = async () => {
    if (!cuota || !confirm('¿Eliminar la cuota de este mes? Úsalo solo si se generó por error.')) return;
    if (await ejecutar('eliminar', () => eliminarCuota(cuota.id), 'Cuota eliminada')) onClose();
  };

  const mes = `${nombreMes(periodo)} ${periodo.slice(0, 4)}`;

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
      <DialogContent className="max-w-xl overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-azul-primario">{jugador.nombre_completo}</DialogTitle>
          <DialogDescription className="text-gray-600">Cuota de {mes}</DialogDescription>
        </DialogHeader>

        {/* Estado */}
        {cuota ? (
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 text-center text-sm">
            <Dato etiqueta="Cuota" valor={formatoCLP(cuota.monto)} />
            <Dato etiqueta="Pagado" valor={formatoCLP(cuota.pagado)} />
            <div>
              <p className="text-xs text-gray-500">Estado</p>
              <span className={cn('mt-0.5 inline-block rounded-md px-2 py-0.5 text-xs font-semibold', estiloCuota(cuota))}>
                {etiquetaCuota(cuota)}
                {cuota.saldo > 0 && cuota.estado !== 'pendiente' && ` · debe ${formatoCLP(cuota.saldo)}`}
              </span>
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            Este mes no tiene cuota. Al registrar un pago o una exención se crea con el monto de la serie ({formatoCLP(serie.cuota_monto)}).
          </p>
        )}

        {/* Pagos */}
        {delMes.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Pagos</h3>
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {delMes.map((p) => (
                <li key={p.id} className={cn('flex items-center gap-3 px-3 py-2 text-sm', p.estado !== 'aprobado' && 'text-gray-400')}>
                  <div className="min-w-0 flex-1">
                    <p className={cn('font-semibold', p.estado === 'anulado' && 'line-through')}>
                      {formatoCLP(p.monto)}
                      <span className="ml-2 font-normal text-gray-500">
                        {formatearFecha(p.fecha)} · {MEDIOS[p.medio]}
                        {p.estado !== 'aprobado' && ` · ${p.estado}`}
                      </span>
                    </p>
                    {(p.referencia || p.registrado_por || p.nota) && (
                      <p className="truncate text-xs text-gray-500">
                        {[p.referencia && `Ref. ${p.referencia}`, p.registrado_por && `por ${p.registrado_por}`, p.nota].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  {p.estado === 'aprobado' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => anular(p)}
                      disabled={ocupado !== null}
                      className="h-10 shrink-0 text-gray-500 hover:text-red-600 sm:h-8"
                    >
                      <Ban /> Anular
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Registrar pago */}
        {cuota?.estado !== 'exenta' && (
          <form onSubmit={registrar} className="space-y-3 rounded-lg border border-gray-200 p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-gray-800">Registrar pago</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo label="Monto" htmlFor="pago-monto">
                <input
                  id="pago-monto"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={pago.monto}
                  onChange={(e) => setPago({ ...pago, monto: e.target.value })}
                  className={inputClass}
                />
              </Campo>
              <Campo label="Fecha" htmlFor="pago-fecha">
                <input
                  id="pago-fecha"
                  type="date"
                  required
                  value={pago.fecha}
                  onChange={(e) => setPago({ ...pago, fecha: e.target.value })}
                  className={inputClass}
                />
              </Campo>
              <Campo label="Medio" htmlFor="pago-medio">
                <select
                  id="pago-medio"
                  value={pago.medio}
                  onChange={(e) => setPago({ ...pago, medio: e.target.value as MedioPago })}
                  className={inputClass}
                >
                  {MEDIOS_MANUALES.map((m) => (
                    <option key={m} value={m}>{MEDIOS[m]}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="N° de comprobante" htmlFor="pago-ref">
                <input
                  id="pago-ref"
                  value={pago.referencia}
                  onChange={(e) => setPago({ ...pago, referencia: e.target.value })}
                  placeholder="Opcional"
                  className={inputClass}
                />
              </Campo>
              <Campo label="Registrado por" htmlFor="pago-por" className="sm:col-span-1">
                <input
                  id="pago-por"
                  value={pago.registrado_por}
                  onChange={(e) => setPago({ ...pago, registrado_por: e.target.value })}
                  placeholder="Tu nombre"
                  className={inputClass}
                />
              </Campo>
              <Campo label="Nota" htmlFor="pago-nota" className="sm:col-span-1">
                <input
                  id="pago-nota"
                  value={pago.nota}
                  onChange={(e) => setPago({ ...pago, nota: e.target.value })}
                  placeholder="Opcional"
                  className={inputClass}
                />
              </Campo>
            </div>
            <Button type="submit" className="w-full" disabled={ocupado !== null || !serie.cuota_monto}>
              {ocupado === 'pago' ? 'Guardando…' : 'Registrar pago'}
            </Button>
          </form>
        )}

        {/* Exención y monto */}
        <details className="rounded-lg border border-gray-200" open={cuota?.estado === 'exenta'}>
          <summary className="cursor-pointer select-none px-4 py-3.5 sm:py-3 text-sm font-semibold text-gray-800">
            Exención y monto de la cuota
          </summary>
          <form onSubmit={guardarAjuste} className="space-y-3 border-t border-gray-100 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo label="Exención" htmlFor="cuota-exencion" ayuda="Una cuota exenta no suma deuda.">
                <select
                  id="cuota-exencion"
                  value={ajuste.exencion}
                  onChange={(e) => setAjuste({ ...ajuste, exencion: e.target.value as Exencion | '' })}
                  className={inputClass}
                >
                  <option value="">Sin exención (se cobra)</option>
                  {Object.entries(EXENCIONES).map(([valor, label]) => (
                    <option key={valor} value={valor}>{label}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Monto de la cuota" htmlFor="cuota-monto" ayuda="Para un descuento puntual.">
                <input
                  id="cuota-monto"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={ajuste.monto}
                  onChange={(e) => setAjuste({ ...ajuste, monto: e.target.value })}
                  className={inputClass}
                />
              </Campo>
            </div>
            <Campo label="Nota" htmlFor="cuota-nota">
              <textarea
                id="cuota-nota"
                rows={2}
                value={ajuste.nota}
                onChange={(e) => setAjuste({ ...ajuste, nota: e.target.value })}
                placeholder="Ej.: lesión de rodilla, vuelve en octubre"
                className={textareaClass}
              />
            </Campo>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              {cuota ? (
                <Button type="button" variant="ghost" size="sm" onClick={eliminar} disabled={ocupado !== null} className="h-10 text-gray-500 hover:text-red-600 sm:h-8">
                  <Trash2 /> Eliminar cuota
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit" variant="outline" className="w-full sm:w-auto" disabled={ocupado !== null}>
                {ocupado === 'ajuste' ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </details>
      </DialogContent>
    </Dialog>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{etiqueta}</p>
      <p className="font-semibold text-gray-900">{valor}</p>
    </div>
  );
}
