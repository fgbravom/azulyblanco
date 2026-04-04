import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, BarChart3, Newspaper } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Contar jugadores activos
    const { count: jugadoresActivos } = await supabase
      .from('jugadores')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .eq('estado', 'Activo');

    // Contar próximos partidos (este mes)
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date();
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    const { count: proximosPartidos } = await supabase
      .from('partidos')
      .select('*', { count: 'exact', head: true })
      .gte('fecha', inicioMes.toISOString().split('T')[0])
      .lte('fecha', finMes.toISOString().split('T')[0])
      .in('estado', ['Programado', 'En curso']);

    // Contar partidos jugados esta temporada
    const inicioAnio = new Date();
    inicioAnio.setMonth(0, 1);
    inicioAnio.setHours(0, 0, 0, 0);

    const { count: partidosJugados } = await supabase
      .from('partidos')
      .select('*', { count: 'exact', head: true })
      .gte('fecha', inicioAnio.toISOString().split('T')[0])
      .eq('estado', 'Finalizado');

    return {
      jugadoresActivos: jugadoresActivos || 0,
      proximosPartidos: proximosPartidos || 0,
      partidosJugados: partidosJugados || 0,
      noticias: 0, // Por ahora, cuando tengas noticias en BD lo actualizaremos
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      jugadoresActivos: 0,
      proximosPartidos: 0,
      partidosJugados: 0,
      noticias: 0,
    };
  }
}

export default async function AdminDashboard() {
  const statsData = await getStats();

  const stats = [
    {
      title: 'Jugadores Activos',
      value: statsData.jugadoresActivos.toString(),
      icon: Users,
      description: 'Total de jugadores en todas las categorías',
      href: '/admin/jugadores',
    },
    {
      title: 'Próximos Partidos',
      value: statsData.proximosPartidos.toString(),
      icon: Trophy,
      description: 'Partidos programados este mes',
      href: '/admin/partidos',
    },
    {
      title: 'Partidos Jugados',
      value: statsData.partidosJugados.toString(),
      icon: BarChart3,
      description: 'Partidos finalizados esta temporada',
      href: '/admin/estadisticas',
    },
    {
      title: 'Noticias',
      value: statsData.noticias.toString(),
      icon: Newspaper,
      description: 'Noticias publicadas',
      href: '/admin/noticias',
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
          <Link key={stat.title} href={stat.href} className="block">
            <Card className="border-azul-claro/20 hover:border-azul-primario hover:shadow-lg transition-all cursor-pointer h-full">
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
          </Link>
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
