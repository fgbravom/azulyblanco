'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, KeyRound, Loader2, Power, RotateCcw, UserPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CuentaRedactor, RedactorConCuenta } from '@/lib/contenido/tipos';
import {
  cambiarEstadoCuenta,
  cambiarUsuario,
  crearCuenta,
  restablecerPassword,
} from '@/app/(admin)/admin/redactores/actions';
import { Campo, formatearFecha, inputClass } from '@/components/admin/ui';

interface Props {
  redactor: RedactorConCuenta;
  /** Avisa la cuenta resultante (null = sin cuenta) para refrescar el listado */
  onCuenta: (redactorId: string, cuenta: CuentaRedactor | null) => void;
  onCerrar: () => void;
}

/** Contraseña temporal recién generada: se muestra una sola vez */
interface Temporal {
  usuario: string;
  password: string;
}

export default function AccesoDialog({ redactor, onCuenta, onCerrar }: Props) {
  const { cuenta } = redactor;
  const [usuario, setUsuario] = useState('');
  const [cambiando, setCambiando] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [temporal, setTemporal] = useState<Temporal | null>(null);
  const [copiada, setCopiada] = useState(false);

  // Envuelve una acción: bloquea los botones mientras corre y avisa los errores
  const ejecutar = async (accion: () => Promise<void>) => {
    setTrabajando(true);
    try {
      await accion();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo completar la acción');
    } finally {
      setTrabajando(false);
    }
  };

  const crear = (e: React.FormEvent) => {
    e.preventDefault();
    return ejecutar(async () => {
      const res = await crearCuenta(redactor.id, usuario);
      onCuenta(redactor.id, { usuario: res.usuario, activa: true, ultimo_ingreso: null, debe_cambiar_password: true });
      setTemporal({ usuario: res.usuario, password: res.passwordTemporal });
    });
  };

  const renombrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuenta) return;
    return ejecutar(async () => {
      const res = await cambiarUsuario(redactor.id, usuario);
      onCuenta(redactor.id, { ...cuenta, usuario: res.usuario });
      setCambiando(false);
      toast.success('Usuario actualizado');
    });
  };

  const restablecer = () => {
    if (!cuenta) return;
    if (!confirm(`¿Restablecer la contraseña de ${redactor.nombre}? Se cerrará su sesión y tendrá que cambiar la nueva al ingresar.`)) return;
    return ejecutar(async () => {
      const res = await restablecerPassword(redactor.id);
      onCuenta(redactor.id, { ...cuenta, debe_cambiar_password: true });
      setTemporal({ usuario: cuenta.usuario, password: res.passwordTemporal });
    });
  };

  const alternarEstado = () => {
    if (!cuenta) return;
    const activar = !cuenta.activa;
    const pregunta = activar
      ? `¿Reactivar el acceso de ${redactor.nombre}?`
      : `¿Desactivar el acceso de ${redactor.nombre}? Se cerrará su sesión y no podrá ingresar hasta que lo reactives.`;
    if (!confirm(pregunta)) return;
    return ejecutar(async () => {
      await cambiarEstadoCuenta(redactor.id, activar);
      onCuenta(redactor.id, { ...cuenta, activa: activar });
      toast.success(activar ? 'Acceso reactivado' : 'Acceso desactivado');
    });
  };

  const copiar = async () => {
    if (!temporal) return;
    try {
      await navigator.clipboard.writeText(temporal.password);
      setCopiada(true);
      setTimeout(() => setCopiada(false), 2000);
    } catch {
      toast.error('No se pudo copiar: selecciona la contraseña y cópiala a mano');
    }
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-azul-primario">Acceso al panel</DialogTitle>
          <DialogDescription>{redactor.nombre}</DialogDescription>
        </DialogHeader>

        {temporal ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">Entrégasela al redactor; no se volverá a mostrar.</p>
              <p className="mt-1 text-xs text-amber-800">Tendrá que cambiarla la primera vez que ingrese.</p>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Usuario</dt>
                <dd className="font-mono text-base text-gray-900">{temporal.usuario}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Contraseña temporal</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 select-all break-all rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-lg tracking-wide text-gray-900">
                    {temporal.password}
                  </code>
                  <Button type="button" variant="outline" onClick={copiar} className="shrink-0">
                    {copiada ? <Check /> : <Copy />}
                    {copiada ? 'Copiada' : 'Copiar'}
                  </Button>
                </dd>
              </div>
            </dl>
            <Button type="button" className="w-full" onClick={onCerrar}>
              Listo
            </Button>
          </div>
        ) : !cuenta ? (
          <form onSubmit={crear} className="space-y-4">
            <p className="text-sm text-gray-600">
              Este redactor aún no puede ingresar al panel. Con un acceso podrá escribir y publicar sus propias noticias.
            </p>
            <Campo label="Usuario *" htmlFor="usuario-nuevo" ayuda="De 3 a 32 caracteres: letras minúsculas, números, punto, guion o guion bajo.">
              <input
                id="usuario-nuevo"
                required
                autoFocus
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className={inputClass}
                placeholder="ana.perez"
              />
            </Campo>
            <Button type="submit" className="w-full" disabled={trabajando}>
              {trabajando ? <Loader2 className="animate-spin" /> : <KeyRound />}
              Crear acceso
            </Button>
          </form>
        ) : (
          <div className="space-y-5">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Usuario</dt>
              <dd className="break-all font-mono text-gray-900">{cuenta.usuario}</dd>
              <dt className="text-gray-500">Estado</dt>
              <dd className={cuenta.activa ? 'text-green-700' : 'text-gray-600'}>{cuenta.activa ? 'Activo' : 'Desactivado'}</dd>
              <dt className="text-gray-500">Último ingreso</dt>
              <dd className="text-gray-900">{cuenta.ultimo_ingreso ? formatearFecha(cuenta.ultimo_ingreso) : 'Aún no ingresa'}</dd>
              <dt className="text-gray-500">Contraseña</dt>
              <dd className={cuenta.debe_cambiar_password ? 'text-amber-700' : 'text-gray-900'}>
                {cuenta.debe_cambiar_password ? 'Temporal pendiente de cambio' : 'Definida por el redactor'}
              </dd>
            </dl>

            {cambiando ? (
              <form onSubmit={renombrar} className="space-y-3 rounded-lg border border-gray-200 p-3">
                <Campo label="Nuevo usuario" htmlFor="usuario-cambio">
                  <input
                    id="usuario-cambio"
                    required
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className={inputClass}
                  />
                </Campo>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setCambiando(false)} disabled={trabajando}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={trabajando}>
                    {trabajando && <Loader2 className="animate-spin" />}
                    Guardar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  disabled={trabajando}
                  onClick={() => {
                    setUsuario(cuenta.usuario);
                    setCambiando(true);
                  }}
                >
                  <UserPen /> Cambiar usuario
                </Button>
                <Button type="button" variant="outline" disabled={trabajando} onClick={restablecer}>
                  <RotateCcw /> Restablecer contraseña
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={trabajando}
                  onClick={alternarEstado}
                  className={cuenta.activa ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : undefined}
                >
                  <Power /> {cuenta.activa ? 'Desactivar acceso' : 'Reactivar acceso'}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
