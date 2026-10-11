import SeriePage from '@/app/series/_components/SeriePage'

export const metadata = {
  title: 'Serie Primera',
  description: 'Plantel de la Serie Primera del Club Deportivo Azul y Blanco de Curicó.',
}

export default function SeriePrimeraPage() {
  return (
    <SeriePage
      slug="primera"
      categoriaNombre="Primera"
      titulo="Serie Primera"
      descripcion="El equipo principal del club, representando los colores azul y blanco."
    />
  )
}
