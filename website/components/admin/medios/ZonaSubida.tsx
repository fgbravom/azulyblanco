'use client';

import { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onArchivos: (archivos: File[]) => void;
  multiple?: boolean;
  /** Texto de progreso, p. ej. "Subiendo 3 de 12…"; deshabilita la zona */
  progreso?: string | null;
  className?: string;
}

/** Zona para arrastrar o elegir imágenes */
export default function ZonaSubida({ onArchivos, multiple = true, progreso, className }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [encima, setEncima] = useState(false);
  const ocupado = Boolean(progreso);

  const recibir = (lista: FileList | null) => {
    const archivos = Array.from(lista ?? []).filter((f) => f.type.startsWith('image/'));
    if (archivos.length > 0) onArchivos(multiple ? archivos : archivos.slice(0, 1));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={ocupado}
      onClick={() => !ocupado && input.current?.click()}
      onKeyDown={(e) => {
        if (!ocupado && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          input.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!ocupado) setEncima(true);
      }}
      onDragLeave={() => setEncima(false)}
      onDrop={(e) => {
        e.preventDefault();
        setEncima(false);
        if (!ocupado) recibir(e.dataTransfer.files);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center sm:px-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-primario',
        encima ? 'border-azul-claro bg-azul-pastel/30' : 'border-gray-300 bg-gray-50 hover:border-azul-claro hover:bg-azul-pastel/10',
        ocupado && 'cursor-wait opacity-80',
        className
      )}
    >
      {ocupado ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-azul-claro" />
          <p className="mt-2 text-sm font-medium text-gray-700">{progreso}</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-azul-claro" />
          <p className="mt-2 text-sm font-medium text-gray-700">
            Arrastra {multiple ? 'imágenes' : 'una imagen'} aquí o <span className="text-azul-claro underline">elige desde tu equipo</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP o GIF. Se optimizan automáticamente antes de subir.</p>
        </>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          recibir(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
