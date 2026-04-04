import SeriePage from '@/app/series/_components/SeriePage'

export const metadata = {
  title: 'Serie Honor',
  description: 'Plantel de la Serie Honor del Club Azul y Blanco',
}

export default function SerieHonorPage() {
  return (
    <SeriePage
      categoriaNombre="Honor"
      titulo="Serie Honor"
      descripcion="Pasión y experiencia al servicio del club."
    />
  )
}
