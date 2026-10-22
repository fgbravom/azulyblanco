'use client';

import { useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { arrastrarFoco, desbordeImagen, FOCO_CENTRO, posicionCSS, type FocoPortada } from '@/lib/contenido/foco';

interface Props {
  url: string;
  foco: FocoPortada;
  onChange: (foco: FocoPortada) => void;
}

interface PreviaProps extends Props {
  /** Proporción real del recorte: 16/9 en el artículo, 3/4 en las tarjetas del inicio */
  aspecto: 'video' | 'vertical';
  etiqueta: string;
  className?: string;
}

/** Marco arrastrable: mover la foto cambia el encuadre, con el mismo recorte que el sitio */
function Previa({ url, foco, onChange, aspecto, etiqueta, className }: PreviaProps) {
  const marco = useRef<HTMLButtonElement>(null);
  const foto = useRef<HTMLImageElement>(null);
  const arrastre = useRef<{ x: number; y: number; foco: FocoPortada; desborde: { x: number; y: number } } | null>(null);

  /** Qué tanto sobra la foto en cada eje de este marco; sin sobra no hay nada que mover */
  const medir = () => {
    const r = marco.current?.getBoundingClientRect();
    return desbordeImagen(foto.current?.naturalWidth ?? 0, foto.current?.naturalHeight ?? 0, r?.width ?? 0, r?.height ?? 0);
  };

  const mover = (dx: number, dy: number) => onChange(arrastrarFoco(foco, dx, dy, medir()));

  return (
    <div className={className}>
      <button
        type="button"
        ref={marco}
        aria-label={`${etiqueta}: arrastra la foto o usa las flechas para moverla`}
        onPointerDown={(e) => {
          arrastre.current = { x: e.clientX, y: e.clientY, foco, desborde: medir() };
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const a = arrastre.current;
          if (a) onChange(arrastrarFoco(a.foco, e.clientX - a.x, e.clientY - a.y, a.desborde));
        }}
        onPointerUp={() => {
          arrastre.current = null;
        }}
        onPointerCancel={() => {
          arrastre.current = null;
        }}
        onKeyDown={(e) => {
          // Las flechas mueven la foto: derecha la empuja a la derecha, Shift da pasos largos
          const paso = e.shiftKey ? 10 : 3;
          const movimientos: Record<string, [number, number]> = {
            ArrowLeft: [-paso, 0],
            ArrowRight: [paso, 0],
            ArrowUp: [0, -paso],
            ArrowDown: [0, paso],
          };
          const movimiento = movimientos[e.key];
          if (!movimiento) return;
          e.preventDefault();
          mover(movimiento[0], movimiento[1]);
        }}
        className={cn(
          'relative block w-full cursor-grab touch-none select-none overflow-hidden rounded-lg border border-gray-200 bg-gray-100 active:cursor-grabbing',
          aspecto === 'video' ? 'aspect-video' : 'aspect-[3/4]'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={foto}
          src={url}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
          style={{ objectPosition: posicionCSS(foco) }}
        />
      </button>
      <p className="mt-1 text-xs text-gray-500">{etiqueta}</p>
    </div>
  );
}

/**
 * Encuadre de la portada: se arrastra la foto dentro de cada marco para elegir
 * qué parte se ve. Los marcos tienen la proporción real del artículo y de las
 * tarjetas del inicio, así el ajuste se ve como quedará en el sitio.
 */
export default function AjustePortada({ url, foco, onChange }: Props) {
  const centrado = foco.x === FOCO_CENTRO.x && foco.y === FOCO_CENTRO.y;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700">Encuadre</p>
        <button
          type="button"
          onClick={() => onChange(FOCO_CENTRO)}
          disabled={centrado}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-azul-primario disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Centrar
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">Arrastra la foto en cada marco para elegir qué parte se ve.</p>
      <div className="mt-2 space-y-3">
        <Previa url={url} foco={foco} onChange={onChange} aspecto="video" etiqueta="En el artículo" />
        <Previa url={url} foco={foco} onChange={onChange} aspecto="vertical" etiqueta="En las tarjetas del inicio" className="w-28" />
      </div>
    </div>
  );
}
