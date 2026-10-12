import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/constants'
import { getAlbumesPublicos, getNoticiasPublicas } from '@/lib/contenido/publico'

export const revalidate = 3600

const PAGINAS: { ruta: string; prioridad: number; frecuencia: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { ruta: '', prioridad: 1, frecuencia: 'weekly' },
  { ruta: '/noticias', prioridad: 0.8, frecuencia: 'weekly' },
  { ruta: '/partidos', prioridad: 0.8, frecuencia: 'weekly' },
  { ruta: '/galeria', prioridad: 0.7, frecuencia: 'weekly' },
  { ruta: '/club/historia', prioridad: 0.7, frecuencia: 'yearly' },
  { ruta: '/series/primera', prioridad: 0.6, frecuencia: 'monthly' },
  { ruta: '/series/honor', prioridad: 0.6, frecuencia: 'monthly' },
  { ruta: '/series/35', prioridad: 0.6, frecuencia: 'monthly' },
  { ruta: '/contacto', prioridad: 0.5, frecuencia: 'yearly' },
]

// Las fechas vienen como 'YYYY-MM-DD'; una inválida rompería el XML
function fecha(valor?: string) {
  const d = valor ? new Date(valor) : null
  return d && !isNaN(d.getTime()) ? d : undefined
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [noticias, albumes] = await Promise.all([getNoticiasPublicas(), getAlbumesPublicos()])

  return [
    ...PAGINAS.map(({ ruta, prioridad, frecuencia }) => ({
      url: `${SITE_CONFIG.url}${ruta}`,
      changeFrequency: frecuencia,
      priority: prioridad,
    })),
    ...noticias.map((n) => ({
      url: `${SITE_CONFIG.url}/noticias/${n.slug}`,
      lastModified: fecha(n.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...albumes.map((a) => ({
      url: `${SITE_CONFIG.url}/galeria/${a.categoria}/${a.slug}`,
      lastModified: fecha(a.date),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ]
}
