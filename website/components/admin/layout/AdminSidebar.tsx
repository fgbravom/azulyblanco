'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Trophy,
  BarChart3,
  Newspaper,
  Image
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Jugadores', href: '/admin/jugadores', icon: Users },
  { name: 'Partidos', href: '/admin/partidos', icon: Trophy },
  { name: 'Estadísticas', href: '/admin/estadisticas', icon: BarChart3 },
  { name: 'Noticias', href: '/admin/noticias', icon: Newspaper },
  { name: 'Galería', href: '/admin/galeria', icon: Image },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-azul-primario px-6 pb-4">
        {/* Logo/Título */}
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-heading font-bold text-white">
            Azul y Blanco
          </h1>
        </div>

        {/* Navegación */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white text-azul-primario'
                        : 'text-white hover:bg-azul-oscuro hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
