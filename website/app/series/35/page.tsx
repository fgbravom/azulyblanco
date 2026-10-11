import SeriePage from '@/app/series/_components/SeriePage'

export const metadata = {
  title: 'Serie 35',
  description: 'Plantel de la Serie 35 del Club Deportivo Azul y Blanco de Curicó.',
}

export default function Serie35Page() {
  return (
    <SeriePage
      slug="35"
      categoriaNombre="35"
      titulo="Serie 35"
      descripcion="La veteranía y la garra de nuestra serie máster."
    />
  )
}
