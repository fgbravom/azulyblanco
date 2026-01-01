import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from 'lucide-react';

export default function GaleriaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Gestión de Galería</h1>
        <p className="text-muted-foreground mt-2">
          Administra álbumes de fotos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Próximamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta sección estará disponible próximamente. Aquí podrás:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm">
            <li>Crear álbumes de fotos</li>
            <li>Subir múltiples imágenes</li>
            <li>Organizar fotos por categorías</li>
            <li>Editar metadatos de álbumes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
