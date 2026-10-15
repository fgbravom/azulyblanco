'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Rival } from '@/lib/contenido/tipos';
import { guardarRival } from '@/app/(admin)/admin/rivales/actions';
import { subirImagen } from '@/lib/admin/subir-imagen';
import { Campo, inputClass } from '@/components/admin/ui';

interface Props {
  /** null = rival nuevo */
  rival: Rival | null;
  onGuardado: (rival: Rival) => void;
  onCancelar: () => void;
}

export default function RivalForm({ rival, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre] = useState(rival?.nombre ?? '');
  const [sigla, setSigla] = useState(rival?.sigla ?? '');
  const [sitioWeb, setSitioWeb] = useState(rival?.sitio_web ?? '');
  const [logoNuevo, setLogoNuevo] = useState<File | null>(null);
  const [quitarLogo, setQuitarLogo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);

  const logoActual = quitarLogo ? null : (rival?.logo_url ?? null);
  const vistaPrevia = logoNuevo ? URL.createObjectURL(logoNuevo) : logoActual;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      let logoPath: string | null | undefined;
      if (logoNuevo) {
        logoPath = (await subirImagen(logoNuevo, { tipo: 'rival' })).path;
      } else if (quitarLogo && rival?.logo_url) {
        logoPath = null;
      }
      const guardado = await guardarRival(rival?.id ?? null, {
        nombre,
        sigla,
        sitio_web: sitioWeb || null,
        logoPath,
      });
      toast.success(rival ? 'Rival actualizado' : 'Rival creado');
      onGuardado(guardado);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      {/* Logo */}
      <Campo label="Logo">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => inputArchivo.current?.click()}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-50 hover:border-azul-claro"
            title="Elegir imagen"
          >
            {vistaPrevia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vistaPrevia} alt="Logo del rival" className="h-full w-full object-contain" />
            ) : (
              <ImagePlus className="h-6 w-6 text-gray-400" />
            )}
          </button>
          <div className="space-y-1">
            <Button type="button" variant="outline" size="sm" onClick={() => inputArchivo.current?.click()}>
              {vistaPrevia ? 'Cambiar logo' : 'Subir logo'}
            </Button>
            {vistaPrevia && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  setLogoNuevo(null);
                  setQuitarLogo(true);
                  if (inputArchivo.current) inputArchivo.current.value = '';
                }}
              >
                <Trash2 /> Quitar
              </Button>
            )}
            <p className="text-xs text-gray-500">PNG con fondo transparente se ve mejor.</p>
          </div>
          <input
            ref={inputArchivo}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) {
                setLogoNuevo(archivo);
                setQuitarLogo(false);
              }
            }}
          />
        </div>
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
        <Campo label="Nombre del club *" htmlFor="rival_nombre">
          <input
            id="rival_nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="San Martín"
            className={inputClass}
          />
        </Campo>
        <Campo label="Sigla *" htmlFor="rival_sigla" ayuda="Se muestra en la programación">
          <input
            id="rival_sigla"
            required
            value={sigla}
            onChange={(e) => setSigla(e.target.value)}
            placeholder="SM"
            maxLength={12}
            className={inputClass}
          />
        </Campo>
      </div>

      <Campo label="Sitio web" htmlFor="rival_sitio" ayuda="Opcional. URL completa, ej: https://clubsanmartin.cl">
        <input
          id="rival_sitio"
          type="url"
          value={sitioWeb}
          onChange={(e) => setSitioWeb(e.target.value)}
          placeholder="https://clubsanmartin.cl"
          className={inputClass}
        />
      </Campo>

      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
        <Button type="button" variant="outline" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando && <Loader2 className="animate-spin" />}
          {rival ? 'Guardar cambios' : 'Crear rival'}
        </Button>
      </div>
    </form>
  );
}
