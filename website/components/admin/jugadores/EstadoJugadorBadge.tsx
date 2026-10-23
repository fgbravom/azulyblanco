import { cn } from '@/lib/utils';
import type { JugadorCompleto } from '@/types/database';

type Estado = JugadorCompleto['estado'];

// Mismos colores que la tarjeta pública (PlantelGrid): naranja lesionado, rojo sancionado
const ESTILO: Record<Estado, string> = {
  Activo: 'bg-green-50 text-green-700',
  Lesionado: 'bg-orange-50 text-orange-700',
  Sancionado: 'bg-red-50 text-red-700',
  Inactivo: 'bg-gray-100 text-gray-600',
};

const PUNTO: Record<Estado, string> = {
  Activo: 'bg-green-500',
  Lesionado: 'bg-orange-500',
  Sancionado: 'bg-red-600',
  Inactivo: 'bg-gray-400',
};

export default function EstadoJugadorBadge({ estado }: { estado: Estado }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
        ESTILO[estado] ?? ESTILO.Inactivo
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', PUNTO[estado] ?? PUNTO.Inactivo)} aria-hidden />
      {estado}
    </span>
  );
}
