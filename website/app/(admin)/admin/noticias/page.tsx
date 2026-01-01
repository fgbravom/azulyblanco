import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

export default function NoticiasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Gestión de Noticias</h1>
        <p className="text-muted-foreground mt-2">
          Crea y publica noticias del club
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Próximamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta sección estará disponible próximamente. Aquí podrás:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm">
            <li>Crear nuevas noticias</li>
            <li>Editar contenido en Markdown</li>
            <li>Publicar/despublicar noticias</li>
            <li>Gestionar categorías y tags</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
