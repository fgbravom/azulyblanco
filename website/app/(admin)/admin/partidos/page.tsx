import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function PartidosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Gestión de Partidos</h1>
        <p className="text-muted-foreground mt-2">
          Programa partidos y actualiza resultados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Próximamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta sección estará disponible próximamente. Aquí podrás:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm">
            <li>Programar nuevos partidos</li>
            <li>Actualizar resultados</li>
            <li>Ver calendario completo</li>
            <li>Gestionar información de cada partido (estadio, árbitro, etc.)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
