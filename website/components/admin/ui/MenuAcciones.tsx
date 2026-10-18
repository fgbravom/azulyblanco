'use client';

import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface AccionMenu {
  etiqueta: string;
  icono?: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  /** Acción destructiva: va al final, separada y en rojo */
  peligro?: boolean;
  disabled?: boolean;
}

/**
 * Botón «⋯» con las acciones de una fila. Pensado para las tarjetas del
 * celular, donde no caben tres íconos sueltos con un área táctil cómoda.
 */
export default function MenuAcciones({
  acciones,
  etiqueta = 'Acciones',
  className,
}: {
  acciones: AccionMenu[];
  etiqueta?: string;
  className?: string;
}) {
  const normales = acciones.filter((a) => !a.peligro);
  const peligrosas = acciones.filter((a) => a.peligro);

  const item = (a: AccionMenu) => (
    <DropdownMenuItem
      key={a.etiqueta}
      disabled={a.disabled}
      onClick={(e) => e.stopPropagation()}
      onSelect={a.onSelect}
      className={cn(
        'min-h-11 cursor-pointer gap-3 rounded-md px-3 text-sm focus:bg-gray-100',
        a.peligro ? 'text-red-600 focus:text-red-700' : 'text-gray-800 focus:text-azul-primario'
      )}
    >
      {a.icono && <a.icono className="h-4 w-4" />}
      {a.etiqueta}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={etiqueta}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-azul-primario focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-primario data-[state=open]:bg-gray-100',
          className
        )}
      >
        <MoreVertical className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
        {normales.map(item)}
        {normales.length > 0 && peligrosas.length > 0 && <DropdownMenuSeparator className="my-1 h-px bg-gray-100" />}
        {peligrosas.map(item)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
