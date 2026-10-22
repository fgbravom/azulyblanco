'use client';

import { useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  arrastrarFoco,
  desbordeImagen,
  FOCO_CENTRO,
  posicionCSS,
  type FocoPortada,
} from '@/lib/contenido/foco';

/** Un lugar donde se muestra la foto: proporción, forma y recorte automático */
export interface MarcoEncuadre {
  etiqueta: string;
  /** Clases del marco, igual que en el sitio (proporción, redondeos) */
  clase: string;
  /** Ancho fijo opcional para los marcos chicos */
  ancho?: string;
  /** Recorte del sitio cuando la foto está sin ajustar (por defecto, el centro) */
  defecto?: FocoPortada;
}

interface Props {
  url: string;
  /** null = sin ajustar: cada marco muestra su recorte automático */
  foco: FocoPortada | null;
  onChange: (foco: FocoPortada) => void;
  /** Quita el ajuste y vuelve a los recortes automáticos; sin esto, el botón centra la foto */
  onQuitar?: () => void;
  marcos: MarcoEncuadre[];
}

interface PreviaProps {
  url: string;
  foco: FocoPortada | null;
  onChange: (foco: FocoPortada) => void;
  marco: MarcoEncuadre;
}

/** Marco arrastrable: mover la foto cambia el encuadre, con el mismo recorte que el sitio */
function Previa({ url, foco, onChange, marco }: PreviaProps) {
  const marcoRef = useRef<HTMLButtonElement>(null);
  const foto = useRef<HTMLImageElement>(null);
  const arrastre = useRef<{ x: number; y: number; foco: FocoPortada; desborde: { x: number; y: number } } | null>(null);

  // Sin ajuste, el punto de partida es el recorte automático de este lugar
  const efectivo = foco ?? marco.defecto ?? FOCO_CENTRO;

  /** Qué tanto sobra la foto en cada eje de este marco; sin sobra no hay nada que mover */
  const medir = () => {
    const r = marcoRef.current?.getBoundingClientRect();
    return desbordeImagen(foto.current?.naturalWidth ?? 0, foto.current?.naturalHeight ?? 0, r?.width ?? 0, r?.height ?? 0);
  };

  return (
    <div className={cn(marco.ancho ?? 'min-w-[160px] flex-1')}>
      <button
        type="button"
        ref={marcoRef}
        aria-label={`${marco.etiqueta}: arrastra la foto o usa las flechas para moverla`}
        onPointerDown={(e) => {
          arrastre.current = { x: e.clientX, y: e.clientY, foco: efectivo, desborde: medir() };
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
          onChange(arrastrarFoco(efectivo, movimiento[0], movimiento[1], medir()));
        }}
        className={cn(
          'relative block w-full cursor-grab touch-none select-none overflow-hidden border border-gray-200 bg-gray-100 active:cursor-grabbing',
          marco.clase
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={foto}
          src={url}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
          style={{ objectPosition: posicionCSS(efectivo) }}
        />
      </button>
      <p className="mt-1 text-xs text-gray-500">{marco.etiqueta}</p>
    </div>
  );
}

/**
 * Encuadre de una foto: se la arrastra dentro de cada marco para elegir qué
 * parte se ve. Cada marco tiene la proporción real de un lugar del sitio, así
 * el ajuste se ve como quedará ahí. Sin ajuste, cada marco muestra el recorte
 * automático de su lugar.
 */
export default function Encuadre({ url, foco, onChange, onQuitar, marcos }: Props) {
  const sinAjuste = foco === null || (foco.x === FOCO_CENTRO.x && foco.y === FOCO_CENTRO.y);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700">Encuadre</p>
        {onQuitar ? (
          <button
            type="button"
            onClick={onQuitar}
            disabled={foco === null}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-azul-primario disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Quitar ajuste
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange(FOCO_CENTRO)}
            disabled={sinAjuste}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-azul-primario disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Centrar
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">Arrastra la foto en cada marco para elegir qué parte se ve.</p>
      <div className="mt-2 flex flex-wrap items-start gap-3">
        {marcos.map((marco) => (
          <Previa key={marco.etiqueta} url={url} foco={foco} onChange={onChange} marco={marco} />
        ))}
      </div>
    </div>
  );
}
