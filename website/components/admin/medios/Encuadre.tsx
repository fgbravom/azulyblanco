'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  arrastrarFoco,
  estiloRecorte,
  FOCO_CENTRO,
  margenMovimiento,
  posicionCSS,
  tamanoDesplegado,
  type FocoPortada,
  type RecorteFoto,
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
  /** Recorte guardado; null = sin ajustar: cada marco muestra su recorte automático */
  recorte: RecorteFoto | null;
  onChange: (recorte: RecorteFoto) => void;
  /** Quita el ajuste y vuelve a los recortes automáticos; sin esto, el botón centra la foto */
  onQuitar?: () => void;
  /** Título del bloque; por defecto "Encuadre" */
  titulo?: string;
  marcos: MarcoEncuadre[];
}

interface PreviaProps {
  url: string;
  recorte: RecorteFoto | null;
  onChange: (recorte: RecorteFoto) => void;
  marco: MarcoEncuadre;
  /** La foto se puede acercar; con varios marcos de proporciones distintas no (el tamaño sería distinto en cada uno) */
  conZoom: boolean;
}

/** Marco arrastrable: mover la foto cambia el recorte, con el mismo encuadre que el sitio */
function Previa({ url, recorte, onChange, marco, conZoom }: PreviaProps) {
  const marcoRef = useRef<HTMLButtonElement>(null);
  const foto = useRef<HTMLImageElement>(null);
  const arrastre = useRef<{ x: number; y: number; foco: FocoPortada; margen: { x: number; y: number } } | null>(null);
  // Ancho mínimo de la foto, el que cubre el marco entero: se calcula cuando la foto carga
  const [cobertura, setCobertura] = useState(0);

  // Sin ajuste, el punto de partida es el recorte automático de este lugar
  const efectivo = recorte ?? marco.defecto ?? FOCO_CENTRO;

  const medidas = () => {
    const r = marcoRef.current?.getBoundingClientRect();
    const marcoMedido = { ancho: r?.width ?? 0, alto: r?.height ?? 0 };
    const fotoMedida = { ancho: foto.current?.naturalWidth ?? 0, alto: foto.current?.naturalHeight ?? 0 };
    return {
      marco: marcoMedido,
      foto: fotoMedida,
      desplegado: tamanoDesplegado(recorte, marcoMedido, fotoMedida),
    };
  };

  const alCargarFoto = () => {
    const { marco: m, foto: f } = medidas();
    setCobertura(Math.round((tamanoDesplegado(null, m, f).ancho / (m.ancho || 1)) * 100));
  };

  // La foto suele estar ya en la caché del navegador (se ve en la lista del
  // panel antes de abrir el editor): en ese caso el evento load no se dispara
  // y el control de acercar quedaría deshabilitado para siempre. Este efecto
  // detecta la imagen ya completa y calcula la cobertura igual.
  useEffect(() => {
    const img = foto.current;
    if (img?.complete && img.naturalWidth > 0) alCargarFoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const mover = (dx: number, dy: number) => {
    const { marco, desplegado } = medidas();
    onChange({ ...arrastrarFoco(efectivo, dx, dy, margenMovimiento(desplegado, marco)), ancho: recorte?.ancho ?? null });
  };

  return (
    <div className={cn(marco.ancho ?? 'min-w-[160px] flex-1')}>
      <button
        type="button"
        ref={marcoRef}
        aria-label={`${marco.etiqueta}: arrastra la foto o usa las flechas para moverla`}
        onPointerDown={(e) => {
          const { marco: m, desplegado } = medidas();
          arrastre.current = { x: e.clientX, y: e.clientY, foco: efectivo, margen: margenMovimiento(desplegado, m) };
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const a = arrastre.current;
          if (a) onChange({ ...arrastrarFoco(a.foco, e.clientX - a.x, e.clientY - a.y, a.margen), ancho: recorte?.ancho ?? null });
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
          onLoad={alCargarFoto}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={recorte?.ancho != null ? estiloRecorte(recorte) : { objectPosition: posicionCSS(efectivo) }}
        />
      </button>
      <p className="mt-1 text-xs text-gray-500">{marco.etiqueta}</p>
      {conZoom && (
        <label className="mt-2 block">
          <span className="text-xs text-gray-500">Acercar</span>
          <input
            type="range"
            aria-label="Acercar la foto"
            disabled={cobertura === 0}
            min={Math.max(1, cobertura)}
            max={Math.max(4, cobertura * 4)}
            step={1}
            value={recorte?.ancho ?? Math.max(1, cobertura)}
            onChange={(e) => onChange({ ...efectivo, ancho: Number(e.target.value) })}
            className="mt-1 w-full accent-azul-primario"
          />
        </label>
      )}
    </div>
  );
}

/**
 * Encuadre de una foto: se la arrastra dentro de cada marco para elegir qué
 * parte se ve y, si el marco es único, se la acerca para recortarla. Cada marco
 * tiene la proporción real de un lugar del sitio, así el ajuste se ve como
 * quedará ahí. Sin ajuste, cada marco muestra su recorte automático.
 */
export default function Encuadre({ url, recorte, onChange, onQuitar, titulo = 'Encuadre', marcos }: Props) {
  const sinAjuste = recorte === null || (recorte.x === FOCO_CENTRO.x && recorte.y === FOCO_CENTRO.y && recorte.ancho == null);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700">{titulo}</p>
        {onQuitar ? (
          <button
            type="button"
            onClick={onQuitar}
            disabled={recorte === null}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-azul-primario disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Quitar ajuste
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange({ ...FOCO_CENTRO, ancho: null })}
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
          <Previa key={marco.etiqueta} url={url} recorte={recorte} onChange={onChange} marco={marco} conZoom={marcos.length === 1} />
        ))}
      </div>
    </div>
  );
}
