import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function EstadisticasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Gestión de Estadísticas</h1>
        <p className="text-muted-foreground mt-2">
          Registra estadísticas detalladas por jugador y partido
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Próximamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta sección estará disponible próximamente. Aquí podrás:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm">
            <li>Seleccionar un partido</li>
            <li>Registrar estadísticas por jugador (goles, asistencias, tarjetas)</li>
            <li>Ver estadísticas acumuladas</li>
            <li>Exportar reportes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
