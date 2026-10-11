import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import HeroAdmin from '@/components/admin/hero/HeroAdmin';
import { listarFotosHero } from './actions';

// Generar las 6 variantes AVIF/WebP de una foto toma varios segundos
export const maxDuration = 60;

export default async function HeroPage() {
  let fotos;
  let error: string | null = null;
  try {
    fotos = await listarFotosHero();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !fotos) {
    return (
      <>
        <PageHeader titulo="Portada" />
        <ErrorDatos mensaje={`${error ?? ''} (¿falta la migración 20260101000002_hero.sql?)`} />
      </>
    );
  }

  return <HeroAdmin iniciales={fotos} />;
}
