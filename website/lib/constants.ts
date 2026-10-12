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
    name: 'Asociación de Fútbol Curicó Aguas Negras',
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

export const NAVIGATION_ITEMS = [
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
    submenu: [
      { title: 'SERIE PRIMERA', href: '/series/primera' },
      { title: 'SERIE HONOR', href: '/series/honor' },
      { title: 'SERIE 35', href: '/series/35' },
    ],
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
