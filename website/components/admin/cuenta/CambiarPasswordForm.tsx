'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cambiarMiPassword } from '@/app/(admin)/admin/cuenta/actions';
import { BarraAcciones, Campo, Panel, inputClass } from '@/components/admin/ui';

interface Props {
  nombre: string;
  usuario: string;
  /** Tiene una contraseña temporal: debe cambiarla antes de seguir */
  debeCambiar: boolean;
  /** Panel del avatar, entre los datos de acceso y la contraseña */
  avatar?: React.ReactNode;
}

export default function CambiarPasswordForm({ nombre, usuario, debeCambiar, avatar }: Props) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (nueva !== confirmacion) {
      setError('La confirmación no coincide con la nueva contraseña');
      return;
    }
    setGuardando(true);
    try {
      await cambiarMiPassword(actual, nueva);
      toast.success('Contraseña actualizada');
      // La cookie se volvió a emitir: navegación completa, como en el login
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a propósito: el panel debe armarse de cero
      window.location.assign('/admin/noticias');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-xl space-y-5">
      {debeCambiar && (
        <div role="alert" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Ingresaste con una contraseña temporal. Debes cambiarla antes de seguir usando el panel.</p>
        </div>
      )}

      <Panel titulo="Datos de acceso">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">Nombre</dt>
          <dd className="text-gray-900">{nombre}</dd>
          <dt className="text-gray-500">Usuario</dt>
          <dd className="break-all font-mono text-gray-900">{usuario}</dd>
        </dl>
      </Panel>

      {avatar}

      <form onSubmit={enviar}>
        <Panel titulo="Cambiar contraseña" descripcion="Mínimo 10 caracteres.">
          <div className="space-y-4">
            {/* Ayuda a los gestores de contraseñas a asociar el cambio con el usuario */}
            <input type="text" name="username" value={usuario} autoComplete="username" readOnly hidden />
            <Campo label="Contraseña actual" htmlFor="actual">
              <input
                id="actual"
                type="password"
                required
                autoComplete="current-password"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className={inputClass}
              />
            </Campo>
            <Campo label="Nueva contraseña" htmlFor="nueva">
              <input
                id="nueva"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                className={inputClass}
              />
            </Campo>
            <Campo label="Repite la nueva contraseña" htmlFor="confirmacion" error={error || undefined}>
              <input
                id="confirmacion"
                type="password"
                required
                autoComplete="new-password"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                className={inputClass}
              />
            </Campo>
            <BarraAcciones>
              <Button type="submit" disabled={guardando}>
                {guardando && <Loader2 className="animate-spin" />}
                Cambiar contraseña
              </Button>
            </BarraAcciones>
          </div>
        </Panel>
      </form>
    </div>
  );
}
