import SeriePage from '@/app/series/_components/SeriePage'

export const metadata = {
  title: 'Serie Primera',
  description: 'Plantel de la Serie Primera del Club Azul y Blanco',
}

export default function SeriePrimeraPage() {
  return (
    <SeriePage
      categoriaNombre="Primera"
      titulo="Serie Primera"
      descripcion="El equipo principal del club, representando los colores azul y blanco."
    />
  )
}
