'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Pencil, PenLine, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Redactor } from '@/lib/contenido/tipos';
import { eliminarRedactor } from '@/app/(admin)/admin/redactores/actions';
import { PageHeader, Vacio } from '@/components/admin/ui';
import RedactorForm from './RedactorForm';

function inicialesDe(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export default function RedactoresAdmin({ iniciales }: { iniciales: Redactor[] }) {
  const [redactores, setRedactores] = useState(iniciales);
  const [editor, setEditor] = useState<{ redactor: Redactor | null } | null>(null);

  const guardado = (redactor: Redactor) => {
    setRedactores((prev) =>
      [...prev.filter((r) => r.id !== redactor.id), redactor].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    setEditor(null);
  };

  const eliminar = async (r: Redactor) => {
    if (!confirm(`¿Eliminar a "${r.nombre}"? Sus noticias conservan la firma, pero sin avatar.`)) return;
    try {
      await eliminarRedactor(r.id);
      setRedactores((prev) => prev.filter((x) => x.id !== r.id));
      toast.success('Redactor eliminado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  return (
    <>
      <PageHeader
        titulo="Redactores"
        descripcion="Quienes firman las noticias, con su avatar. Se eligen al escribir una noticia."
        acciones={
          <Button onClick={() => setEditor({ redactor: null })}>
            <Plus /> Nuevo redactor
          </Button>
        }
      />

      {redactores.length === 0 ? (
        <Vacio
          icono={PenLine}
          titulo="No hay redactores guardados"
          descripcion="Guarda a quienes escriben las noticias para firmarlas con su nombre y avatar."
          accion={
            <Button onClick={() => setEditor({ redactor: null })}>
              <Plus /> Nuevo redactor
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {redactores.map((r) => (
            <li key={r.id} className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                {r.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatar_url} alt={`Avatar de ${r.nombre}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-400">{inicialesDe(r.nombre)}</span>
                )}
              </div>
              <p className="min-w-0 flex-1 truncate font-semibold text-gray-900">{r.nombre}</p>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditor({ redactor: r })}>
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
            <DialogTitle className="text-azul-primario">{editor?.redactor ? 'Editar redactor' : 'Nuevo redactor'}</DialogTitle>
          </DialogHeader>
          {editor && (
            <RedactorForm
              key={editor.redactor?.id ?? 'nuevo'}
              redactor={editor.redactor}
              onGuardado={guardado}
              onCancelar={() => setEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
