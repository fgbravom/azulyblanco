// Tablas publicadas del Campeonato ANFA: la sección "Tabla de posiciones" solo
// se lista si la serie tiene tabla (misma regla que SeriePage). Se lee el JSON
// crudo para no arrastrar zod al bundle del cliente, que importa este módulo
import posicionesDatos from './data/posiciones.json'

export const SITE_CONFIG = {
  name: 'Azul y Blanco',
  description:
    'Club Deportivo Azul y Blanco de Curicó: fútbol amateur desde 2006. Series Primera, Honor y 35, partidos, noticias y galería del club.',
  // Dominio de producción: canonicals, Open Graph y sitemap se arman con esta URL
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.azulyblanco.cl',
  founded: 2006,
  foundingDate: '2006-08-06',
  colors: {
    primary: '#0047AB',
    secondary: '#FFFFFF',
    dark: '#002D6B',
    light: '#4A90E2',
  },
  // Asociación de fútbol amateur a la que está afiliado el club
  association: {
    name: 'Curicó Aguas Negras.',
    instagram: 'https://www.instagram.com/asoc.curicoaguasnegras/',
  },
  social: {
    instagram: 'https://www.instagram.com/azulyblancocurico/',
    facebook: 'https://www.facebook.com/nuevoazulyblanco.curico',
  },
  contact: {
    email: 'contacto@azulyblanco.cl',
    // Dejar vacío para ocultar el dato en el sitio (contacto y footer lo omiten)
    phone: '',
    // Mismo criterio: si está vacío, el botón de WhatsApp del calendario no se muestra
    whatsapp: '',
    address: 'Curicó, Chile',
  },
}

export interface NavItem {
  title: string
  href: string
  submenu?: NavItem[]
}

// Cada serie despliega sus secciones; la página de la serie abre la pestaña que
// corresponde (ver PestanasSerie). La serie misma se alcanza por "Plantel", su
// pestaña por defecto
const SUBMENUS_SERIES: NavItem[] = (
  [
    { slug: 'primera', title: 'SERIE PRIMERA' },
    { slug: 'honor', title: 'SERIE HONOR' },
    { slug: '35', title: 'SERIE 35' },
  ] as const
).map(({ slug, title }) => ({
  title,
  href: `/series/${slug}`,
  submenu: [
    { title: 'PLANTEL', href: `/series/${slug}` },
    ...(posicionesDatos.series.some((serie) => serie.slug === slug)
      ? [{ title: 'TABLA DE POSICIONES', href: `/series/${slug}?tab=posiciones` }]
      : []),
  ],
}))

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'CLUB',
    href: '/club/historia',
    submenu: [
      { title: 'HISTORIA', href: '/club/historia' },
      // Directiva oculta hasta tener los nombres reales (la ruta sigue viva,
      // pero con noindex en app/club/directiva/page.tsx)
    ],
  },
  {
    title: 'SERIES',
    href: '/series/primera',
    submenu: SUBMENUS_SERIES,
  },
  {
    title: 'NOTICIAS',
    href: '/noticias',
  },
  {
    title: 'PARTIDOS',
    href: '/partidos',
  },
  {
    title: 'GALERÍA',
    href: '/galeria',
  },
  {
    title: 'CONTACTO',
    href: '/contacto',
  },
]
