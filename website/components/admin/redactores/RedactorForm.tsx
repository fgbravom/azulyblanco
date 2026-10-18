'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Redactor } from '@/lib/contenido/tipos';
import { guardarRedactor } from '@/app/(admin)/admin/redactores/actions';
import { subirImagen } from '@/lib/admin/subir-imagen';
import { BarraAcciones, Campo, inputClass } from '@/components/admin/ui';

// El avatar se ve a lo más a 64 px; 256 cubre pantallas de alta densidad
const LADO_AVATAR = 256;

interface Props {
  /** null = redactor nuevo */
  redactor: Redactor | null;
  onGuardado: (redactor: Redactor) => void;
  onCancelar: () => void;
}

export default function RedactorForm({ redactor, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre] = useState(redactor?.nombre ?? '');
  const [avatarNuevo, setAvatarNuevo] = useState<File | null>(null);
  const [quitarAvatar, setQuitarAvatar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);

  const avatarActual = quitarAvatar ? null : (redactor?.avatar_url ?? null);
  const vistaPrevia = avatarNuevo ? URL.createObjectURL(avatarNuevo) : avatarActual;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      let avatarPath: string | null | undefined;
      if (avatarNuevo) {
        const subida = await subirImagen(avatarNuevo, { tipo: 'redactor' }, { cubrir: { ancho: LADO_AVATAR, alto: LADO_AVATAR } });
        avatarPath = subida.path;
      } else if (quitarAvatar && redactor?.avatar_url) {
        avatarPath = null;
      }
      const guardado = await guardarRedactor(redactor?.id ?? null, { nombre, avatarPath });
      toast.success(redactor ? 'Redactor actualizado' : 'Redactor creado');
      onGuardado(guardado);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      {/* Avatar */}
      <Campo label="Avatar">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => inputArchivo.current?.click()}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-50 hover:border-azul-claro"
            title="Elegir imagen"
          >
            {vistaPrevia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vistaPrevia} alt="Avatar del redactor" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-6 w-6 text-gray-400" />
            )}
          </button>
          <div className="space-y-1">
            <Button type="button" variant="outline" size="sm" onClick={() => inputArchivo.current?.click()}>
              {vistaPrevia ? 'Cambiar avatar' : 'Subir avatar'}
            </Button>
            {vistaPrevia && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  setAvatarNuevo(null);
                  setQuitarAvatar(true);
                  if (inputArchivo.current) inputArchivo.current.value = '';
                }}
              >
                <Trash2 /> Quitar
              </Button>
            )}
            <p className="text-xs text-gray-500">Foto cuadrada con la cara centrada. Se muestra en un círculo.</p>
          </div>
          <input
            ref={inputArchivo}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) {
                setAvatarNuevo(archivo);
                setQuitarAvatar(false);
              }
            }}
          />
        </div>
      </Campo>

      <Campo label="Nombre *" htmlFor="redactor_nombre" ayuda="Así aparece la firma en cada noticia">
        <input
          id="redactor_nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Felipe Bravo"
          className={inputClass}
        />
      </Campo>

      <BarraAcciones dialogo>
        <Button type="button" variant="outline" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando && <Loader2 className="animate-spin" />}
          {redactor ? 'Guardar cambios' : 'Crear redactor'}
        </Button>
      </BarraAcciones>
    </form>
  );
}
