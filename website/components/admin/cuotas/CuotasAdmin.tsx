'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Link2, Search, Settings, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PageHeader, Vacio, inputClass } from '@/components/admin/ui';
import { formatoCLP, nombreMes, periodoDe, type Cuota } from '@/lib/cuotas/tipos';
import type { JugadorCuotas, Tablero } from '@/app/(admin)/admin/cuotas/actions';
import CeldaCuota from './CeldaCuota';
import CuotaDialog from './CuotaDialog';
import JugadorCuotasDialog from './JugadorCuotasDialog';
import ConfigCuotasDialog from './ConfigCuotasDialog';
import GenerarCuotasDialog from './GenerarCuotasDialog';

/** Meses a mostrar: del primero con cuotas al último (o al mes actual) */
function mesesDelTablero(cuotas: Cuota[], anio: number) {
  const actual = periodoDe();
  const periodos = cuotas.map((c) => c.periodo);
  if (actual.startsWith(String(anio))) periodos.push(actual);
  if (!periodos.length) return [];

  const desde = Number(periodos.reduce((a, b) => (a < b ? a : b)).slice(5, 7));
  const hasta = Number(periodos.reduce((a, b) => (a > b ? a : b)).slice(5, 7));
  return Array.from({ length: hasta - desde + 1 }, (_, i) => `${anio}-${String(desde + i).padStart(2, '0')}-01`);
}

export default function CuotasAdmin({ tablero }: { tablero: Tablero }) {
  const { series, serie, anio, anios, jugadores, cuotas, pagos } = tablero;
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [soloDeuda, setSoloDeuda] = useState(false);
  const [celda, setCelda] = useState<{ jugadorId: number; periodo: string } | null>(null);
  const [fichaId, setFichaId] = useState<number | null>(null);
  const [config, setConfig] = useState(false);
  const [generar, setGenerar] = useState(false);

  const meses = useMemo(() => mesesDelTablero(cuotas, anio), [cuotas, anio]);

  const porCelda = useMemo(() => new Map(cuotas.map((c) => [`${c.jugador_id}|${c.periodo}`, c])), [cuotas]);

  const deuda = useMemo(() => {
    const total = new Map<number, number>();
    for (const c of cuotas) total.set(c.jugador_id, (total.get(c.jugador_id) ?? 0) + c.saldo);
    return total;
  }, [cuotas]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return jugadores.filter(
      (j) => (!q || j.nombre_completo.toLowerCase().includes(q)) && (!soloDeuda || (deuda.get(j.id) ?? 0) > 0)
    );
  }, [jugadores, busqueda, soloDeuda, deuda]);

  const resumen = useMemo(() => {
    const recaudado = cuotas.reduce((s, c) => s + c.pagado, 0);
    const porCobrar = cuotas.reduce((s, c) => s + c.saldo, 0);
    const conDeuda = Array.from(deuda.values()).filter((d) => d > 0).length;
    const ultimoMes = meses.at(-1);
    const delMes = ultimoMes ? cuotas.filter((c) => c.periodo === ultimoMes).reduce((s, c) => s + c.pagado, 0) : 0;
    return { recaudado, porCobrar, conDeuda, ultimoMes, delMes };
  }, [cuotas, deuda, meses]);

  const totalMes = (periodo: string) => cuotas.filter((c) => c.periodo === periodo).reduce((s, c) => s + c.pagado, 0);

  const navegar = (cambios: { serie?: number; anio?: number }) => {
    const params = new URLSearchParams();
    params.set('serie', String(cambios.serie ?? serie?.equipo_id ?? ''));
    params.set('anio', String(cambios.anio ?? anio));
    router.push(`/admin/cuotas?${params}`);
  };

  const jugadorCelda = celda ? jugadores.find((j) => j.id === celda.jugadorId) : undefined;
  const ficha = fichaId ? jugadores.find((j) => j.id === fichaId) : undefined;

  if (!serie) {
    return (
      <>
        <PageHeader titulo="Cuotas" />
        <Vacio icono={Wallet} titulo="No hay series con equipo activo" descripcion="Crea el equipo de la temporada en Supabase para empezar a cobrar cuotas." />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Cuotas"
        descripcion={
          serie.cuota_monto
            ? `Cuota mensual de ${serie.nombre}: ${formatoCLP(serie.cuota_monto)}. Toca una celda para registrar un pago o marcar una exención.`
            : 'Define el monto de la cuota de esta serie para empezar.'
        }
        acciones={
          <>
            <Button variant="outline" onClick={() => setConfig(true)}>
              <Settings /> Configuración
            </Button>
            <Button onClick={() => setGenerar(true)} disabled={!serie.cuota_monto}>
              <CalendarPlus /> Generar cuotas del mes
            </Button>
          </>
        }
      />

      {/* Serie y año */}
      <div className="flex flex-wrap items-center gap-2">
        {series.map((s) => (
          <button
            key={s.equipo_id}
            onClick={() => navegar({ serie: s.equipo_id })}
            className={cn(
              'rounded-full border px-3 py-1 text-sm',
              s.equipo_id === serie.equipo_id
                ? 'border-azul-primario bg-azul-primario text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-azul-claro'
            )}
          >
            {s.nombre}
          </button>
        ))}
        <select
          value={anio}
          onChange={(e) => navegar({ anio: Number(e.target.value) })}
          className={cn(inputClass, 'ml-auto h-9 w-auto')}
          aria-label="Año"
        >
          {anios.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador etiqueta={`Recaudado ${anio}`} valor={formatoCLP(resumen.recaudado)} />
        <Indicador
          etiqueta={resumen.ultimoMes ? `Recaudado ${nombreMes(resumen.ultimoMes).toLowerCase()}` : 'Recaudado del mes'}
          valor={formatoCLP(resumen.delMes)}
        />
        <Indicador etiqueta="Por cobrar" valor={formatoCLP(resumen.porCobrar)} alerta={resumen.porCobrar > 0} />
        <Indicador
          etiqueta="Jugadores con deuda"
          valor={`${resumen.conDeuda} de ${jugadores.filter((j) => j.activo).length}`}
          alerta={resumen.conDeuda > 0}
        />
      </div>

      {meses.length === 0 ? (
        <Vacio
          icono={Wallet}
          titulo={`Sin cuotas en ${anio}`}
          descripcion="Genera las cuotas del mes para que cada jugador activo tenga su cobro."
          accion={
            serie.cuota_monto ? (
              <Button onClick={() => setGenerar(true)}>
                <CalendarPlus /> Generar cuotas del mes
              </Button>
            ) : (
              <Button onClick={() => setConfig(true)}>
                <Settings /> Definir monto
              </Button>
            )
          }
        />
      ) : (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar jugador"
                className={cn(inputClass, 'pl-9')}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={soloDeuda} onChange={(e) => setSoloDeuda(e.target.checked)} className="h-4 w-4 accent-azul-primario" />
              Solo con deuda
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left font-semibold">Jugador</th>
                  {meses.map((m) => (
                    <th key={m} className="px-1 py-3 text-center font-semibold">{nombreMes(m, 'short')}</th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Deuda</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((j) => (
                  <Fila
                    key={j.id}
                    jugador={j}
                    meses={meses}
                    cuota={(m) => porCelda.get(`${j.id}|${m}`)}
                    deuda={deuda.get(j.id) ?? 0}
                    onCelda={(periodo) => setCelda({ jugadorId: j.id, periodo })}
                    onFicha={() => setFichaId(j.id)}
                  />
                ))}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={meses.length + 2} className="px-4 py-10 text-center text-gray-500">
                      Ningún jugador coincide con el filtro.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold text-azul-primario">
                  <td className="sticky left-0 z-10 bg-gray-50 px-4 py-3">Total recaudado</td>
                  {meses.map((m) => (
                    <td key={m} className="whitespace-nowrap px-1 py-3 text-center text-xs">{formatoCLP(totalMes(m))}</td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right text-red-600">{formatoCLP(resumen.porCobrar)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {celda && jugadorCelda && (
        <CuotaDialog
          serie={serie}
          jugador={jugadorCelda}
          periodo={celda.periodo}
          cuota={porCelda.get(`${celda.jugadorId}|${celda.periodo}`)}
          pagos={pagos}
          onClose={() => setCelda(null)}
        />
      )}

      {ficha && (
        <JugadorCuotasDialog
          jugador={ficha}
          serie={serie}
          deuda={deuda.get(ficha.id) ?? 0}
          onClose={() => setFichaId(null)}
        />
      )}

      {config && <ConfigCuotasDialog serie={serie} onClose={() => setConfig(false)} />}
      {generar && <GenerarCuotasDialog serie={serie} onClose={() => setGenerar(false)} />}
    </div>
  );
}

function Indicador({ etiqueta, valor, alerta }: { etiqueta: string; valor: string; alerta?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{etiqueta}</p>
      <p className={cn('mt-1 font-heading text-xl font-bold sm:text-2xl', alerta ? 'text-red-600' : 'text-azul-primario')}>{valor}</p>
    </div>
  );
}

function Fila({
  jugador,
  meses,
  cuota,
  deuda,
  onCelda,
  onFicha,
}: {
  jugador: JugadorCuotas;
  meses: string[];
  cuota: (periodo: string) => Cuota | undefined;
  deuda: number;
  onCelda: (periodo: string) => void;
  onFicha: () => void;
}) {
  return (
    <tr className={cn('group border-b border-gray-100 hover:bg-gray-50/60', !jugador.activo && 'text-gray-400')}>
      <td className="sticky left-0 z-10 bg-white px-4 py-1.5 group-hover:bg-gray-50">
        <button onClick={onFicha} className="flex items-center gap-2 text-left hover:text-azul-claro" title="Condición y link personal">
          <span className={cn('whitespace-nowrap font-medium', jugador.activo ? 'text-gray-900' : 'text-gray-400 line-through')}>
            {jugador.nombre_completo}
          </span>
          {jugador.cuota_condicion !== 'regular' && (
            <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-purple-700">
              {jugador.cuota_condicion}
            </span>
          )}
          <Link2 className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
        </button>
      </td>
      {meses.map((m) => (
        <td key={m} className="px-1 py-1.5 text-center">
          <CeldaCuota cuota={cuota(m)} onClick={() => onCelda(m)} />
        </td>
      ))}
      <td className={cn('whitespace-nowrap px-4 py-1.5 text-right font-semibold', deuda > 0 ? 'text-red-600' : 'text-gray-400')}>
        {deuda > 0 ? formatoCLP(deuda) : '—'}
      </td>
    </tr>
  );
}
