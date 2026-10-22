'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  guardarCuerpoTecnico,
  guardarSerie,
  type EquipoStaffInput,
  type SerieAdmin,
  type SerieInput,
} from '@/app/(admin)/admin/series/actions';
import { BarraAcciones, Campo, PageHeader, Panel, inputClass, textareaClass } from '@/components/admin/ui';
import SelectorImagen from '@/components/admin/medios/SelectorImagen';
import Encuadre, { type MarcoEncuadre } from '@/components/admin/medios/Encuadre';
import EditorMarkdown from '@/components/admin/editor/EditorMarkdown';
import { recorteDe, FOCO_ARRIBA, type RecorteFoto } from '@/lib/contenido/foco';

const MIEMBROS_STAFF = [
  { campo: 'entrenador', foto: 'entrenador_foto_url', focoX: 'entrenador_foco_x', focoY: 'entrenador_foco_y', focoAncho: 'entrenador_foco_ancho', label: 'Director técnico' },
  { campo: 'asistente_tecnico', foto: 'asistente_tecnico_foto_url', focoX: 'asistente_tecnico_foco_x', focoY: 'asistente_tecnico_foco_y', focoAncho: 'asistente_tecnico_foco_ancho', label: 'Asistente técnico' },
  { campo: 'preparador_fisico', foto: 'preparador_fisico_foto_url', focoX: 'preparador_fisico_foco_x', focoY: 'preparador_fisico_foco_y', focoAncho: 'preparador_fisico_foco_ancho', label: 'Preparador físico' },
] as const;

/** Dónde se recortan las fotos del cuerpo técnico: la ficha de la serie */
const MARCOS_STAFF: MarcoEncuadre[] = [
  { etiqueta: 'En la ficha de la serie', clase: 'aspect-[3/4] rounded-2xl', defecto: FOCO_ARRIBA },
];

export default function SerieEditor({ serie }: { serie: SerieAdmin }) {
  const [datos, setDatos] = useState<SerieInput>({
    titulo: serie.titulo,
    descripcion: serie.descripcion,
    contenido: serie.contenido,
    imagen_url: serie.imagen_url,
    horario_entrenamiento: serie.horario_entrenamiento,
    lugar_entrenamiento: serie.lugar_entrenamiento,
    competencia: serie.competencia,
  });
  const [staff, setStaff] = useState<EquipoStaffInput>({
    temporada: serie.equipo?.temporada ?? '',
    entrenador: serie.equipo?.entrenador ?? null,
    asistente_tecnico: serie.equipo?.asistente_tecnico ?? null,
    preparador_fisico: serie.equipo?.preparador_fisico ?? null,
    entrenador_foto_url: serie.equipo?.entrenador_foto_url ?? null,
    asistente_tecnico_foto_url: serie.equipo?.asistente_tecnico_foto_url ?? null,
    preparador_fisico_foto_url: serie.equipo?.preparador_fisico_foto_url ?? null,
    entrenador_foco_x: serie.equipo?.entrenador_foco_x ?? null,
    entrenador_foco_y: serie.equipo?.entrenador_foco_y ?? null,
    entrenador_foco_ancho: serie.equipo?.entrenador_foco_ancho ?? null,
    asistente_tecnico_foco_x: serie.equipo?.asistente_tecnico_foco_x ?? null,
    asistente_tecnico_foco_y: serie.equipo?.asistente_tecnico_foco_y ?? null,
    asistente_tecnico_foco_ancho: serie.equipo?.asistente_tecnico_foco_ancho ?? null,
    preparador_fisico_foco_x: serie.equipo?.preparador_fisico_foco_x ?? null,
    preparador_fisico_foco_y: serie.equipo?.preparador_fisico_foco_y ?? null,
    preparador_fisico_foco_ancho: serie.equipo?.preparador_fisico_foco_ancho ?? null,
  });
  const [guardando, setGuardando] = useState<'serie' | 'staff' | null>(null);

  const set = <K extends keyof SerieInput>(campo: K, valor: SerieInput[K]) => setDatos((d) => ({ ...d, [campo]: valor }));
  const setS = <K extends keyof EquipoStaffInput>(campo: K, valor: EquipoStaffInput[K]) => setStaff((d) => ({ ...d, [campo]: valor }));

  const guardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando('serie');
    try {
      await guardarSerie(serie.id, datos);
      toast.success('Serie actualizada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(null);
    }
  };

  const guardarStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serie.equipo) return;
    setGuardando('staff');
    try {
      await guardarCuerpoTecnico(serie.id, serie.equipo.id, staff);
      toast.success('Cuerpo técnico actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(null);
    }
  };

  const nombre = datos.titulo || `Serie ${serie.nombre}`;

  return (
    <>
      <PageHeader
        titulo={nombre}
        descripcion="Lo que edites aquí se muestra en la página pública de la serie."
        volver={
          <Link href="/admin/series" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-azul-primario">
            <ArrowLeft className="h-4 w-4" /> Series
          </Link>
        }
        acciones={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/jugadores">
                <Users /> Gestionar plantel
              </Link>
            </Button>
            {serie.slug && (
              <Button variant="outline" asChild>
                <a href={`/series/${serie.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink /> Ver en el sitio
                </a>
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={guardarDatos}>
          <Panel
            titulo="Información de la serie"
            acciones={
              <Button type="submit" size="sm" disabled={guardando === 'serie'} className="hidden lg:inline-flex">
                {guardando === 'serie' && <Loader2 className="animate-spin" />} Guardar
              </Button>
            }
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo label="Nombre visible" htmlFor="titulo">
                  <input id="titulo" value={datos.titulo ?? ''} onChange={(e) => set('titulo', e.target.value)} placeholder={`Serie ${serie.nombre}`} className={inputClass} />
                </Campo>
                <Campo label="Competencia" htmlFor="competencia" ayuda="Liga o torneo en que juega">
                  <input id="competencia" value={datos.competencia ?? ''} onChange={(e) => set('competencia', e.target.value)} className={inputClass} />
                </Campo>
              </div>
              <Campo label="Bajada" htmlFor="descripcion" ayuda="Frase bajo el título en la cabecera de la página">
                <textarea id="descripcion" rows={2} value={datos.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} className={textareaClass} />
              </Campo>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo label="Horario de entrenamiento" htmlFor="horario">
                  <textarea id="horario" rows={2} value={datos.horario_entrenamiento ?? ''} onChange={(e) => set('horario_entrenamiento', e.target.value)} placeholder="Martes y jueves, 20:00" className={textareaClass} />
                </Campo>
                <Campo label="Lugar de entrenamiento" htmlFor="lugar">
                  <textarea id="lugar" rows={2} value={datos.lugar_entrenamiento ?? ''} onChange={(e) => set('lugar_entrenamiento', e.target.value)} placeholder="Estadio ANFA" className={textareaClass} />
                </Campo>
              </div>
              <Campo label="Presentación" ayuda="Historia, logros o lo que quieras contar de la serie. Opcional.">
                <EditorMarkdown value={datos.contenido ?? ''} onChange={(v) => set('contenido', v)} filas={10} />
              </Campo>
            </div>
          </Panel>
          {/* En móvil el guardado queda fijo al pie; en escritorio está en la cabecera del panel */}
          <BarraAcciones className="lg:hidden">
            <Button type="submit" disabled={guardando === 'serie'}>
              {guardando === 'serie' && <Loader2 className="animate-spin" />} Guardar
            </Button>
          </BarraAcciones>
        </form>

        <aside className="min-w-0 space-y-5">
          <Panel titulo="Imagen de cabecera" descripcion="Foto del equipo. Se muestra detrás del título.">
            <SelectorImagen value={datos.imagen_url} onChange={(url) => set('imagen_url', url)} />
            <p className="mt-2 text-xs text-gray-500">Recuerda guardar la información de la serie después de cambiarla.</p>
          </Panel>

          <form onSubmit={guardarStaff}>
            <Panel titulo="Cuerpo técnico" descripcion={serie.equipo ? undefined : 'Esta serie no tiene un equipo activo.'}>
              {serie.equipo ? (
                <div className="space-y-4">
                  <Campo label="Temporada" htmlFor="temporada">
                    <input id="temporada" required value={staff.temporada} onChange={(e) => setS('temporada', e.target.value)} className={inputClass} />
                  </Campo>
                  {MIEMBROS_STAFF.map(({ campo, foto, focoX, focoY, focoAncho, label }) => {
                    const recorte = recorteDe(staff[focoX], staff[focoY], staff[focoAncho]);
                    const setRecorte = (nuevo: RecorteFoto | null) => {
                      setS(focoX, nuevo?.x ?? null);
                      setS(focoY, nuevo?.y ?? null);
                      setS(focoAncho, nuevo?.ancho ?? null);
                    };
                    return (
                      <Campo key={campo} label={label} htmlFor={campo}>
                        <input id={campo} value={staff[campo] ?? ''} onChange={(e) => setS(campo, e.target.value)} className={inputClass} />
                        <SelectorImagen
                          aspecto="cuadrado"
                          className="mt-2"
                          recorte={recorte}
                          value={staff[foto]}
                          onChange={(url) => {
                            setS(foto, url);
                            // Una foto nueva vuelve al recorte automático
                            setRecorte(null);
                          }}
                        />
                        {staff[foto] && (
                          <Encuadre
                            url={staff[foto]!}
                            recorte={recorte}
                            onChange={setRecorte}
                            onQuitar={() => setRecorte(null)}
                            marcos={MARCOS_STAFF}
                          />
                        )}
                      </Campo>
                    );
                  })}
                  <Button type="submit" className="w-full" disabled={guardando === 'staff'}>
                    {guardando === 'staff' && <Loader2 className="animate-spin" />} Guardar cuerpo técnico
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Crea el equipo de la temporada en Supabase para poder asignarle plantel y cuerpo técnico.</p>
              )}
            </Panel>
          </form>
        </aside>
      </div>
    </>
  );
}
