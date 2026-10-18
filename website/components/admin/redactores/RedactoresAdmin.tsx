'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, Pencil, PenLine, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CuentaRedactor, Redactor, RedactorConCuenta } from '@/lib/contenido/tipos';
import { eliminarRedactor } from '@/app/(admin)/admin/redactores/actions';
import { MenuAcciones, PageHeader, Vacio } from '@/components/admin/ui';
import AccesoDialog from './AccesoDialog';
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

function EstadoAcceso({ cuenta }: { cuenta: CuentaRedactor | null }) {
  if (!cuenta) return null;
  return (
    <span
      className={
        cuenta.activa
          ? 'rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'
          : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
      }
    >
      {cuenta.activa ? 'Con acceso' : 'Acceso desactivado'}
    </span>
  );
}

export default function RedactoresAdmin({ iniciales }: { iniciales: RedactorConCuenta[] }) {
  const [redactores, setRedactores] = useState(iniciales);
  const [editor, setEditor] = useState<{ redactor: Redactor | null } | null>(null);
  const [accesoId, setAccesoId] = useState<string | null>(null);
  const acceso = redactores.find((r) => r.id === accesoId) ?? null;

  const guardado = (redactor: Redactor) => {
    setRedactores((prev) =>
      [...prev.filter((r) => r.id !== redactor.id), { ...redactor, cuenta: prev.find((r) => r.id === redactor.id)?.cuenta ?? null }].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      )
    );
    setEditor(null);
  };

  const cuentaCambiada = (id: string, cuenta: CuentaRedactor | null) =>
    setRedactores((prev) => prev.map((r) => (r.id === id ? { ...r, cuenta } : r)));

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
        descripcion="Quienes firman las noticias, con su avatar. Pueden tener un acceso para escribir las suyas."
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
            <li
              key={r.id}
              onClick={() => setEditor({ redactor: r })}
              className="flex cursor-pointer items-center gap-3 p-4 active:bg-gray-50 sm:cursor-default sm:gap-4 sm:active:bg-transparent"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                {r.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatar_url} alt={`Avatar de ${r.nombre}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-400">{inicialesDe(r.nombre)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{r.nombre}</p>
                {r.cuenta && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    <EstadoAcceso cuenta={r.cuenta} />
                    <span className="font-mono">{r.cuenta.usuario}</span>
                  </p>
                )}
              </div>
              <div className="hidden shrink-0 items-center gap-1 sm:flex" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" title="Acceso al panel" onClick={() => setAccesoId(r.id)}>
                  <KeyRound />
                </Button>
                <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditor({ redactor: r })}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" title="Eliminar" onClick={() => eliminar(r)} className="hover:text-red-600">
                  <Trash2 />
                </Button>
              </div>
              <MenuAcciones
                className="sm:hidden"
                acciones={[
                  { etiqueta: 'Editar', icono: Pencil, onSelect: () => setEditor({ redactor: r }) },
                  { etiqueta: 'Acceso al panel', icono: KeyRound, onSelect: () => setAccesoId(r.id) },
                  { etiqueta: 'Eliminar', icono: Trash2, onSelect: () => eliminar(r), peligro: true },
                ]}
              />
            </li>
          ))}
        </ul>
      )}

      {acceso && <AccesoDialog key={acceso.id} redactor={acceso} onCuenta={cuentaCambiada} onCerrar={() => setAccesoId(null)} />}

      <Dialog open={editor !== null} onOpenChange={(abierto) => !abierto && setEditor(null)}>
        <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto bg-white">
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
