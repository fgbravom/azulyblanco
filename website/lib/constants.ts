export const SITE_CONFIG = {
  name: 'Azul y Blanco',
  description: 'Club deportivo fútbol amateur apasionado por el deporte',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/images/og-image.png',
  founded: 2006, // Cambiar por el año real de fundación
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
      { title: 'INSTALACIONES', href: '/club/instalaciones' },
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
    title: 'EQUIPOS',
    href: '/equipos',
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
