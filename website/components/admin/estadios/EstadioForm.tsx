'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Estadio } from '@/lib/contenido/tipos';
import { guardarEstadio } from '@/app/(admin)/admin/estadios/actions';
import { BarraAcciones, Campo, inputClass } from '@/components/admin/ui';

interface Props {
  /** null = estadio nuevo */
  estadio: Estadio | null;
  onGuardado: (estadio: Estadio) => void;
  onCancelar: () => void;
}

export default function EstadioForm({ estadio, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre] = useState(estadio?.nombre ?? '');
  const [ubicacion, setUbicacion] = useState(estadio?.ubicacion ?? '');
  const [mapaUrl, setMapaUrl] = useState(estadio?.mapa_url ?? '');
  const [guardando, setGuardando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const guardado = await guardarEstadio(estadio?.id ?? null, {
        nombre,
        ubicacion: ubicacion || null,
        mapa_url: mapaUrl || null,
      });
      toast.success(estadio ? 'Cancha actualizada' : 'Cancha creada');
      onGuardado(guardado);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      <Campo label="Nombre *" htmlFor="estadio_nombre" ayuda="Como se muestra en la programación, ej: ESTADIO ANFA">
        <input
          id="estadio_nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ESTADIO ANFA"
          className={inputClass}
        />
      </Campo>

      <Campo label="Ubicación" htmlFor="estadio_ubicacion" ayuda="Opcional. Comuna o dirección, ej: Av. Manso de Velasco 1250, Curicó">
        <input
          id="estadio_ubicacion"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          placeholder="Curicó"
          className={inputClass}
        />
      </Campo>

      <Campo label="Link al mapa" htmlFor="estadio_mapa" ayuda="Opcional. URL completa de Google Maps para cómo llegar">
        <input
          id="estadio_mapa"
          type="url"
          value={mapaUrl}
          onChange={(e) => setMapaUrl(e.target.value)}
          placeholder="https://maps.app.goo.gl/..."
          className={inputClass}
        />
      </Campo>

      <BarraAcciones dialogo>
        <Button type="button" variant="outline" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando && <Loader2 className="animate-spin" />}
          {estadio ? 'Guardar cambios' : 'Crear cancha'}
        </Button>
      </BarraAcciones>
    </form>
  );
}
