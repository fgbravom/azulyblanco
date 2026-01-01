import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, BarChart3, Newspaper } from 'lucide-react';

export default async function AdminDashboard() {
  // TODO: Obtener datos reales de la base de datos

  const stats = [
    {
      title: 'Jugadores Activos',
      value: '0',
      icon: Users,
      description: 'Total de jugadores en todas las categorías',
    },
    {
      title: 'Próximos Partidos',
      value: '0',
      icon: Trophy,
      description: 'Partidos programados este mes',
    },
    {
      title: 'Partidos Jugados',
      value: '0',
      icon: BarChart3,
      description: 'Partidos finalizados esta temporada',
    },
    {
      title: 'Noticias',
      value: '0',
      icon: Newspaper,
      description: 'Noticias publicadas',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-azul-primario">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al panel de administración de Azul y Blanco
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-azul-claro/20 hover:border-azul-primario/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-azul-primario" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-azul-primario">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sección de inicio rápido */}
      <Card className="border-azul-claro/20">
        <CardHeader>
          <CardTitle className="text-azul-primario">Inicio Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Usa el menú lateral para navegar a las diferentes secciones del panel de administración:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li><strong className="text-azul-primario">Jugadores:</strong> Gestiona la ficha completa de todos los jugadores del club</li>
            <li><strong className="text-azul-primario">Partidos:</strong> Programa partidos y actualiza resultados</li>
            <li><strong className="text-azul-primario">Estadísticas:</strong> Registra estadísticas detalladas por jugador y partido</li>
            <li><strong className="text-azul-primario">Noticias:</strong> Crea y publica noticias del club</li>
            <li><strong className="text-azul-primario">Galería:</strong> Administra álbumes de fotos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
