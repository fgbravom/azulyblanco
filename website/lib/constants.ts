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
  social: {
    instagram: 'https://www.instagram.com/azulyblancocurico/',
    facebook: 'https://www.facebook.com/nuevoazulyblanco.curico',
    twitter: 'https://twitter.com/azulyblanco',
  },
  contact: {
    email: 'contacto@azulyblanco.com',
    phone: '+54 9 11 1234-5678',
    whatsapp: '+56912345678', // Número de WhatsApp del club
    address: 'Curicó, Chile',
  },
}

export const NAVIGATION_ITEMS = [
  {
    title: 'CLUB',
    href: '/club/historia',
    submenu: [
      { title: 'HISTORIA', href: '/club/historia' },
      { title: 'DIRECTIVA', href: '/club/directiva' },
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
