'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, Loader2, Trash2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIAS_NOTICIA, type NoticiaDB, type NoticiaInput, type Redactor } from '@/lib/contenido/tipos';
import { parseTags, slugify } from '@/lib/admin/slug';
import { eliminarNoticia, guardarNoticia } from '@/app/(admin)/admin/noticias/actions';
import { BarraAcciones, Campo, EstadoBadge, Interruptor, PageHeader, Panel, inputClass, textareaClass } from '@/components/admin/ui';
import AvisoDespublicacion from './AvisoDespublicacion';
import MotivoDespublicacion from './MotivoDespublicacion';
import SelectorImagen from '@/components/admin/medios/SelectorImagen';
import Encuadre, { type MarcoEncuadre } from '@/components/admin/medios/Encuadre';
import EditorMarkdown from '@/components/admin/editor/EditorMarkdown';
import { FOCO_CENTRO, type RecorteFoto } from '@/lib/contenido/foco';

/** Lugares donde se recorta la portada de una noticia, con su proporción real */
const MARCOS_PORTADA: MarcoEncuadre[] = [
  { etiqueta: 'En el artículo', clase: 'aspect-video rounded-lg' },
  { etiqueta: 'En las tarjetas del inicio', clase: 'aspect-[3/4] rounded-lg', ancho: 'w-28' },
];

function desdeNoticia(n: NoticiaDB | null): NoticiaInput {
  if (n) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, despublicacion, ...resto } = n;
    return {
      ...resto,
      // Una fila anterior a la migración 017 no trae encuadre: parte del centro
      portada_foco_x: resto.portada_foco_x ?? FOCO_CENTRO.x,
      portada_foco_y: resto.portada_foco_y ?? FOCO_CENTRO.y,
    };
  }
  return {
    slug: '',
    titulo: '',
    bajada: '',
    contenido: '',
    categoria: 'Institucional',
    tags: [],
    autor: null,
    redactor_id: null,
    fecha: new Date().toLocaleDateString('sv-SE'),
    portada_url: null,
    portada_foco_x: FOCO_CENTRO.x,
    portada_foco_y: FOCO_CENTRO.y,
    publicado: false,
  };
}

// Noticia antigua firmada con un nombre que no está en el catálogo
const AUTOR_TEXTO = '__texto';

interface Props {
  noticia: NoticiaDB | null;
  /** Catálogo para elegir autor (solo el admin; un redactor firma siempre como él mismo) */
  redactores: Redactor[];
  rol?: 'admin' | 'colaborador';
  /** Nombre del redactor que escribe, para mostrarlo como autor fijo */
  nombreRedactor?: string;
}

export default function NoticiaEditor({ noticia, redactores, rol = 'admin', nombreRedactor }: Props) {
  const router = useRouter();
  const [datos, setDatos] = useState<NoticiaInput>(() => desdeNoticia(noticia));
  const [tags, setTags] = useState(() => (noticia?.tags ?? []).join(', '));
  // Mientras no se edite a mano, el slug sigue al título (solo en noticias nuevas)
  const [slugManual, setSlugManual] = useState(Boolean(noticia));
  const [guardando, setGuardando] = useState(false);
  const [sinGuardar, setSinGuardar] = useState(false);
  const esAdmin = rol === 'admin';
  // Si la noticia está publicada en la base, despublicarla (siendo redactor) exige un motivo
  const [publicadaGuardada, setPublicadaGuardada] = useState(Boolean(noticia?.publicado));
  const [pidiendoMotivo, setPidiendoMotivo] = useState(false);

  const set = <K extends keyof NoticiaInput>(campo: K, valor: NoticiaInput[K]) => {
    setSinGuardar(true);
    setDatos((d) => ({ ...d, [campo]: valor }));
  };

  const guardar = async (publicado = datos.publicado, motivoDespublicacion?: string) => {
    setGuardando(true);
    try {
      const guardada = await guardarNoticia(
        noticia?.id ?? null,
        { ...datos, publicado, tags: parseTags(tags) },
        motivoDespublicacion ? { motivoDespublicacion } : undefined
      );
      setDatos(desdeNoticia(guardada));
      setPublicadaGuardada(guardada.publicado);
      setSinGuardar(false);
      toast.success(publicado ? 'Noticia publicada' : 'Borrador guardado');
      if (!noticia) router.replace(`/admin/noticias/${guardada.id}`);
      else router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  const solicitarGuardado = () => {
    if (!esAdmin && publicadaGuardada && !datos.publicado) setPidiendoMotivo(true);
    else guardar();
  };

  const redactor = redactores.find((r) => r.id === datos.redactor_id);

  // La portada se mueve con el mismo recorte en el artículo y en las tarjetas
  const recortePortada: RecorteFoto = { x: datos.portada_foco_x, y: datos.portada_foco_y, ancho: null };

  const elegirRedactor = (valor: string) => {
    if (valor === AUTOR_TEXTO) return;
    const r = redactores.find((x) => x.id === valor);
    set('redactor_id', r?.id ?? null);
    set('autor', r?.nombre ?? null);
  };

  const eliminar = async () => {
    if (!noticia || !confirm(`¿Eliminar la noticia "${noticia.titulo}"? No se puede deshacer.`)) return;
    try {
      await eliminarNoticia(noticia.id);
      toast.success('Noticia eliminada');
      router.push('/admin/noticias');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        solicitarGuardado();
      }}
    >
      <PageHeader
        titulo={noticia ? 'Editar noticia' : 'Nueva noticia'}
        descripcion={noticia ? <EstadoBadge publicado={noticia.publicado} /> : 'Se guarda como borrador hasta que la publiques.'}
        volver={
          <Link href="/admin/noticias" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-azul-primario">
            <ArrowLeft className="h-4 w-4" /> Noticias
          </Link>
        }
        acciones={
          <>
            {noticia?.publicado && (
              <Button variant="outline" asChild>
                <a href={`/noticias/${noticia.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink /> Ver en el sitio
                </a>
              </Button>
            )}
            {/* En móvil el guardado vive en la barra fija del pie (BarraAcciones) */}
            <Button type="submit" disabled={guardando} className="hidden sm:inline-flex">
              {guardando && <Loader2 className="animate-spin" />}
              Guardar{sinGuardar ? ' cambios' : ''}
            </Button>
          </>
        }
      />

      {esAdmin && noticia && !noticia.publicado && noticia.despublicacion && (
        <AvisoDespublicacion despublicacion={noticia.despublicacion} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Panel>
            <div className="space-y-5">
              <Campo label="Título *" htmlFor="titulo">
                <input
                  id="titulo"
                  required
                  value={datos.titulo}
                  onChange={(e) => {
                    set('titulo', e.target.value);
                    if (!slugManual) set('slug', slugify(e.target.value));
                  }}
                  className={`${inputClass} h-12 text-lg font-semibold`}
                  placeholder="Título de la noticia"
                />
              </Campo>
              <Campo label="Bajada" htmlFor="bajada" ayuda="Resumen corto que aparece en las tarjetas y bajo el título.">
                <textarea id="bajada" rows={2} value={datos.bajada} onChange={(e) => set('bajada', e.target.value)} className={textareaClass} />
              </Campo>
              <Campo label="Contenido">
                <EditorMarkdown
                  value={datos.contenido}
                  onChange={(v) => set('contenido', v)}
                  placeholder="Escribe la noticia aquí…"
                />
              </Campo>
            </div>
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel titulo="Publicación">
            <div className="space-y-4">
              <Interruptor
                checked={datos.publicado}
                onChange={(v) => set('publicado', v)}
                label="Publicada"
                descripcion={datos.publicado ? 'Visible en el sitio al guardar' : 'Solo visible en el admin'}
              />
              <Campo label="Fecha" htmlFor="fecha">
                <input id="fecha" type="date" required value={datos.fecha} onChange={(e) => set('fecha', e.target.value)} className={inputClass} />
              </Campo>
              {!datos.publicado && (
                <Button type="button" variant="secondary" className="hidden w-full sm:inline-flex" disabled={guardando} onClick={() => guardar(true)}>
                  Guardar y publicar
                </Button>
              )}
            </div>
          </Panel>

          <Panel titulo="Portada">
            <SelectorImagen
              value={datos.portada_url}
              recorte={recortePortada}
              onChange={(url) => {
                // Una foto nueva parte del centro
                set('portada_url', url);
                set('portada_foco_x', FOCO_CENTRO.x);
                set('portada_foco_y', FOCO_CENTRO.y);
              }}
            />
            {datos.portada_url && (
              <Encuadre
                url={datos.portada_url}
                recorte={recortePortada}
                onChange={(recorte) => {
                  set('portada_foco_x', recorte.x);
                  set('portada_foco_y', recorte.y);
                }}
                marcos={MARCOS_PORTADA}
              />
            )}
          </Panel>

          <Panel titulo="Detalles">
            <div className="space-y-4">
              <Campo label="Categoría" htmlFor="categoria">
                <input
                  id="categoria"
                  list="categorias-noticia"
                  required
                  value={datos.categoria}
                  onChange={(e) => set('categoria', e.target.value)}
                  className={inputClass}
                />
                <datalist id="categorias-noticia">
                  {CATEGORIAS_NOTICIA.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Campo>
              {!esAdmin ? (
                <Campo label="Autor" ayuda="Firmas siempre con tu nombre.">
                  <div className="flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
                    <UserRound className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{nombreRedactor || datos.autor}</span>
                  </div>
                </Campo>
              ) : redactores.length > 0 ? (
                <Campo
                  label="Autor"
                  htmlFor="redactor_id"
                  ayuda={
                    <>
                      Administra la lista en{' '}
                      <Link href="/admin/redactores" className="text-azul-claro hover:underline">
                        Redactores
                      </Link>
                    </>
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                      {redactor?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={redactor.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <select
                      id="redactor_id"
                      value={datos.redactor_id ?? (datos.autor ? AUTOR_TEXTO : '')}
                      onChange={(e) => elegirRedactor(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Sin firma</option>
                      {!datos.redactor_id && datos.autor && <option value={AUTOR_TEXTO}>{datos.autor} (sin avatar)</option>}
                      {redactores.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </Campo>
              ) : (
                <Campo
                  label="Autor"
                  htmlFor="autor"
                  ayuda={
                    <>
                      Para firmar con avatar, agrega redactores en{' '}
                      <Link href="/admin/redactores" className="text-azul-claro hover:underline">
                        Redactores
                      </Link>
                    </>
                  }
                >
                  <input id="autor" value={datos.autor ?? ''} onChange={(e) => set('autor', e.target.value)} className={inputClass} />
                </Campo>
              )}
              <Campo label="Etiquetas" htmlFor="tags" ayuda="Separadas por coma">
                <input
                  id="tags"
                  value={tags}
                  onChange={(e) => {
                    setTags(e.target.value);
                    setSinGuardar(true);
                  }}
                  placeholder="aniversario, club"
                  className={inputClass}
                />
              </Campo>
              <Campo label="Dirección" htmlFor="slug" ayuda={`/noticias/${datos.slug || '…'}`}>
                <input
                  id="slug"
                  value={datos.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    // Normalización suave para poder escribir guiones; el servidor aplica slugify completo
                    set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                  }}
                  className={`${inputClass} font-mono text-xs`}
                />
              </Campo>
            </div>
          </Panel>

          {noticia && esAdmin && (
            <Button type="button" variant="ghost" onClick={eliminar} className="w-full text-red-600 hover:bg-red-50 hover:text-red-700">
              <Trash2 /> Eliminar noticia
            </Button>
          )}
        </aside>
      </div>

      <BarraAcciones className="mt-6 sm:hidden">
        {!datos.publicado && (
          <Button type="button" variant="secondary" disabled={guardando} onClick={() => guardar(true)}>
            Guardar y publicar
          </Button>
        )}
        <Button type="submit" disabled={guardando}>
          {guardando && <Loader2 className="animate-spin" />}
          Guardar{sinGuardar ? ' cambios' : ''}
        </Button>
      </BarraAcciones>

      {pidiendoMotivo && (
        <MotivoDespublicacion
          titulo={datos.titulo}
          onConfirmar={async (motivo) => {
            setPidiendoMotivo(false);
            await guardar(false, motivo);
          }}
          onCancelar={() => setPidiendoMotivo(false)}
        />
      )}
    </form>
  );
}
