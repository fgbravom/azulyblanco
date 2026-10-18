'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GolInput, JugadorGoles, LadoPartido } from '@/lib/contenido/tipos';
import { inputClass } from '@/components/admin/ui';

/** Tope de filas por lado, para que un error de tipeo (ej: 70 en vez de 7) no dibuje setenta selectores */
const MAX_FILAS = 20;
const AUTOGOL = 'autogol';

export type GolesPorLado = Record<LadoPartido, GolInput[]>;

export function golVacio(lado: LadoPartido): GolInput {
  return { lado, autor_id: null, asistencia_id: null, en_contra: false };
}

/** Lo que se guarda: solo las filas de los lados de AYB que tienen goleador o son autogol */
export function golesAGuardar(goles: GolesPorLado, lados: { lado: LadoPartido; cantidad: number }[]): GolInput[] {
  return lados.flatMap(({ lado, cantidad }) =>
    goles[lado].slice(0, cantidad).filter((g) => g.en_contra || g.autor_id !== null)
  );
}

function nombreJugador(j: JugadorGoles) {
  return `${j.nombre} ${j.apellidos}${j.dorsal ? ` · #${j.dorsal}` : ''}`;
}

/** Jugadores agrupados por serie: primero las series del partido, los inactivos al final */
function agrupar(jugadores: JugadorGoles[], series: string[]) {
  const delPartido = series.map((s) => s.replace(/^Serie\s+/i, ''));
  const grupos = new Map<string, JugadorGoles[]>();
  for (const j of jugadores) {
    const grupo = j.activo ? `Serie ${j.categoria}` : 'Inactivos';
    grupos.set(grupo, [...(grupos.get(grupo) ?? []), j]);
  }
  const peso = (grupo: string) =>
    grupo === 'Inactivos' ? 2 : delPartido.some((s) => grupo === `Serie ${s}`) ? 0 : 1;
  return [...grupos.entries()].sort(([a], [b]) => peso(a) - peso(b));
}

function OpcionesJugadores({ grupos, excluir }: { grupos: [string, JugadorGoles[]][]; excluir?: number | null }) {
  return grupos.map(([grupo, lista]) => (
    <optgroup key={grupo} label={grupo}>
      {lista
        .filter((j) => j.id !== excluir)
        .map((j) => (
          <option key={j.id} value={j.id}>
            {nombreJugador(j)}
          </option>
        ))}
    </optgroup>
  ));
}

interface Props {
  /** Lados de AYB con sus goles en el resultado */
  lados: { lado: LadoPartido; equipo: string; cantidad: number }[];
  goles: GolesPorLado;
  onChange: (lado: LadoPartido, indice: number, gol: GolInput) => void;
  jugadores: JugadorGoles[];
  series: string[];
  estado: 'cargando' | 'listo' | 'error';
}

export default function GolesPartido({ lados, goles, onChange, jugadores, series, estado }: Props) {
  const conGoles = lados.filter((l) => l.cantidad > 0);
  if (conGoles.length === 0) return null;

  const grupos = agrupar(jugadores, series);
  const varios = conGoles.length > 1;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div>
        <p className="text-sm font-medium text-gray-700">Goles y asistencias</p>
        <p className="text-xs text-gray-500">Opcional. Los goles sin goleador no se muestran en el sitio.</p>
      </div>

      {estado === 'error' ? (
        <p className="text-sm text-amber-800">
          No se pudieron cargar los goleadores. Al guardar se mantienen los que ya había; recarga la página para editarlos.
        </p>
      ) : estado === 'cargando' ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando goleadores…
        </p>
      ) : jugadores.length === 0 ? (
        <p className="text-sm text-gray-500">No hay jugadores en el plantel para elegir.</p>
      ) : (
        conGoles.map(({ lado, equipo, cantidad }) => (
          <div key={lado} className="space-y-2">
            {varios && <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{equipo}</p>}
            {Array.from({ length: Math.min(cantidad, MAX_FILAS) }, (_, i) => {
              const gol = goles[lado][i] ?? golVacio(lado);
              const autor = gol.en_contra ? AUTOGOL : gol.autor_id?.toString() ?? '';
              const n = i + 1;
              return (
                <div key={i} className="grid grid-cols-[1.75rem_1fr] items-center gap-2 sm:grid-cols-[1.75rem_1fr_1fr]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-azul-primario/10 text-xs font-bold text-azul-primario">
                    {n}
                  </span>
                  <select
                    aria-label={`Goleador del gol ${n}${varios ? ` de ${equipo}` : ''}`}
                    value={autor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') onChange(lado, i, golVacio(lado));
                      else if (v === AUTOGOL) onChange(lado, i, { ...golVacio(lado), en_contra: true });
                      else {
                        const id = Number(v);
                        onChange(lado, i, { lado, autor_id: id, asistencia_id: gol.asistencia_id === id ? null : gol.asistencia_id, en_contra: false });
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="">Goleador…</option>
                    <option value={AUTOGOL}>Autogol del rival</option>
                    <OpcionesJugadores grupos={grupos} />
                  </select>
                  <select
                    aria-label={`Asistencia del gol ${n}${varios ? ` de ${equipo}` : ''}`}
                    value={gol.asistencia_id?.toString() ?? ''}
                    disabled={gol.autor_id === null}
                    onChange={(e) => onChange(lado, i, { ...gol, asistencia_id: e.target.value ? Number(e.target.value) : null })}
                    className={cn(inputClass, 'col-start-2 sm:col-start-auto')}
                  >
                    <option value="">Sin asistencia</option>
                    <OpcionesJugadores grupos={grupos} excluir={gol.autor_id} />
                  </select>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
