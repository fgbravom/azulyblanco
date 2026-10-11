import { notFound } from 'next/navigation';
import SerieEditor from '@/components/admin/series/SerieEditor';
import { obtenerSerie } from '../actions';

export default async function SeriePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serie = Number.isInteger(Number(id)) ? await obtenerSerie(Number(id)) : null;
  if (!serie) notFound();

  return <SerieEditor serie={serie} />;
}
