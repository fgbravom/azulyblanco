'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cambiarMiAvatar } from '@/app/(admin)/admin/cuenta/actions';
import { subirImagen } from '@/lib/admin/subir-imagen';
import { Panel } from '@/components/admin/ui';

// Igual que en RedactorForm: el avatar se ve a lo más a 64 px
const LADO_AVATAR = 256;

export default function MiAvatarForm({ inicial }: { inicial: string | null }) {
  const [avatar, setAvatar] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);

  const guardar = async (archivo: File | null) => {
    setGuardando(true);
    try {
      const path = archivo
        ? (await subirImagen(archivo, { tipo: 'redactor' }, { cubrir: { ancho: LADO_AVATAR, alto: LADO_AVATAR } })).path
        : null;
      setAvatar(await cambiarMiAvatar(path));
      toast.success(archivo ? 'Avatar actualizado' : 'Avatar quitado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el avatar');
    } finally {
      setGuardando(false);
      if (inputArchivo.current) inputArchivo.current.value = '';
    }
  };

  return (
    <Panel titulo="Avatar" descripcion="Acompaña tu firma en cada noticia.">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputArchivo.current?.click()}
          disabled={guardando}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-50 hover:border-azul-claro"
          title="Elegir imagen"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="Tu avatar" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-gray-400" />
          )}
          {guardando && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            </span>
          )}
        </button>
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            <Button type="button" variant="outline" size="sm" disabled={guardando} onClick={() => inputArchivo.current?.click()}>
              {avatar ? 'Cambiar avatar' : 'Subir avatar'}
            </Button>
            {avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={guardando}
                className="text-red-600 hover:text-red-700"
                onClick={() => guardar(null)}
              >
                <Trash2 /> Quitar
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">Foto cuadrada con la cara centrada. Se muestra en un círculo.</p>
        </div>
        <input
          ref={inputArchivo}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) guardar(archivo);
          }}
        />
      </div>
    </Panel>
  );
}
