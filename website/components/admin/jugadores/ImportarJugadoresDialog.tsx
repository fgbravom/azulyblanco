'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { EstadoFila, FilaImportacion } from '@/lib/jugadores/importar-csv';
import { cn } from '@/lib/utils';

interface Resultado {
  filas: FilaImportacion[];
  importados: number;
  actualizados: number;
  fallidos: { linea: number; error: string }[];
}

const ESTILO_ESTADO: Record<EstadoFila, string> = {
  nuevo: 'bg-green-100 text-green-800',
  actualizar: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  'sin cambios': 'bg-gray-100 text-gray-600',
  'repetido en el CSV': 'bg-gray-100 text-gray-600',
};

async function enviar(csv: string, aplicar: boolean): Promise<Resultado> {
  const res = await fetch('/api/jugadores/importar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv, aplicar }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) throw new Error(body?.error || 'No se pudo procesar el archivo');
  return body.data;
}

function FilaPlan({ fila }: { fila: FilaImportacion }) {
  return (
    <li className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-10 shrink-0 text-xs text-gray-400">#{fila.linea}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {fila.jugador.nombre} {fila.jugador.apellidos}
        </p>
        {fila.detalle ? (
          <p className="text-xs text-red-700">{fila.detalle}</p>
        ) : fila.cambios.length ? (
          fila.cambios.map((c) => (
            <p key={c} className="text-xs text-amber-800">
              {c.replace(/Azul y Blanco - /g, '')}
            </p>
          ))
        ) : (
          <p className="text-xs text-gray-500">
            {fila.serie?.replace(/^Azul y Blanco - /, 'Serie ')} · {fila.posiciones.join(', ')}
            {fila.jugador.pie_preferido && ` · ${fila.jugador.pie_preferido}`}
          </p>
        )}
      </div>
      <span className={cn('self-start rounded-full px-2 py-0.5 text-xs font-medium sm:self-center', ESTILO_ESTADO[fila.estado])}>
        {fila.estado}
      </span>
    </li>
  );
}

export default function ImportarJugadoresDialog({
  open,
  onOpenChange,
  onImportado,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportado: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<{ nombre: string; csv: string } | null>(null);
  const [plan, setPlan] = useState<FilaImportacion[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [verSaltados, setVerSaltados] = useState(false);

  const reiniciar = () => {
    setArchivo(null);
    setPlan(null);
    setVerSaltados(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const cambiarAbierto = (abierto: boolean) => {
    if (cargando) return;
    if (!abierto) reiniciar();
    onOpenChange(abierto);
  };

  const elegirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargando(true);
    try {
      const csv = await file.text();
      const { filas } = await enviar(csv, false);
      setArchivo({ nombre: file.name, csv });
      setPlan(filas);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo leer el archivo');
      reiniciar();
    } finally {
      setCargando(false);
    }
  };

  const importar = async () => {
    if (!archivo) return;
    setCargando(true);
    try {
      const { importados, actualizados, fallidos } = await enviar(archivo.csv, true);
      const hecho = [
        importados && `${importados} ${importados === 1 ? 'jugador importado' : 'jugadores importados'}`,
        actualizados && `${actualizados} ${actualizados === 1 ? 'actualizado' : 'actualizados'}`,
      ].filter(Boolean);
      if (hecho.length) toast.success(hecho.join(' y '));
      for (const f of fallidos) toast.error(`Fila ${f.linea}: ${f.error}`, { duration: 20000 });
      onImportado();
      reiniciar();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo importar');
    } finally {
      setCargando(false);
    }
  };

  const nuevos = plan?.filter((f) => f.estado === 'nuevo') ?? [];
  const actualizar = plan?.filter((f) => f.estado === 'actualizar') ?? [];
  const errores = plan?.filter((f) => f.estado === 'error') ?? [];
  const saltados = plan?.filter((f) => f.estado === 'sin cambios' || f.estado === 'repetido en el CSV') ?? [];
  const visibles = [...errores, ...nuevos, ...actualizar, ...(verSaltados ? saltados : [])].sort(
    (a, b) => a.linea - b.linea
  );
  const accion = [
    nuevos.length && `importar ${nuevos.length} ${nuevos.length === 1 ? 'nuevo' : 'nuevos'}`,
    actualizar.length && `actualizar ${actualizar.length}`,
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={cambiarAbierto}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-azul-primario">Importar jugadores</DialogTitle>
          <DialogDescription className="text-gray-600">
            Sube el CSV que exporta la base de Notion del formulario de inscripción. Los jugadores que ya están en el
            plantel no se duplican: se les actualiza la serie, las posiciones y el pie hábil si cambiaron. Puedes subir
            el archivo completo cada vez que lleguen respuestas nuevas.
          </DialogDescription>
        </DialogHeader>

        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={elegirArchivo} className="hidden" />

        {!plan ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={cargando}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-10 text-gray-600 hover:border-azul-claro hover:text-azul-primario disabled:opacity-60"
          >
            {cargando ? <Loader2 className="h-8 w-8 animate-spin" /> : <FileUp className="h-8 w-8" />}
            <span className="font-medium">{cargando ? 'Revisando el archivo…' : 'Elegir archivo CSV'}</span>
            <span className="text-xs text-gray-400">En Notion: ••• → Exportar → Markdown y CSV, y descomprime el zip</span>
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{archivo?.nombre}</span>: {plan.length}{' '}
              {plan.length === 1 ? 'fila' : 'filas'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-2xl font-bold text-green-700">{nuevos.length}</p>
                <p className="text-xs text-green-800">{nuevos.length === 1 ? 'nuevo' : 'nuevos'}</p>
              </div>
              <div className={cn('rounded-lg p-3', actualizar.length ? 'bg-amber-50' : 'bg-gray-50')}>
                <p className={cn('text-2xl font-bold', actualizar.length ? 'text-amber-700' : 'text-gray-400')}>
                  {actualizar.length}
                </p>
                <p className={cn('text-xs', actualizar.length ? 'text-amber-800' : 'text-gray-500')}>con cambios</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-2xl font-bold text-gray-600">{saltados.length}</p>
                <p className="text-xs text-gray-600">sin cambios</p>
              </div>
              <div className={cn('rounded-lg p-3', errores.length ? 'bg-red-50' : 'bg-gray-50')}>
                <p className={cn('text-2xl font-bold', errores.length ? 'text-red-700' : 'text-gray-400')}>{errores.length}</p>
                <p className={cn('text-xs', errores.length ? 'text-red-800' : 'text-gray-500')}>con error</p>
              </div>
            </div>

            {errores.length > 0 && (
              <p className="text-sm text-gray-600">
                Las filas con error no se importan. Corrígelas en Notion y vuelve a subir el archivo, o crea esos jugadores
                a mano.
              </p>
            )}

            {visibles.length > 0 && (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {visibles.map((fila) => (
                  <FilaPlan key={fila.linea} fila={fila} />
                ))}
              </ul>
            )}

            {saltados.length > 0 && (
              <button
                type="button"
                onClick={() => setVerSaltados((v) => !v)}
                className="text-sm text-azul-primario hover:underline"
              >
                {verSaltados ? 'Ocultar' : 'Ver'} los {saltados.length} que se saltan
              </button>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={reiniciar} disabled={cargando} className="w-full sm:w-auto">
                Elegir otro archivo
              </Button>
              <Button onClick={importar} disabled={cargando || accion.length === 0} className="w-full sm:w-auto">
                {cargando && <Loader2 className="animate-spin" />}
                {accion.length === 0
                  ? 'No hay nada que importar'
                  : accion.join(' y ').replace(/^./, (c) => c.toUpperCase())}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
