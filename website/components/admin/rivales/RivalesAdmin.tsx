'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Pencil, Plus, Swords, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Rival } from '@/lib/contenido/tipos';
import { eliminarRival } from '@/app/(admin)/admin/rivales/actions';
import { PageHeader, Vacio } from '@/components/admin/ui';
import RivalForm from './RivalForm';

export default function RivalesAdmin({ iniciales }: { iniciales: Rival[] }) {
  const [rivales, setRivales] = useState(iniciales);
  const [editor, setEditor] = useState<{ rival: Rival | null } | null>(null);

  const guardado = (rival: Rival) => {
    setRivales((prev) => [...prev.filter((r) => r.id !== rival.id), rival].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setEditor(null);
  };

  const eliminar = async (r: Rival) => {
    if (!confirm(`¿Eliminar a "${r.nombre}"? Los partidos que lo usaban conservan el texto del rival.`)) return;
    try {
      await eliminarRival(r.id);
      setRivales((prev) => prev.filter((x) => x.id !== r.id));
      toast.success('Rival eliminado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  return (
    <>
      <PageHeader
        titulo="Rivales"
        descripcion="Equipos rivales con su sigla, logo y sitio web. Se eligen al crear un partido."
        acciones={
          <Button onClick={() => setEditor({ rival: null })}>
            <Plus /> Nuevo rival
          </Button>
        }
      />

      {rivales.length === 0 ? (
        <Vacio
          icono={Swords}
          titulo="No hay rivales guardados"
          descripcion="Guarda los clubes contra los que juega el club para elegirlos rápido al programar un partido."
          accion={
            <Button onClick={() => setEditor({ rival: null })}>
              <Plus /> Nuevo rival
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {rivales.map((r) => (
            <li key={r.id} className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                {r.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.logo_url} alt={`Logo de ${r.nombre}`} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-sm font-bold text-gray-400">{r.sigla.substring(0, 3).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">
                  {r.nombre} <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">{r.sigla}</span>
                </p>
                {r.sitio_web && (
                  <a
                    href={r.sitio_web}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-azul-claro hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" /> {r.sitio_web.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditor({ rival: r })}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" title="Eliminar" onClick={() => eliminar(r)} className="hover:text-red-600">
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editor !== null} onOpenChange={(abierto) => !abierto && setEditor(null)}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-azul-primario">{editor?.rival ? 'Editar rival' : 'Nuevo rival'}</DialogTitle>
          </DialogHeader>
          {editor && (
            <RivalForm key={editor.rival?.id ?? 'nuevo'} rival={editor.rival} onGuardado={guardado} onCancelar={() => setEditor(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
