'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Estadio } from '@/lib/contenido/tipos';
import { eliminarEstadio } from '@/app/(admin)/admin/estadios/actions';
import { MenuAcciones, PageHeader, Vacio } from '@/components/admin/ui';
import EstadioForm from './EstadioForm';

export default function EstadiosAdmin({ iniciales }: { iniciales: Estadio[] }) {
  const [estadios, setEstadios] = useState(iniciales);
  const [editor, setEditor] = useState<{ estadio: Estadio | null } | null>(null);

  const guardado = (estadio: Estadio) => {
    setEstadios((prev) => [...prev.filter((e) => e.id !== estadio.id), estadio].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setEditor(null);
  };

  const eliminar = async (e: Estadio) => {
    if (!confirm(`¿Eliminar "${e.nombre}"? Las actividades que lo usaban conservan el lugar escrito.`)) return;
    try {
      await eliminarEstadio(e.id);
      setEstadios((prev) => prev.filter((x) => x.id !== e.id));
      toast.success('Cancha eliminada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  return (
    <>
      <PageHeader
        titulo="Canchas y estadios"
        descripcion="Lugares donde juega el club, con su ubicación y cómo llegar. Se eligen al crear una actividad."
        acciones={
          <Button onClick={() => setEditor({ estadio: null })}>
            <Plus /> Nueva cancha
          </Button>
        }
      />

      {estadios.length === 0 ? (
        <Vacio
          icono={MapPin}
          titulo="No hay canchas guardadas"
          descripcion="Guarda los estadios y canchas donde juega el club para elegirlos rápido al programar."
          accion={
            <Button onClick={() => setEditor({ estadio: null })}>
              <Plus /> Nueva cancha
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {estadios.map((e) => (
            <li
              key={e.id}
              onClick={() => setEditor({ estadio: e })}
              className="flex cursor-pointer items-center gap-3 p-4 active:bg-gray-50 sm:cursor-default sm:gap-4 sm:active:bg-transparent"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{e.nombre}</p>
                {e.ubicacion && <p className="truncate text-xs text-gray-500">{e.ubicacion}</p>}
                {e.mapa_url && (
                  <a
                    href={e.mapa_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(ev) => ev.stopPropagation()}
                    className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-azul-claro hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" /> {e.mapa_url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              <div className="hidden shrink-0 items-center gap-1 sm:flex" onClick={(ev) => ev.stopPropagation()}>
                <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditor({ estadio: e })}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" title="Eliminar" onClick={() => eliminar(e)} className="hover:text-red-600">
                  <Trash2 />
                </Button>
              </div>
              <MenuAcciones
                className="sm:hidden"
                acciones={[
                  { etiqueta: 'Editar', icono: Pencil, onSelect: () => setEditor({ estadio: e }) },
                  { etiqueta: 'Eliminar', icono: Trash2, onSelect: () => eliminar(e), peligro: true },
                ]}
              />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editor !== null} onOpenChange={(abierto) => !abierto && setEditor(null)}>
        <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-azul-primario">
              {editor?.estadio ? 'Editar cancha o estadio' : 'Nueva cancha o estadio'}
            </DialogTitle>
          </DialogHeader>
          {editor && (
            <EstadioForm key={editor.estadio?.id ?? 'nuevo'} estadio={editor.estadio} onGuardado={guardado} onCancelar={() => setEditor(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
