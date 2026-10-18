'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Actividad, ActividadInput, GolInput, JugadorGoles, LadoPartido, Rival } from '@/lib/contenido/tipos';
import { TIPOS_PARTIDO } from '@/lib/contenido/tipos';
import type { TipoEvento } from '@/lib/types/calendario';
import { esEquipoAYB } from '@/lib/utils/calendario';
import { guardarActividad, obtenerGoles } from '@/app/(admin)/admin/programacion/actions';
import { BarraAcciones, Campo, Interruptor, inputClass, textareaClass } from '@/components/admin/ui';
import GolesPartido, { golesAGuardar, golVacio, type GolesPorLado } from './GolesPartido';

export const SERIES_OPCIONES = ['Serie Primera', 'Serie Honor', 'Serie 35'];

const TIPOS: { value: TipoEvento; label: string }[] = [
  { value: 'partido', label: 'Partido' },
  { value: 'entrenamiento', label: 'Entrenamiento' },
  { value: 'evento', label: 'Evento' },
];

/** "AYB VS CLUB AMÉRICA" → ["AYB", "CLUB AMÉRICA"] */
function separarEquipos(rival: string | null): [string, string] {
  if (!rival) return ['AYB', ''];
  const partes = rival.split(/\s+vs\.?\s+/i);
  return partes.length === 2 ? [partes[0], partes[1]] : ['AYB', rival];
}

export function actividadVacia(): ActividadInput {
  return {
    tipo: 'partido',
    fecha: new Date().toLocaleDateString('sv-SE'), // YYYY-MM-DD en hora local
    hora_inicio: null,
    hora_fin: null,
    rival: null,
    rival_id: null,
    tipo_partido: 'Amistoso',
    actividad: null,
    titulo: null,
    descripcion: null,
    estadio: '',
    confirmado: false,
    llevar: null,
    precio_entrada: null,
    edad_gratis: null,
    series: [],
    goles_local: null,
    goles_visitante: null,
    publicado: true,
  };
}

interface Props {
  /** id null = actividad nueva (también al duplicar) */
  id: string | null;
  inicial: ActividadInput;
  lugares: string[];
  rivales: Rival[];
  jugadores: JugadorGoles[];
  onGuardada: (actividad: Actividad) => void;
  onCancelar: () => void;
}

export default function ActividadForm({ id, inicial, lugares, rivales, jugadores, onGuardada, onCancelar }: Props) {
  const [datos, setDatos] = useState<ActividadInput>(inicial);
  const [[local, visita], setEquipos] = useState(() => separarEquipos(inicial.rival));
  const [guardando, setGuardando] = useState(false);
  const [goles, setGoles] = useState<GolesPorLado>({ local: [], visitante: [] });
  // 'error' = no se pudieron leer: al guardar no se tocan los goleadores que ya había
  const [estadoGoles, setEstadoGoles] = useState<'cargando' | 'listo' | 'error'>(id ? 'cargando' : 'listo');

  useEffect(() => {
    if (!id) return;
    obtenerGoles(id)
      .then((lista) => {
        setGoles({ local: lista.filter((g) => g.lado === 'local'), visitante: lista.filter((g) => g.lado === 'visitante') });
        setEstadoGoles('listo');
      })
      .catch(() => {
        toast.error('No se pudieron cargar los goleadores');
        setEstadoGoles('error');
      });
  }, [id]);

  const cambiarGol = (lado: LadoPartido, indice: number, gol: GolInput) =>
    setGoles((g) => {
      const lista = [...g[lado]];
      while (lista.length < indice) lista.push(golVacio(lado));
      lista[indice] = gol;
      return { ...g, [lado]: lista };
    });

  // Los goleadores se registran solo para los lados que son de AYB
  const ladosAYB = (
    [
      { lado: 'local', equipo: local, cantidad: datos.goles_local ?? 0 },
      { lado: 'visitante', equipo: visita, cantidad: datos.goles_visitante ?? 0 },
    ] as const
  ).filter((l) => esEquipoAYB(l.equipo));

  // Al intercambiar local y visita, cada gol sigue a su equipo
  const intercambiar = () => {
    setEquipos([visita, local]);
    setGoles((g) => ({
      local: g.visitante.map((x) => ({ ...x, lado: 'local' })),
      visitante: g.local.map((x) => ({ ...x, lado: 'visitante' })),
    }));
  };

  const set = <K extends keyof ActividadInput>(campo: K, valor: ActividadInput[K]) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  const toggleSerie = (serie: string) =>
    set('series', datos.series.includes(serie) ? datos.series.filter((s) => s !== serie) : [...datos.series, serie]);

  // El rival del catálogo es el lado que no es de AYB (la visita por defecto)
  const ladoRival = esEquipoAYB(visita) && !esEquipoAYB(local) ? 'local' : 'visita';

  const elegirRival = (rivalId: string) => {
    const r = rivales.find((x) => x.id === rivalId);
    set('rival_id', r?.id ?? null);
    if (!r) return;
    setEquipos(ladoRival === 'local' ? [r.sigla, visita] : [local, r.sigla]);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const rival = local.trim() && visita.trim() ? `${local.trim().toUpperCase()} VS ${visita.trim().toUpperCase()}` : null;
      // Si se editó la sigla a mano y ya no coincide con el rival elegido, se suelta el vínculo
      const elegido = rivales.find((r) => r.id === datos.rival_id);
      const siglaRival = (ladoRival === 'local' ? local : visita).trim().toUpperCase();
      const rival_id = elegido && elegido.sigla.toUpperCase() === siglaRival ? elegido.id : null;
      const detalleGoles = estadoGoles === 'listo' ? golesAGuardar(goles, ladosAYB) : null;
      const guardada = await guardarActividad(id, { ...datos, rival, rival_id, estadio: datos.estadio.toUpperCase() }, detalleGoles);
      toast.success(id ? 'Actividad actualizada' : 'Actividad creada');
      onGuardada(guardada);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      {/* Tipo */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => set('tipo', t.value)}
            className={cn(
              'rounded-md py-2 text-sm font-medium transition-colors',
              datos.tipo === t.value ? 'bg-white text-azul-primario shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Campo label="Fecha *" htmlFor="fecha" className="col-span-2 sm:col-span-1">
          <input id="fecha" type="date" required value={datos.fecha} onChange={(e) => set('fecha', e.target.value)} className={inputClass} />
        </Campo>
        <Campo label="Hora de inicio" htmlFor="hora_inicio">
          <input id="hora_inicio" type="time" value={datos.hora_inicio?.slice(0, 5) ?? ''} onChange={(e) => set('hora_inicio', e.target.value || null)} className={inputClass} />
        </Campo>
        <Campo label="Hora de término" htmlFor="hora_fin">
          <input id="hora_fin" type="time" value={datos.hora_fin?.slice(0, 5) ?? ''} onChange={(e) => set('hora_fin', e.target.value || null)} className={inputClass} />
        </Campo>
      </div>

      {datos.tipo === 'partido' && (
        <>
          {rivales.length > 0 && (
            <Campo label="Rival guardado" htmlFor="rival_id" ayuda="Rellena la sigla y muestra su logo en el sitio. Administra la lista en Rivales.">
              <select id="rival_id" value={datos.rival_id ?? ''} onChange={(e) => elegirRival(e.target.value)} className={inputClass}>
                <option value="">Otro (escribir a mano)</option>
                {rivales.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre} ({r.sigla})</option>
                ))}
              </select>
            </Campo>
          )}
          <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_auto_1fr]">
            <Campo label="Local *" htmlFor="local">
              <input id="local" required value={local} onChange={(e) => setEquipos([e.target.value, visita])} placeholder="AYB" className={inputClass} />
            </Campo>
            <button
              type="button"
              onClick={intercambiar}
              title="Intercambiar local y visita"
              className="mb-0.5 flex h-10 w-full items-center justify-center rounded-md border border-gray-300 text-gray-500 sm:h-auto sm:w-auto sm:p-2.5 hover:border-azul-claro hover:text-azul-primario"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <Campo label="Visita *" htmlFor="visita">
              <input id="visita" required value={visita} onChange={(e) => setEquipos([local, e.target.value])} placeholder="CLUB RIVAL" className={inputClass} />
            </Campo>
          </div>
          <p className="-mt-3 text-xs text-gray-500">
            Nuestros equipos (AYB, AYB35, SERIE HONOR…) se muestran con el escudo del club.
          </p>
          <Campo label="Resultado" ayuda="Déjalo vacío hasta que se juegue el partido. Goles en el mismo orden: local – visita.">
            <div className="flex items-center gap-2">
              <input
                aria-label={`Goles de ${local || 'local'}`}
                type="number"
                min={0}
                max={99}
                inputMode="numeric"
                value={datos.goles_local ?? ''}
                onChange={(e) => set('goles_local', e.target.value === '' ? null : Number(e.target.value))}
                placeholder={local || 'Local'}
                className={cn(inputClass, 'w-24 text-center')}
              />
              <span className="text-gray-400">–</span>
              <input
                aria-label={`Goles de ${visita || 'visita'}`}
                type="number"
                min={0}
                max={99}
                inputMode="numeric"
                value={datos.goles_visitante ?? ''}
                onChange={(e) => set('goles_visitante', e.target.value === '' ? null : Number(e.target.value))}
                placeholder={visita || 'Visita'}
                className={cn(inputClass, 'w-24 text-center')}
              />
            </div>
          </Campo>
          {datos.goles_local !== null && datos.goles_visitante !== null && (
            <GolesPartido
              lados={ladosAYB}
              goles={goles}
              onChange={cambiarGol}
              jugadores={jugadores}
              series={datos.series}
              estado={estadoGoles}
            />
          )}
          <Campo label="Tipo de partido" htmlFor="tipo_partido">
            <select
              id="tipo_partido"
              value={datos.tipo_partido ?? ''}
              onChange={(e) => set('tipo_partido', (e.target.value || null) as ActividadInput['tipo_partido'])}
              className={inputClass}
            >
              <option value="">Sin especificar</option>
              {TIPOS_PARTIDO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Campo>
        </>
      )}

      {datos.tipo === 'entrenamiento' && (
        <Campo label="Actividad" htmlFor="actividad" ayuda="Por defecto: ENTRENAMIENTO">
          <input id="actividad" value={datos.actividad ?? ''} onChange={(e) => set('actividad', e.target.value)} placeholder="ENTRENAMIENTO" className={inputClass} />
        </Campo>
      )}

      {datos.tipo === 'evento' && (
        <>
          <Campo label="Título *" htmlFor="titulo">
            <input id="titulo" required value={datos.titulo ?? ''} onChange={(e) => set('titulo', e.target.value)} placeholder="Jornada Deportiva Azul y Blanco" className={inputClass} />
          </Campo>
          <Campo label="Descripción" htmlFor="descripcion">
            <textarea id="descripcion" rows={3} value={datos.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} className={textareaClass} />
          </Campo>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Precio de entrada" htmlFor="precio_entrada" ayuda="Ej: 2.000">
              <input id="precio_entrada" value={datos.precio_entrada ?? ''} onChange={(e) => set('precio_entrada', e.target.value)} className={inputClass} />
            </Campo>
            <Campo label="Entrada liberada" htmlFor="edad_gratis" ayuda="Ej: Niños menores de 12 años">
              <input id="edad_gratis" value={datos.edad_gratis ?? ''} onChange={(e) => set('edad_gratis', e.target.value)} className={inputClass} />
            </Campo>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Lugar" htmlFor="estadio">
          <input
            id="estadio"
            list="lugares-conocidos"
            value={datos.estadio}
            onChange={(e) => set('estadio', e.target.value)}
            placeholder="ESTADIO ANFA"
            className={inputClass}
          />
          <datalist id="lugares-conocidos">
            {lugares.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Campo>
        {datos.tipo !== 'evento' && (
          <Campo label="Cuota a llevar" htmlFor="llevar" ayuda="Monto por jugador, ej: 2.000">
            <input id="llevar" value={datos.llevar ?? ''} onChange={(e) => set('llevar', e.target.value)} className={inputClass} />
          </Campo>
        )}
      </div>

      <Campo label="Series que participan">
        <div className="flex flex-wrap gap-2">
          {SERIES_OPCIONES.map((serie) => {
            const activa = datos.series.includes(serie);
            return (
              <button
                key={serie}
                type="button"
                onClick={() => toggleSerie(serie)}
                aria-pressed={activa}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-sm transition-colors sm:px-3 sm:py-1',
                  activa ? 'border-azul-claro bg-azul-claro text-white' : 'border-gray-300 text-gray-700 hover:border-azul-claro'
                )}
              >
                {serie}
              </button>
            );
          })}
        </div>
      </Campo>

      <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
        <Interruptor
          checked={datos.confirmado}
          onChange={(v) => set('confirmado', v)}
          label="Confirmado"
          descripcion="Si no, se muestra como «por confirmar»"
        />
        <Interruptor
          checked={datos.publicado}
          onChange={(v) => set('publicado', v)}
          label="Visible en el sitio"
          descripcion="Desactívalo para guardarlo como borrador"
        />
      </div>

      <BarraAcciones dialogo>
        <Button type="button" variant="outline" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando && <Loader2 className="animate-spin" />}
          {id ? 'Guardar cambios' : 'Crear actividad'}
        </Button>
      </BarraAcciones>
    </form>
  );
}
