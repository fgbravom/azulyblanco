'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Loader2, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORIAS_ALBUM, type AlbumDB, type AlbumInput, type CategoriaAlbum, type Foto } from '@/lib/contenido/tipos';
import { parseTags } from '@/lib/admin/slug';
import { subirImagen } from '@/lib/admin/subir-imagen';
import {
  actualizarDescripcionFoto,
  agregarFotos,
  definirPortada,
  eliminarAlbum,
  eliminarFotos,
  guardarAlbum,
  reordenarFotos,
} from '@/app/(admin)/admin/galeria/actions';
import { Campo, EstadoBadge, Interruptor, PageHeader, Panel, inputClass, textareaClass } from '@/components/admin/ui';
import ZonaSubida from '@/components/admin/medios/ZonaSubida';

function desdeAlbum(a: AlbumDB): AlbumInput {
  return {
    slug: a.slug,
    titulo: a.titulo,
    descripcion: a.descripcion,
    categoria: a.categoria,
    fecha: a.fecha,
    tags: a.tags,
    publicado: a.publicado,
  };
}

export default function AlbumEditor({ album: inicial, fotos: fotosIniciales }: { album: AlbumDB; fotos: Foto[] }) {
  const router = useRouter();
  const [album, setAlbum] = useState(inicial);
  const [datos, setDatos] = useState<AlbumInput>(() => desdeAlbum(inicial));
  const [tags, setTags] = useState(inicial.tags.join(', '));
  const [fotos, setFotos] = useState(fotosIniciales);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [progreso, setProgreso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const set = <K extends keyof AlbumInput>(campo: K, valor: AlbumInput[K]) => setDatos((d) => ({ ...d, [campo]: valor }));

  const guardar = async (publicado = datos.publicado) => {
    setGuardando(true);
    try {
      const guardado = await guardarAlbum(album.id, { ...datos, publicado, tags: parseTags(tags) });
      setAlbum(guardado);
      setDatos(desdeAlbum(guardado));
      toast.success(publicado && !album.publicado ? 'Álbum publicado' : 'Álbum guardado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  const subir = async (archivos: File[]) => {
    let subidas = 0;
    for (const [i, archivo] of archivos.entries()) {
      setProgreso(`Subiendo ${i + 1} de ${archivos.length}…`);
      try {
        const subida = await subirImagen(archivo, { tipo: 'album', albumId: album.id });
        const [foto] = await agregarFotos(album.id, [subida]);
        setFotos((prev) => [...prev, foto]);
        setAlbum((a) => (a.portada_url ? a : { ...a, portada_url: foto.url }));
        subidas++;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Error al subir ${archivo.name}`);
      }
    }
    setProgreso(null);
    if (subidas > 0) toast.success(subidas === 1 ? 'Foto agregada' : `${subidas} fotos agregadas`);
  };

  const mover = async (indice: number, delta: -1 | 1) => {
    const destino = indice + delta;
    if (destino < 0 || destino >= fotos.length) return;
    const nuevas = [...fotos];
    [nuevas[indice], nuevas[destino]] = [nuevas[destino], nuevas[indice]];
    setFotos(nuevas);
    try {
      await reordenarFotos(album.id, nuevas.map((f) => f.id));
    } catch (e) {
      setFotos(fotos);
      toast.error(e instanceof Error ? e.message : 'No se pudo reordenar');
    }
  };

  const ponerPortada = async (foto: Foto) => {
    try {
      await definirPortada(album.id, foto.url);
      setAlbum((a) => ({ ...a, portada_url: foto.url }));
      toast.success('Portada actualizada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar la portada');
    }
  };

  const guardarDescripcion = async (foto: Foto, descripcion: string) => {
    if ((foto.descripcion ?? '') === descripcion.trim()) return;
    try {
      await actualizarDescripcionFoto(foto.id, descripcion);
      setFotos((prev) => prev.map((f) => (f.id === foto.id ? { ...f, descripcion: descripcion.trim() || null } : f)));
      toast.success('Descripción guardada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la descripción');
    }
  };

  const borrar = async (ids: string[]) => {
    const texto = ids.length === 1 ? '¿Eliminar esta foto?' : `¿Eliminar ${ids.length} fotos?`;
    if (!confirm(texto)) return;
    try {
      const portada = await eliminarFotos(album.id, ids);
      setFotos((prev) => prev.filter((f) => !ids.includes(f.id)));
      setAlbum((a) => ({ ...a, portada_url: portada }));
      setSeleccion(new Set());
      toast.success(ids.length === 1 ? 'Foto eliminada' : `${ids.length} fotos eliminadas`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  const borrarAlbum = async () => {
    if (!confirm(`¿Eliminar el álbum "${album.titulo}" y sus ${fotos.length} fotos? No se puede deshacer.`)) return;
    try {
      await eliminarAlbum(album.id);
      toast.success('Álbum eliminado');
      router.push('/admin/galeria');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  const alternarSeleccion = (id: string) =>
    setSeleccion((prev) => {
      const nueva = new Set(prev);
      if (nueva.has(id)) nueva.delete(id);
      else nueva.add(id);
      return nueva;
    });

  return (
    <>
      <PageHeader
        titulo={album.titulo}
        descripcion={<EstadoBadge publicado={album.publicado} />}
        volver={
          <Link href="/admin/galeria" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-azul-primario">
            <ArrowLeft className="h-4 w-4" /> Galerías
          </Link>
        }
        acciones={
          <>
            {album.publicado && (
              <Button variant="outline" asChild>
                <a href={`/galeria/${album.categoria}/${album.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink /> Ver en el sitio
                </a>
              </Button>
            )}
            {!album.publicado && (
              <Button onClick={() => guardar(true)} disabled={guardando || fotos.length === 0} title={fotos.length === 0 ? 'Sube al menos una foto' : undefined}>
                Publicar álbum
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        {/* Datos del álbum */}
        <Panel titulo="Datos del álbum" className="h-fit">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              guardar();
            }}
          >
            <Campo label="Título *" htmlFor="titulo">
              <input id="titulo" required value={datos.titulo} onChange={(e) => set('titulo', e.target.value)} className={inputClass} />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Categoría" htmlFor="categoria">
                <select id="categoria" value={datos.categoria} onChange={(e) => set('categoria', e.target.value as CategoriaAlbum)} className={inputClass}>
                  {CATEGORIAS_ALBUM.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Fecha" htmlFor="fecha">
                <input id="fecha" type="date" required value={datos.fecha} onChange={(e) => set('fecha', e.target.value)} className={inputClass} />
              </Campo>
            </div>
            <Campo label="Descripción" htmlFor="descripcion">
              <textarea id="descripcion" rows={4} value={datos.descripcion} onChange={(e) => set('descripcion', e.target.value)} className={textareaClass} />
            </Campo>
            <Campo label="Etiquetas" htmlFor="tags" ayuda="Separadas por coma">
              <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
            </Campo>
            <Campo label="Dirección" htmlFor="slug" ayuda={`/galeria/${datos.categoria}/${datos.slug || '…'}`}>
              <input
                id="slug"
                value={datos.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                className={`${inputClass} font-mono text-xs`}
              />
            </Campo>
            <Interruptor checked={datos.publicado} onChange={(v) => set('publicado', v)} label="Publicado" descripcion="Visible en la galería del sitio" />
            <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
              <Button type="submit" disabled={guardando}>
                {guardando && <Loader2 className="animate-spin" />} Guardar datos
              </Button>
              <Button type="button" variant="ghost" onClick={borrarAlbum} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 /> Eliminar álbum
              </Button>
            </div>
          </form>
        </Panel>

        {/* Fotos */}
        <Panel
          titulo={`Fotos (${fotos.length})`}
          descripcion="La estrella marca la portada. Las flechas cambian el orden en el sitio."
          acciones={
            seleccion.size > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSeleccion(new Set())}>Cancelar</Button>
                <Button variant="destructive" size="sm" onClick={() => borrar(Array.from(seleccion))}>
                  <Trash2 /> Eliminar {seleccion.size}
                </Button>
              </div>
            )
          }
        >
          <ZonaSubida onArchivos={subir} progreso={progreso} className="mb-5" />

          {fotos.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-4">
              {fotos.map((foto, i) => {
                const esPortada = album.portada_url === foto.url;
                const seleccionada = seleccion.has(foto.id);
                return (
                  <li
                    key={foto.id}
                    className={cn(
                      'overflow-hidden rounded-lg border bg-white',
                      seleccionada ? 'border-azul-claro ring-2 ring-azul-claro' : 'border-gray-200'
                    )}
                  >
                    <div className="group relative aspect-square bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={foto.url} alt={foto.descripcion ?? ''} loading="lazy" className="h-full w-full object-cover" />
                      <label className="absolute left-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/90 shadow">
                        <input
                          type="checkbox"
                          checked={seleccionada}
                          onChange={() => alternarSeleccion(foto.id)}
                          aria-label="Seleccionar foto"
                          className="h-4 w-4 accent-azul-claro"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => ponerPortada(foto)}
                        title={esPortada ? 'Portada del álbum' : 'Usar como portada'}
                        className={cn(
                          'absolute right-2 top-2 rounded-full p-1.5 shadow',
                          esPortada ? 'bg-yellow-400 text-white' : 'bg-white/90 text-gray-500 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
                        )}
                      >
                        <Star className={cn('h-4 w-4', esPortada && 'fill-current')} />
                      </button>
                      <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover antes" className="rounded bg-white/90 p-1 shadow disabled:opacity-40">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} aria-label="Mover después" className="rounded bg-white/90 p-1 shadow disabled:opacity-40">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                        <button type="button" onClick={() => borrar([foto.id])} aria-label="Eliminar foto" className="rounded bg-white/90 p-1 text-red-600 shadow">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      defaultValue={foto.descripcion ?? ''}
                      onBlur={(e) => guardarDescripcion(foto, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                      placeholder="Agregar descripción…"
                      className="w-full border-0 border-t border-gray-100 px-2.5 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-azul-pastel/10"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
