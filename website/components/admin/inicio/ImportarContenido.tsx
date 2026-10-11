'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DatabaseZap, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { importarContenidoAnterior, type PendientesImportacion } from '@/app/(admin)/admin/actions';

const CLAVE_OCULTO = 'admin:importacion-oculta';

function describir({ actividades, noticias, albumes }: PendientesImportacion) {
  const partes = [
    noticias && `${noticias} ${noticias === 1 ? 'noticia' : 'noticias'}`,
    albumes && `${albumes} ${albumes === 1 ? 'álbum' : 'álbumes'}`,
    actividades && `${actividades} ${actividades === 1 ? 'actividad' : 'actividades'} de la programación`,
  ].filter(Boolean);
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}` : partes[0];
}

export default function ImportarContenido({ pendientes }: { pendientes: PendientesImportacion }) {
  const router = useRouter();
  const [importando, setImportando] = useState(false);
  const [oculto, setOculto] = useState(true);

  // Si se borra a propósito algo ya importado, el aviso volvería a salir: se puede ocultar
  useEffect(() => {
    try {
      setOculto(localStorage.getItem(CLAVE_OCULTO) === '1');
    } catch {
      setOculto(false);
    }
  }, []);

  const ocultar = () => {
    try {
      localStorage.setItem(CLAVE_OCULTO, '1');
    } catch {
      // Sin almacenamiento solo se oculta hasta recargar
    }
    setOculto(true);
  };

  const importar = async () => {
    setImportando(true);
    try {
      const r = await importarContenidoAnterior();
      // El panel desaparece al refrescar (ya no falta nada): el resumen va en notificaciones
      toast.success('Importación terminada', {
        description: `${r.actividades} actividades, ${r.noticias} noticias, ${r.albumes} álbumes y ${r.fotos} fotos.`,
        duration: 15000,
      });
      for (const aviso of r.avisos) toast.warning(aviso, { duration: 20000 });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo importar');
    } finally {
      setImportando(false);
    }
  };

  if (oculto) return null;

  return (
    <div className="relative rounded-xl border border-azul-claro/30 bg-azul-pastel/20 p-5">
      <button
        onClick={ocultar}
        aria-label="Ocultar aviso"
        title="Ocultar aviso"
        className="absolute right-3 top-3 rounded p-1 text-gray-400 hover:bg-white hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col gap-4 pr-6 sm:flex-row sm:items-center">
        <DatabaseZap className="h-8 w-8 shrink-0 text-azul-claro" />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Hay contenido anterior sin importar</p>
          <p className="mt-0.5 text-sm text-gray-600">
            Faltan {describir(pendientes)} que hoy están en archivos del proyecto. Mientras no se importen, no se ven en el
            sitio. Puedes repetirlo sin duplicar nada.
          </p>
        </div>
        <Button onClick={importar} disabled={importando}>
          {importando && <Loader2 className="animate-spin" />} Importar
        </Button>
      </div>
    </div>
  );
}
