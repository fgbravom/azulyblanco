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
    instagram: 'https://instagram.com/azulyblanco',
    facebook: 'https://facebook.com/azulyblanco',
    twitter: 'https://twitter.com/azulyblanco',
  },
  contact: {
    email: 'contacto@azulyblanco.com',
    phone: '+54 9 11 1234-5678',
    address: 'Calle Principal 123, Ciudad',
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
