/**
 * Piezas compartidas de las pantallas del admin.
 * Usan colores explícitos (gray/azul) en vez de los tokens de shadcn, que en
 * este proyecto no resuelven a colores válidos con Tailwind v4.
 */

import { cn } from '@/lib/utils';

export const inputClass =
  'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-primario focus-visible:border-azul-primario disabled:opacity-50';

export const textareaClass =
  'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-primario focus-visible:border-azul-primario';

export function PageHeader({
  titulo,
  descripcion,
  acciones,
  volver,
}: {
  titulo: string;
  descripcion?: React.ReactNode;
  acciones?: React.ReactNode;
  volver?: React.ReactNode;
}) {
  return (
    <div className="mb-6 lg:mb-8">
      {volver && <div className="mb-3">{volver}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-heading font-bold text-azul-primario sm:text-3xl">{titulo}</h1>
          {descripcion && <p className="mt-1 text-sm text-gray-600">{descripcion}</p>}
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
      </div>
    </div>
  );
}

export function Panel({
  titulo,
  descripcion,
  acciones,
  children,
  className,
}: {
  titulo?: string;
  descripcion?: string;
  acciones?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {(titulo || acciones) && (
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            {titulo && <h2 className="font-heading font-semibold text-gray-900">{titulo}</h2>}
            {descripcion && <p className="mt-0.5 text-sm text-gray-500">{descripcion}</p>}
          </div>
          {acciones}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Campo({
  label,
  htmlFor,
  ayuda,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  ayuda?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        ayuda && <p className="text-xs text-gray-500">{ayuda}</p>
      )}
    </div>
  );
}

export function Interruptor({
  checked,
  onChange,
  label,
  descripcion,
  disabled,
}: {
  checked: boolean;
  onChange: (valor: boolean) => void;
  label: string;
  descripcion?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-60')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-primario focus-visible:ring-offset-2',
          checked ? 'bg-azul-claro' : 'bg-gray-300'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
      <span>
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        {descripcion && <span className="block text-xs text-gray-500">{descripcion}</span>}
      </span>
    </label>
  );
}

export function EstadoBadge({ publicado }: { publicado: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        publicado ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', publicado ? 'bg-green-500' : 'bg-amber-500')} />
      {publicado ? 'Publicado' : 'Borrador'}
    </span>
  );
}

export function Vacio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
}: {
  icono: React.ComponentType<{ className?: string }>;
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <Icono className="h-10 w-10 text-gray-300" />
      <p className="mt-3 font-medium text-gray-800">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-sm text-sm text-gray-500">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

/** Aviso cuando la base de datos no responde (migración pendiente o sin variables) */
export function ErrorDatos({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
      <p className="font-semibold">No se pudo leer la base de datos</p>
      <p className="mt-1">{mensaje}</p>
      <p className="mt-2 text-red-700">
        Puede faltar aplicar migraciones: <code className="rounded bg-red-100 px-1">npm run db:push</code> (ver docs/ADMIN.md).
      </p>
    </div>
  );
}

export function formatearFecha(fecha: string, opciones?: Intl.DateTimeFormatOptions) {
  return new Date(fecha.length === 10 ? `${fecha}T12:00:00` : fecha).toLocaleDateString(
    'es-CL',
    opciones ?? { day: 'numeric', month: 'short', year: 'numeric' }
  );
}
