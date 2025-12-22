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
    title: 'Club',
    href: '/club/historia',
    submenu: [
      { title: 'Historia', href: '/club/historia' },
      { title: 'Directiva', href: '/club/directiva' },
      { title: 'Instalaciones', href: '/club/instalaciones' },
    ],
  },
  {
    title: 'Series',
    href: '/series/primera',
    submenu: [
      { title: 'Serie Primera', href: '/series/primera' },
      { title: 'Serie Honor', href: '/series/honor' },
      { title: 'Serie 35', href: '/series/35' },
    ],
  },
  {
    title: 'Equipos',
    href: '/equipos',
  },
  {
    title: 'Noticias',
    href: '/noticias',
  },
  {
    title: 'Partidos',
    href: '/partidos',
  },
  {
    title: 'Galería',
    href: '/galeria',
  },
  {
    title: 'Contacto',
    href: '/contacto',
  },
]
