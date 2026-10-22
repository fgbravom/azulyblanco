'use client';

import { useState } from 'react';
import { ImagePlus, Replace, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { estiloRecorte, posicionCSS, type FocoPortada, type RecorteFoto } from '@/lib/contenido/foco';
import Biblioteca from './Biblioteca';

interface Props {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Proporción de la vista previa */
  aspecto?: 'video' | 'cuadrado';
  /** Recorte de la vista previa; null = recorte automático del lugar */
  recorte?: RecorteFoto | null;
  /** Recorte automático (object-position) cuando la foto está sin ajustar */
  defecto?: FocoPortada;
  className?: string;
}

/** Campo de imagen: sube una nueva o elige una de la biblioteca */
export default function SelectorImagen({ value, onChange, aspecto = 'video', recorte, defecto, className }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className={className}>
      {value ? (
        <div
          className={cn(
            'group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100',
            aspecto === 'video' ? 'aspect-video' : 'aspect-square max-w-[220px]'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={recorte?.ancho != null ? estiloRecorte(recorte) : { objectPosition: posicionCSS(recorte ?? defecto) }}
          />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/60 to-transparent p-2 pt-8">
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-white sm:min-h-0 sm:px-2.5"
            >
              <Replace className="h-3.5 w-3.5" /> Cambiar
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-white/95 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-white sm:min-h-0 sm:px-2.5"
            >
              <X className="h-3.5 w-3.5" /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600 transition-colors hover:border-azul-claro hover:text-azul-primario',
            aspecto === 'video' ? 'aspect-video' : 'aspect-square max-w-[220px]'
          )}
        >
          <ImagePlus className="h-7 w-7" />
          Elegir o subir imagen
        </button>
      )}

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-azul-primario">Elegir imagen</DialogTitle>
          </DialogHeader>
          {abierto && (
            <Biblioteca
              modo="seleccion"
              onSeleccionar={(medio) => {
                onChange(medio.url);
                setAbierto(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
