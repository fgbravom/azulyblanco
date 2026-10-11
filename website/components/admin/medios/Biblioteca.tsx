'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, ImageIcon, Loader2, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Medio } from '@/lib/contenido/tipos';
import { subirImagen, formatearBytes } from '@/lib/admin/subir-imagen';
import { eliminarMedio, listarMedios, registrarMedio } from '@/app/(admin)/admin/medios/actions';
import { inputClass, Vacio, formatearFecha } from '@/components/admin/ui';
import ZonaSubida from './ZonaSubida';

interface Props {
  /** gestion: copiar URL y eliminar. seleccion: hacer clic para elegir */
  modo: 'gestion' | 'seleccion';
  iniciales?: Medio[];
  onSeleccionar?: (medio: Medio) => void;
}

export default function Biblioteca({ modo, iniciales, onSeleccionar }: Props) {
  const [medios, setMedios] = useState<Medio[] | null>(iniciales ?? null);
  const [busqueda, setBusqueda] = useState('');
  const [progreso, setProgreso] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    if (iniciales) return;
    listarMedios()
      .then(setMedios)
      .catch((e: Error) => {
        toast.error(e.message);
        setMedios([]);
      });
  }, [iniciales]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return (medios ?? []).filter((m) => !q || m.nombre.toLowerCase().includes(q));
  }, [medios, busqueda]);

  const subir = async (archivos: File[]) => {
    const nuevos: Medio[] = [];
    for (const [i, archivo] of archivos.entries()) {
      setProgreso(archivos.length > 1 ? `Subiendo ${i + 1} de ${archivos.length}…` : 'Subiendo…');
      try {
        const subida = await subirImagen(archivo, { tipo: 'biblioteca' });
        nuevos.push(await registrarMedio(subida));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Error al subir ${archivo.name}`);
      }
    }
    setProgreso(null);
    if (nuevos.length > 0) {
      setMedios((prev) => [...nuevos.reverse(), ...(prev ?? [])]);
      toast.success(nuevos.length === 1 ? 'Imagen subida' : `${nuevos.length} imágenes subidas`);
      // En modo selección, una imagen recién subida se elige de inmediato
      if (modo === 'seleccion' && nuevos.length === 1) onSeleccionar?.(nuevos[0]);
    }
  };

  const copiar = async (medio: Medio) => {
    await navigator.clipboard.writeText(medio.url);
    setCopiado(medio.id);
    setTimeout(() => setCopiado(null), 1500);
  };

  const eliminar = async (medio: Medio) => {
    if (!confirm(`¿Eliminar "${medio.nombre}"? Si se usa en alguna noticia o ficha, dejará de verse.`)) return;
    try {
      await eliminarMedio(medio.id);
      setMedios((prev) => (prev ?? []).filter((m) => m.id !== medio.id));
      toast.success('Imagen eliminada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-5">
      <ZonaSubida onArchivos={subir} multiple={modo === 'gestion'} progreso={progreso} />

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre"
          className={cn(inputClass, 'pl-9')}
        />
      </div>

      {medios === null ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-azul-claro" />
        </div>
      ) : visibles.length === 0 ? (
        <Vacio
          icono={ImageIcon}
          titulo={busqueda ? 'Sin resultados' : 'Aún no hay imágenes'}
          descripcion={busqueda ? 'Prueba con otro nombre.' : 'Sube la primera con la zona de arriba.'}
        />
      ) : (
        <ul
          className={cn(
            'grid gap-4',
            modo === 'seleccion'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          )}
        >
          {visibles.map((medio) => (
            <li key={medio.id} className="group overflow-hidden rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                disabled={modo !== 'seleccion'}
                onClick={() => onSeleccionar?.(medio)}
                className={cn(
                  'block aspect-square w-full bg-gray-100',
                  modo === 'seleccion' && 'cursor-pointer ring-azul-claro ring-offset-2 hover:ring-2 focus-visible:ring-2 focus-visible:outline-none'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={medio.url} alt={medio.nombre} loading="lazy" className="h-full w-full object-cover" />
              </button>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-gray-800" title={medio.nombre}>
                  {medio.nombre}
                </p>
                <p className="text-[11px] text-gray-500">
                  {medio.ancho && medio.alto ? `${medio.ancho}×${medio.alto} · ` : ''}
                  {formatearBytes(medio.bytes)} · {formatearFecha(medio.created_at)}
                </p>
                {modo === 'gestion' && (
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => copiar(medio)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:border-azul-claro hover:text-azul-primario"
                    >
                      {copiado === medio.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiado === medio.id ? 'Copiada' : 'Copiar URL'}
                    </button>
                    <button
                      onClick={() => eliminar(medio)}
                      aria-label={`Eliminar ${medio.nombre}`}
                      className="rounded-md border border-gray-200 px-2 py-1 text-gray-500 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
