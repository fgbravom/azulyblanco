'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Monitor, RefreshCw, Smartphone, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeroFoto } from '@/lib/contenido/tipos';
import { HERO_WIDTHS } from '@/components/hero/hero-boot';
import { subirImagen, type OpcionesImagen } from '@/lib/admin/subir-imagen';
import {
  cambiarVisibilidadHero,
  eliminarFotoHero,
  procesarFotoHero,
  reordenarFotosHero,
} from '@/app/(admin)/admin/hero/actions';
import { PageHeader, Panel } from '@/components/admin/ui';
import ZonaSubida from '@/components/admin/medios/ZonaSubida';

type Dispositivo = HeroFoto['dispositivo'];

const VERSIONES: Record<
  Dispositivo,
  { label: string; icono: typeof Monitor; aspecto: string; ayuda: string; opciones: OpcionesImagen; anchoMinimo: number }
> = {
  desktop: {
    label: 'Escritorio',
    icono: Monitor,
    aspecto: 'aspect-[16/9]',
    ayuda: 'Fotos horizontales de al menos 1920 px de ancho (ideal 2560 px). Se muestran a lo ancho de la pantalla, recortadas al centro.',
    opciones: { cubrir: { ancho: 2560, alto: 0 }, calidad: 0.92 },
    anchoMinimo: 1920,
  },
  mobile: {
    label: 'Móvil',
    icono: Smartphone,
    aspecto: 'aspect-[3/4]',
    ayuda: 'Fotos verticales de al menos 1080 px de ancho (ideal 1080 × 1920). En el celular el hero es más alto que ancho y se recorta al centro.',
    opciones: { cubrir: { ancho: 1080, alto: 1404 }, calidad: 0.92 },
    anchoMinimo: 828,
  },
};

/** Vista previa liviana: el ancho más chico en WebP */
function miniatura(foto: HeroFoto) {
  return `${foto.base_url}${HERO_WIDTHS[foto.dispositivo][0]}.webp`;
}

function advertencias(dispositivo: Dispositivo, ancho: number, alto: number, nombre: string): string[] {
  const avisos: string[] = [];
  if (ancho < VERSIONES[dispositivo].anchoMinimo) {
    avisos.push(`${nombre} mide ${ancho} px de ancho: puede verse borrosa en pantallas grandes.`);
  }
  if (dispositivo === 'desktop' && alto > ancho) {
    avisos.push(`${nombre} es vertical: en escritorio se recortará mucho arriba y abajo.`);
  }
  if (dispositivo === 'mobile' && ancho > alto) {
    avisos.push(`${nombre} es horizontal: en el celular se recortará mucho a los lados.`);
  }
  return avisos;
}

export default function HeroAdmin({ iniciales }: { iniciales: HeroFoto[] }) {
  const [fotos, setFotos] = useState(iniciales);
  const [dispositivo, setDispositivo] = useState<Dispositivo>('desktop');
  const [progreso, setProgreso] = useState<string | null>(null);
  const [reemplazando, setReemplazando] = useState<HeroFoto | null>(null);
  const inputReemplazo = useRef<HTMLInputElement>(null);

  const version = VERSIONES[dispositivo];
  const lista = fotos.filter((f) => f.dispositivo === dispositivo);
  const visibles = lista.filter((f) => f.activo).length;

  /** Sube una foto y espera a que el servidor genere sus versiones */
  const subirUna = async (archivo: File, reemplaza?: HeroFoto) => {
    const subida = await subirImagen(archivo, { tipo: 'hero' }, version.opciones);
    for (const aviso of advertencias(dispositivo, subida.ancho, subida.alto, archivo.name)) {
      toast.warning(aviso, { duration: 10000 });
    }
    return procesarFotoHero(dispositivo, subida.path, reemplaza?.id);
  };

  const subir = async (archivos: File[]) => {
    let agregadas = 0;
    for (const [i, archivo] of archivos.entries()) {
      setProgreso(`Procesando ${i + 1} de ${archivos.length}… (genera 6 versiones optimizadas)`);
      try {
        const foto = await subirUna(archivo);
        setFotos((prev) => [...prev, foto]);
        agregadas++;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Error al subir ${archivo.name}`);
      }
    }
    setProgreso(null);
    if (agregadas > 0) toast.success(agregadas === 1 ? 'Foto agregada a la portada' : `${agregadas} fotos agregadas a la portada`);
  };

  const reemplazar = async (archivo: File) => {
    const actual = reemplazando;
    setReemplazando(null);
    if (!actual) return;
    setProgreso('Reemplazando foto… (genera 6 versiones optimizadas)');
    try {
      const foto = await subirUna(archivo, actual);
      setFotos((prev) => prev.map((f) => (f.id === actual.id ? foto : f)));
      toast.success('Foto reemplazada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo reemplazar');
    } finally {
      setProgreso(null);
    }
  };

  const mover = async (indice: number, delta: -1 | 1) => {
    const destino = indice + delta;
    if (destino < 0 || destino >= lista.length) return;
    const nueva = [...lista];
    [nueva[indice], nueva[destino]] = [nueva[destino], nueva[indice]];
    const anteriores = fotos;
    setFotos([...fotos.filter((f) => f.dispositivo !== dispositivo), ...nueva.map((f, orden) => ({ ...f, orden }))]);
    try {
      await reordenarFotosHero(nueva.map((f) => f.id));
    } catch (e) {
      setFotos(anteriores);
      toast.error(e instanceof Error ? e.message : 'No se pudo reordenar');
    }
  };

  const alternarVisible = async (foto: HeroFoto) => {
    try {
      await cambiarVisibilidadHero(foto.id, !foto.activo);
      setFotos((prev) => prev.map((f) => (f.id === foto.id ? { ...f, activo: !foto.activo } : f)));
      toast.success(foto.activo ? 'Foto oculta: ya no aparece en la portada' : 'Foto visible en la portada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar');
    }
  };

  const eliminar = async (foto: HeroFoto) => {
    if (!confirm('¿Quitar esta foto de la portada?')) return;
    try {
      await eliminarFotoHero(foto.id);
      setFotos((prev) => prev.filter((f) => f.id !== foto.id));
      toast.success('Foto quitada de la portada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  return (
    <>
      <PageHeader
        titulo="Portada"
        descripcion="Fotos rotativas del hero del inicio. Cada visita muestra la siguiente foto de la lista."
        acciones={
          <a href="/" target="_blank" rel="noreferrer" className="text-sm font-medium text-azul-claro hover:underline">
            Ver portada →
          </a>
        }
      />

      <div className="mb-5 flex w-full rounded-lg bg-white p-1 shadow-sm ring-1 ring-gray-200 sm:inline-flex sm:w-auto">
        {(Object.keys(VERSIONES) as Dispositivo[]).map((d) => {
          const { label, icono: Icono } = VERSIONES[d];
          const total = fotos.filter((f) => f.dispositivo === d && f.activo).length;
          return (
            <button
              key={d}
              onClick={() => setDispositivo(d)}
              disabled={Boolean(progreso)}
              className={cn(
                'inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium sm:flex-none sm:px-4',
                dispositivo === d ? 'bg-azul-primario text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icono className="h-4 w-4" /> {label}
              <span className="opacity-70">({total})</span>
            </button>
          );
        })}
      </div>

      <Panel titulo={`Fotos para ${version.label.toLowerCase()} · ${visibles} visibles`} descripcion={version.ayuda}>
        <ZonaSubida onArchivos={subir} progreso={progreso} className="mb-5" />

        <ul className={cn('grid gap-4', dispositivo === 'desktop' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 min-[560px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5')}>
          {lista.map((foto, i) => (
            <li key={foto.id} className={cn('mx-auto w-full overflow-hidden rounded-lg border border-gray-200 bg-white', dispositivo === 'mobile' && 'max-w-xs min-[560px]:max-w-none')}>
              <div className={cn('relative bg-gray-100', version.aspecto)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={miniatura(foto)}
                  alt=""
                  loading="lazy"
                  className={cn('h-full w-full object-cover', !foto.activo && 'opacity-40 grayscale')}
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                {!foto.activo && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700">
                    <EyeOff className="h-3 w-3" /> Oculta
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-gray-100 px-2 py-1.5">
                <div className="flex">
                  <button onClick={() => mover(i, -1)} disabled={i === 0 || Boolean(progreso)} aria-label="Mover antes" title="Mover antes" className="flex h-10 w-10 items-center justify-center rounded text-gray-500 sm:h-7 sm:w-7 hover:bg-gray-100 disabled:opacity-30">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => mover(i, 1)} disabled={i === lista.length - 1 || Boolean(progreso)} aria-label="Mover después" title="Mover después" className="flex h-10 w-10 items-center justify-center rounded text-gray-500 sm:h-7 sm:w-7 hover:bg-gray-100 disabled:opacity-30">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex">
                  <button onClick={() => alternarVisible(foto)} disabled={Boolean(progreso)} aria-label={foto.activo ? 'Ocultar' : 'Mostrar'} title={foto.activo ? 'Ocultar de la portada' : 'Mostrar en la portada'} className="flex h-10 w-10 items-center justify-center rounded text-gray-500 sm:h-7 sm:w-7 hover:bg-gray-100 hover:text-azul-primario disabled:opacity-30">
                    {foto.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setReemplazando(foto);
                      inputReemplazo.current?.click();
                    }}
                    disabled={Boolean(progreso)}
                    aria-label="Reemplazar"
                    title="Reemplazar por otra foto"
                    className="flex h-10 w-10 items-center justify-center rounded text-gray-500 sm:h-7 sm:w-7 hover:bg-gray-100 hover:text-azul-primario disabled:opacity-30"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button onClick={() => eliminar(foto)} disabled={Boolean(progreso)} aria-label="Quitar" title="Quitar de la portada" className="flex h-10 w-10 items-center justify-center rounded text-gray-500 sm:h-7 sm:w-7 hover:bg-red-50 hover:text-red-600 disabled:opacity-30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <input
          ref={inputReemplazo}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            e.target.value = '';
            if (archivo) reemplazar(archivo);
            else setReemplazando(null);
          }}
        />
      </Panel>
    </>
  );
}
