'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Copy, KeyRound, Loader2, Plus, Power, RotateCcw, UserPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CuentaPanel } from '@/lib/contenido/tipos';
import { cambiarEstado, cambiarRol, crearCuenta, restablecerPassword } from '@/app/(admin)/admin/usuarios/actions';
import { Campo, ErrorDatos, PageHeader, formatearFecha, inputClass } from '@/components/admin/ui';

type Rol = CuentaPanel['rol'];

const ROL_TEXTO: Record<Rol, string> = {
  admin: 'Administrador',
  colaborador: 'Colaborador',
};

/** Contraseña temporal recién generada: se muestra una sola vez */
interface Temporal {
  usuario: string;
  password: string;
}

// Envuelve una acción: bloquea los botones mientras corre y avisa los errores
function useAccion() {
  const [trabajando, setTrabajando] = useState(false);
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
  return { trabajando, ejecutar };
}

function TemporalDialog({ temporal, onCerrar }: { temporal: Temporal; onCerrar: () => void }) {
  const [copiada, setCopiada] = useState(false);

  const copiar = async () => {
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
          <DialogTitle className="text-azul-primario">Contraseña temporal</DialogTitle>
          <DialogDescription>Entrégasela a la persona; no se volverá a mostrar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-800">Tendrá que cambiarla la primera vez que ingrese.</p>
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
      </DialogContent>
    </Dialog>
  );
}

function NuevaCuentaDialog({ onCerrar, onCreada }: { onCerrar: () => void; onCreada: (temporal: Temporal) => void }) {
  const router = useRouter();
  const { trabajando, ejecutar } = useAccion();
  const [usuario, setUsuario] = useState('');
  const [rol, setRol] = useState<Rol>('colaborador');
  const [nombre, setNombre] = useState('');

  const crear = (e: React.FormEvent) => {
    e.preventDefault();
    return ejecutar(async () => {
      const res = await crearCuenta({ usuario, rol, nombre });
      router.refresh();
      onCreada({ usuario: res.usuario, password: res.passwordTemporal });
    });
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-azul-primario">Nuevo usuario</DialogTitle>
          <DialogDescription>Un administrador administra todo el panel. Un colaborador escribe noticias y gestiona las secciones de contenido.</DialogDescription>
        </DialogHeader>
        <form onSubmit={crear} className="space-y-4">
          <Campo label="Rol *" htmlFor="rol-nuevo">
            <select id="rol-nuevo" value={rol} onChange={(e) => setRol(e.target.value as Rol)} className={inputClass}>
              <option value="colaborador">Colaborador</option>
              <option value="admin">Administrador</option>
            </select>
          </Campo>
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
          {rol === 'colaborador' && (
            <Campo label="Nombre que firma sus noticias *" htmlFor="nombre-nuevo">
              <input id="nombre-nuevo" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} />
            </Campo>
          )}
          <Button type="submit" className="w-full" disabled={trabajando}>
            {trabajando ? <Loader2 className="animate-spin" /> : <KeyRound />}
            Crear usuario
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CambioRolDialog({ cuenta, onCerrar, onCambiado }: { cuenta: CuentaPanel; onCerrar: () => void; onCambiado: () => void }) {
  const router = useRouter();
  const { trabajando, ejecutar } = useAccion();
  const nuevoRol: Rol = cuenta.rol === 'admin' ? 'colaborador' : 'admin';
  const [nombre, setNombre] = useState('');

  const cambiar = (e: React.FormEvent) => {
    e.preventDefault();
    return ejecutar(async () => {
      await cambiarRol(cuenta.id, nuevoRol, nombre);
      router.refresh();
      toast.success(`${cuenta.usuario} ahora es ${ROL_TEXTO[nuevoRol].toLowerCase()}`);
      onCambiado();
    });
  };

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-azul-primario">Cambiar rol</DialogTitle>
          <DialogDescription>
            {cuenta.usuario} pasa de {ROL_TEXTO[cuenta.rol].toLowerCase()} a {ROL_TEXTO[nuevoRol].toLowerCase()}. Se cerrarán sus sesiones abiertas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={cambiar} className="space-y-4">
          {nuevoRol === 'colaborador' && (
            <>
              <Campo label="Nombre que firma sus noticias *" htmlFor="nombre-rol">
                <input id="nombre-rol" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} />
              </Campo>
              <p className="text-xs text-gray-600">Al pasar a colaborador deberá cambiar su contraseña al ingresar.</p>
            </>
          )}
          <Button type="submit" className="w-full" disabled={trabajando}>
            {trabajando && <Loader2 className="animate-spin" />}
            Cambiar a {ROL_TEXTO[nuevoRol].toLowerCase()}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface Props {
  iniciales: CuentaPanel[];
  /** Cuenta de quien está usando el panel: no puede cambiarse a sí misma */
  cuentaActualId: string;
}

export default function UsuariosAdmin({ iniciales, cuentaActualId }: Props) {
  const router = useRouter();
  const { trabajando, ejecutar } = useAccion();
  const [nueva, setNueva] = useState(false);
  const [cambiando, setCambiando] = useState<CuentaPanel | null>(null);
  const [temporal, setTemporal] = useState<Temporal | null>(null);

  const restablecer = (cuenta: CuentaPanel) => {
    if (!confirm(`¿Restablecer la contraseña de ${cuenta.usuario}? Se cerrará su sesión y tendrá que cambiar la nueva al ingresar.`)) return;
    return ejecutar(async () => {
      const res = await restablecerPassword(cuenta.id);
      router.refresh();
      setTemporal({ usuario: cuenta.usuario, password: res.passwordTemporal });
    });
  };

  const alternarEstado = (cuenta: CuentaPanel) => {
    const activar = !cuenta.activa;
    const pregunta = activar
      ? `¿Reactivar el acceso de ${cuenta.usuario}?`
      : `¿Desactivar el acceso de ${cuenta.usuario}? Se cerrará su sesión y no podrá ingresar hasta que lo reactives.`;
    if (!confirm(pregunta)) return;
    return ejecutar(async () => {
      await cambiarEstado(cuenta.id, activar);
      router.refresh();
      toast.success(activar ? 'Acceso reactivado' : 'Acceso desactivado');
    });
  };

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion="Quién entra al panel y con qué rol."
        acciones={
          <Button onClick={() => setNueva(true)}>
            <Plus /> Nuevo usuario
          </Button>
        }
      />

      {iniciales.length === 0 ? (
        <ErrorDatos mensaje="No hay usuarios todavía." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Último ingreso</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {iniciales.map((cuenta) => {
                const yo = cuenta.id === cuentaActualId;
                return (
                  <tr key={cuenta.id}>
                    <td className="px-4 py-3 font-mono text-gray-900">
                      {cuenta.usuario}
                      {yo && <span className="ml-2 rounded bg-azul-cielo/30 px-1.5 py-0.5 font-sans text-xs text-azul-primario">Tú</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{ROL_TEXTO[cuenta.rol]}</td>
                    <td className="px-4 py-3 text-gray-900">{cuenta.nombre}</td>
                    <td className="px-4 py-3">
                      <span className={cuenta.activa ? 'text-green-700' : 'text-gray-500'}>{cuenta.activa ? 'Activo' : 'Desactivado'}</span>
                      {cuenta.debe_cambiar_password && <p className="text-xs text-amber-700">Contraseña temporal pendiente</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {cuenta.ultimo_ingreso ? formatearFecha(cuenta.ultimo_ingreso) : 'Aún no ingresa'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" disabled={yo || trabajando} onClick={() => setCambiando(cuenta)}>
                          <UserPen /> Rol
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={yo || trabajando} onClick={() => restablecer(cuenta)}>
                          <RotateCcw /> Contraseña
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={yo || trabajando}
                          onClick={() => alternarEstado(cuenta)}
                          className={cuenta.activa ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : undefined}
                        >
                          <Power /> {cuenta.activa ? 'Desactivar' : 'Reactivar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {nueva && (
        <NuevaCuentaDialog
          onCerrar={() => setNueva(false)}
          onCreada={(t) => {
            setNueva(false);
            setTemporal(t);
          }}
        />
      )}
      {cambiando && <CambioRolDialog cuenta={cambiando} onCerrar={() => setCambiando(null)} onCambiado={() => setCambiando(null)} />}
      {temporal && <TemporalDialog temporal={temporal} onCerrar={() => setTemporal(null)} />}
    </>
  );
}
