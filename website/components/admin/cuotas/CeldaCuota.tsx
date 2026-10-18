import { cn } from '@/lib/utils';
import { etiquetaCuota, formatoCLP, type Cuota, type Exencion } from '@/lib/cuotas/tipos';

const COLOR_EXENCION: Record<Exencion, string> = {
  lesion: 'bg-sky-50 text-sky-700',
  ausente: 'bg-violet-50 text-violet-700',
  retiro: 'bg-gray-100 text-gray-500',
  refuerzo: 'bg-purple-50 text-purple-700',
  becado: 'bg-indigo-50 text-indigo-700',
  otro: 'bg-gray-100 text-gray-600',
};

/** Colores de una cuota según su estado; los usa también el link personal */
export function estiloCuota(cuota: Pick<Cuota, 'estado' | 'exencion'>) {
  switch (cuota.estado) {
    case 'pagada':
      return 'bg-green-50 text-green-700';
    case 'parcial':
      return 'bg-amber-50 text-amber-700';
    case 'pendiente':
      return 'bg-red-50 text-red-600';
    case 'exenta':
      return COLOR_EXENCION[cuota.exencion ?? 'otro'];
  }
}

/** Texto corto de la celda: el monto pagado, o el motivo si no hay pago */
export function textoCelda(cuota: Cuota) {
  if (cuota.estado === 'pagada' || cuota.estado === 'parcial') return formatoCLP(cuota.pagado);
  return etiquetaCuota(cuota);
}

export default function CeldaCuota({ cuota, onClick }: { cuota?: Cuota; onClick: () => void }) {
  if (!cuota) {
    return (
      <button
        onClick={onClick}
        className="h-10 w-full min-w-[4.5rem] rounded-md text-xs text-gray-300 sm:h-8 hover:bg-gray-100 hover:text-gray-500"
        title="Sin cuota este mes"
      >
        —
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      title={cuota.estado === 'parcial' ? `Abonó ${formatoCLP(cuota.pagado)} de ${formatoCLP(cuota.monto)}` : cuota.nota ?? undefined}
      className={cn(
        'h-10 w-full min-w-[4.5rem] whitespace-nowrap sm:h-8 rounded-md px-1.5 text-xs font-semibold transition-shadow hover:ring-2 hover:ring-azul-claro/40',
        estiloCuota(cuota)
      )}
    >
      {textoCelda(cuota)}
    </button>
  );
}
