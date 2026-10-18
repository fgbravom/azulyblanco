import { cn } from '@/lib/utils';
import type { DespublicacionNoticia } from '@/lib/contenido/tipos';
import { formatearFecha } from '@/components/admin/ui';

/** Quién despublicó una noticia, cuándo y por qué (solo lo ve el admin) */
export default function AvisoDespublicacion({
  despublicacion,
  compacto,
  className,
}: {
  despublicacion: DespublicacionNoticia;
  /** En el listado: el motivo se corta a dos líneas (el texto completo queda en el title) */
  compacto?: boolean;
  className?: string;
}) {
  const { por, fecha, motivo } = despublicacion;
  return (
    <div
      className={cn(
        'rounded-md border border-amber-200 bg-amber-50 text-amber-900',
        compacto ? 'mt-2 px-2.5 py-1.5 text-xs' : 'mb-6 p-4 text-sm',
        className
      )}
    >
      <p className="font-medium">
        Despublicada por {por} · {formatearFecha(fecha)}
      </p>
      <p className={cn('mt-0.5 break-words', compacto && 'line-clamp-2')} title={compacto ? motivo : undefined}>
        {motivo}
      </p>
    </div>
  );
}
