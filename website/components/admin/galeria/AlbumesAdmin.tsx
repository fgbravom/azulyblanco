'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Camera, Images, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CATEGORIAS_ALBUM, type CategoriaAlbum } from '@/lib/contenido/tipos';
import { slugify } from '@/lib/admin/slug';
import { guardarAlbum, type AlbumConConteo } from '@/app/(admin)/admin/galeria/actions';
import { Campo, EstadoBadge, FiltroChips, PageHeader, Vacio, formatearFecha, inputClass } from '@/components/admin/ui';

function NuevoAlbum({ onCancelar }: { onCancelar: () => void }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaAlbum>('partidos');
  const [fecha, setFecha] = useState(() => new Date().toLocaleDateString('sv-SE'));
  const [creando, setCreando] = useState(false);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    try {
      const album = await guardarAlbum(null, {
        titulo,
        slug: slugify(titulo),
        categoria,
        fecha,
        descripcion: '',
        tags: [],
        publicado: false,
      });
      router.push(`/admin/galeria/${album.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el álbum');
      setCreando(false);
    }
  };

  return (
    <form onSubmit={crear} className="space-y-4">
      <Campo label="Título *" htmlFor="titulo-album">
        <input id="titulo-album" required autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="AYB vs Unión Boldo" className={inputClass} />
      </Campo>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Categoría" htmlFor="categoria-album">
          <select id="categoria-album" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaAlbum)} className={inputClass}>
            {CATEGORIAS_ALBUM.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Fecha" htmlFor="fecha-album">
          <input id="fecha-album" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
        </Campo>
      </div>
      <p className="text-xs text-gray-500">El álbum se crea como borrador. En el siguiente paso subes las fotos y lo publicas.</p>
      <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancelar} className="w-full sm:w-auto">Cancelar</Button>
        <Button type="submit" disabled={creando} className="w-full sm:w-auto">
          {creando && <Loader2 className="animate-spin" />} Crear y subir fotos
        </Button>
      </div>
    </form>
  );
}

export default function AlbumesAdmin({ albumes }: { albumes: AlbumConConteo[] }) {
  const [creando, setCreando] = useState(false);
  const [categoria, setCategoria] = useState<'todas' | CategoriaAlbum>('todas');

  const visibles = useMemo(
    () => albumes.filter((a) => categoria === 'todas' || a.categoria === categoria),
    [albumes, categoria]
  );

  return (
    <>
      <PageHeader
        titulo="Galerías"
        descripcion="Álbumes de fotos de partidos, entrenamientos, eventos e historia del club."
        acciones={
          <Button onClick={() => setCreando(true)}>
            <Plus /> Nuevo álbum
          </Button>
        }
      />

      {albumes.length === 0 ? (
        <Vacio
          icono={Images}
          titulo="Aún no hay álbumes"
          descripcion="Crea un álbum y sube las fotos de un partido o evento."
          accion={<Button onClick={() => setCreando(true)}><Plus /> Nuevo álbum</Button>}
        />
      ) : (
        <>
          <div className="mb-5">
            <FiltroChips<'todas' | CategoriaAlbum>
              etiqueta="Categoría del álbum"
              valor={categoria}
              onChange={setCategoria}
              opciones={[{ valor: 'todas', etiqueta: 'Todas' }, ...CATEGORIAS_ALBUM.map((c) => ({ valor: c.value, etiqueta: c.label }))]}
            />
          </div>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/admin/galeria/${a.id}`}
                  className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-azul-primario to-azul-medio">
                    {a.portada_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.portada_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Camera className="h-10 w-10 text-white/30" />
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                      <Camera className="h-3 w-3" /> {a.total_fotos}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-azul-claro">
                        {CATEGORIAS_ALBUM.find((c) => c.value === a.categoria)?.label}
                      </span>
                      <EstadoBadge publicado={a.publicado} />
                    </div>
                    <p className="mt-1 truncate font-semibold text-gray-900">{a.titulo}</p>
                    <p className="text-xs text-gray-500">{formatearFecha(a.fecha, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog open={creando} onOpenChange={setCreando}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-azul-primario">Nuevo álbum</DialogTitle>
          </DialogHeader>
          {creando && <NuevoAlbum onCancelar={() => setCreando(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
