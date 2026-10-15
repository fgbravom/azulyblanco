'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarDays, Copy, EyeOff, MapPin, Pencil, Plus, Search, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Actividad, ActividadInput, Rival } from '@/lib/contenido/tipos';
import { horaCorta, nombreActividad } from '@/lib/contenido/calendario';
import { cambiarConfirmacion, eliminarActividad } from '@/app/(admin)/admin/programacion/actions';
import { PageHeader, Vacio, inputClass } from '@/components/admin/ui';
import ActividadForm, { actividadVacia } from './ActividadForm';

type Periodo = 'proximas' | 'pasadas' | 'todas';
type FiltroTipo = 'todos' | Actividad['tipo'];

const ESTILO_TIPO: Record<Actividad['tipo'], { label: string; clase: string }> = {
  partido: { label: 'Partido', clase: 'bg-azul-claro/10 text-azul-medio' },
  entrenamiento: { label: 'Entrenamiento', clase: 'bg-emerald-50 text-emerald-700' },
  evento: { label: 'Evento', clase: 'bg-orange-50 text-orange-700' },
};

function hoyISO() {
  return new Date().toLocaleDateString('sv-SE');
}

function aInput(a: Actividad): ActividadInput {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, legacy_id, created_at, updated_at, ...resto } = a;
  return resto;
}

export default function ProgramacionAdmin({ iniciales, rivales }: { iniciales: Actividad[]; rivales: Rival[] }) {
  const [actividades, setActividades] = useState(iniciales);
  const [periodo, setPeriodo] = useState<Periodo>('proximas');
  const [tipo, setTipo] = useState<FiltroTipo>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [editor, setEditor] = useState<{ id: string | null; inicial: ActividadInput } | null>(null);

  const hoy = hoyISO();

  const lugares = useMemo(
    () => Array.from(new Set(actividades.map((a) => a.estadio).filter(Boolean))).sort(),
    [actividades]
  );

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = actividades.filter((a) => {
      if (periodo === 'proximas' && a.fecha < hoy) return false;
      if (periodo === 'pasadas' && a.fecha >= hoy) return false;
      if (tipo !== 'todos' && a.tipo !== tipo) return false;
      if (q && !`${nombreActividad(a)} ${a.estadio}`.toLowerCase().includes(q)) return false;
      return true;
    });
    // Pasadas: la más reciente primero
    return periodo === 'pasadas' ? filtradas.reverse() : filtradas;
  }, [actividades, periodo, tipo, busqueda, hoy]);

  const porMes = useMemo(() => {
    const grupos = new Map<string, Actividad[]>();
    for (const a of visibles) {
      const clave = a.fecha.slice(0, 7);
      grupos.set(clave, [...(grupos.get(clave) ?? []), a]);
    }
    return Array.from(grupos.entries());
  }, [visibles]);

  const guardada = (actividad: Actividad) => {
    setActividades((prev) => {
      const sin = prev.filter((a) => a.id !== actividad.id);
      return [...sin, actividad].sort((a, b) =>
        a.fecha === b.fecha ? (a.hora_inicio ?? '').localeCompare(b.hora_inicio ?? '') : a.fecha.localeCompare(b.fecha)
      );
    });
    setEditor(null);
  };

  const confirmar = async (a: Actividad) => {
    const valor = !a.confirmado;
    setActividades((prev) => prev.map((x) => (x.id === a.id ? { ...x, confirmado: valor } : x)));
    try {
      await cambiarConfirmacion(a.id, valor);
    } catch (e) {
      setActividades((prev) => prev.map((x) => (x.id === a.id ? { ...x, confirmado: !valor } : x)));
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar');
    }
  };

  const eliminar = async (a: Actividad) => {
    if (!confirm(`¿Eliminar "${nombreActividad(a)}" del ${a.fecha.split('-').reverse().join('/')}?`)) return;
    try {
      await eliminarActividad(a.id);
      setActividades((prev) => prev.filter((x) => x.id !== a.id));
      toast.success('Actividad eliminada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  return (
    <>
      <PageHeader
        titulo="Programación"
        descripcion="Partidos, entrenamientos y eventos que se muestran en el inicio y en el calendario."
        acciones={
          <Button onClick={() => setEditor({ id: null, inicial: actividadVacia() })}>
            <Plus /> Nueva actividad
          </Button>
        }
      />

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-gray-200">
            {(['proximas', 'pasadas', 'todas'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium',
                  periodo === p ? 'bg-azul-primario text-white' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {p === 'proximas' ? 'Próximas' : p === 'pasadas' ? 'Pasadas' : 'Todas'}
              </button>
            ))}
          </div>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as FiltroTipo)} className={cn(inputClass, 'w-auto')}>
            <option value="todos">Todos los tipos</option>
            <option value="partido">Partidos</option>
            <option value="entrenamiento">Entrenamientos</option>
            <option value="evento">Eventos</option>
          </select>
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar rival, lugar…" className={cn(inputClass, 'pl-9')} />
        </div>
      </div>

      {porMes.length === 0 ? (
        <Vacio
          icono={CalendarDays}
          titulo={periodo === 'proximas' ? 'No hay actividades próximas' : 'No hay actividades'}
          descripcion="Agrega partidos, entrenamientos o eventos para que aparezcan en el sitio."
          accion={
            <Button onClick={() => setEditor({ id: null, inicial: actividadVacia() })}>
              <Plus /> Nueva actividad
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {porMes.map(([mes, lista]) => (
            <section key={mes}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {new Date(`${mes}-15T12:00:00`).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
              </h2>
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {lista.map((a) => {
                  const fecha = new Date(`${a.fecha}T12:00:00`);
                  const pasada = a.fecha < hoy;
                  return (
                    <li key={a.id} className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', pasada && 'bg-gray-50/60')}>
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className={cn('flex w-14 shrink-0 flex-col items-center rounded-lg py-1.5', pasada ? 'bg-gray-100 text-gray-500' : 'bg-azul-primario text-white')}>
                          <span className="text-[10px] font-semibold uppercase">
                            {fecha.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '')}
                          </span>
                          <span className="text-xl font-bold leading-none">{fecha.getDate()}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold', ESTILO_TIPO[a.tipo].clase)}>
                              {ESTILO_TIPO[a.tipo].label}
                              {a.tipo_partido ? ` · ${a.tipo_partido}` : ''}
                            </span>
                            {!a.publicado && (
                              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
                                <EyeOff className="h-3 w-3" /> Oculta
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate font-semibold text-gray-900">{nombreActividad(a)}</p>
                          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            {a.hora_inicio && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {horaCorta(a.hora_inicio)}
                                {a.hora_fin ? `–${horaCorta(a.hora_fin)}` : ''}
                              </span>
                            )}
                            {a.estadio && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {a.estadio}
                              </span>
                            )}
                            {a.series.length > 0 && <span>{a.series.join(' · ')}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:shrink-0">
                        <button
                          onClick={() => confirmar(a)}
                          title="Cambiar confirmación"
                          className={cn(
                            'mr-2 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                            a.confirmado ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          )}
                        >
                          {a.confirmado ? 'Confirmado' : 'Por confirmar'}
                        </button>
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditor({ id: a.id, inicial: aInput(a) })}>
                          <Pencil />
                        </Button>
                        <Button variant="ghost" size="icon" title="Duplicar" onClick={() => setEditor({ id: null, inicial: aInput(a) })}>
                          <Copy />
                        </Button>
                        <Button variant="ghost" size="icon" title="Eliminar" onClick={() => eliminar(a)} className="hover:text-red-600">
                          <Trash2 />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Dialog open={editor !== null} onOpenChange={(abierto) => !abierto && setEditor(null)}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-azul-primario">
              {editor?.id ? 'Editar actividad' : 'Nueva actividad'}
            </DialogTitle>
          </DialogHeader>
          {editor && (
            <ActividadForm
              key={editor.id ?? 'nueva'}
              id={editor.id}
              inicial={editor.inicial}
              lugares={lugares}
              rivales={rivales}
              onGuardada={guardada}
              onCancelar={() => setEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
