'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MonitorSmartphone,
  CalendarDays,
  Newspaper,
  PenLine,
  Images,
  ImageIcon,
  Users,
  Shield,
  Swords,
  Wallet,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const secciones = [
  {
    titulo: null,
    items: [{ name: 'Inicio', href: '/admin', icon: LayoutDashboard }],
  },
  {
    titulo: 'Contenido',
    items: [
      { name: 'Portada', href: '/admin/hero', icon: MonitorSmartphone },
      { name: 'Programación', href: '/admin/programacion', icon: CalendarDays },
      { name: 'Rivales', href: '/admin/rivales', icon: Swords },
      { name: 'Noticias', href: '/admin/noticias', icon: Newspaper },
      { name: 'Redactores', href: '/admin/redactores', icon: PenLine },
      { name: 'Galerías', href: '/admin/galeria', icon: Images },
      { name: 'Imágenes', href: '/admin/medios', icon: ImageIcon },
    ],
  },
  {
    titulo: 'Club',
    items: [
      { name: 'Plantel', href: '/admin/jugadores', icon: Users },
      { name: 'Series', href: '/admin/series', icon: Shield },
      { name: 'Cuotas', href: '/admin/cuotas', icon: Wallet },
    ],
  },
];

function estaActivo(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Navegacion({ onNavigate, cuotas }: { onNavigate?: () => void; cuotas: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col bg-azul-primario text-white">
      <Link href="/admin" onClick={onNavigate} className="flex h-16 shrink-0 items-center px-5 border-b border-white/10">
        <p className="font-heading font-bold">Administración</p>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {secciones.map((seccion, i) => (
          <div key={seccion.titulo ?? i}>
            {seccion.titulo && (
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-azul-cielo/80">
                {seccion.titulo}
              </p>
            )}
            <ul role="list" className="space-y-1">
              {seccion.items.filter((item) => cuotas || item.href !== '/admin/cuotas').map((item) => {
                const activo = estaActivo(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={activo ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        activo
                          ? 'bg-white text-azul-primario shadow-sm'
                          : 'text-white/85 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          Ver sitio
        </a>
        <button
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ cuotas }: { cuotas: boolean }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* Escritorio: barra fija a la izquierda */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <Navegacion cuotas={cuotas} />
      </aside>

      {/* Móvil: barra superior + panel deslizable */}
      <div className="sticky top-0 z-40 flex h-16 items-center bg-azul-primario px-4 text-white lg:hidden">
        <button onClick={() => setAbierto(true)} aria-label="Abrir menú" className="-ml-1 rounded-md p-1.5 hover:bg-white/10">
          <Menu className="h-6 w-6" />
        </button>
        {/* Escudo centrado, como en el header del sitio */}
        <Link href="/admin" className="absolute left-1/2 -translate-x-1/2">
          <Image src="/images/escudoazulyblanco.png" alt="Inicio de administración" width={48} height={48} className="h-12 w-12 object-contain" />
        </Link>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAbierto(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 z-10 rounded-md p-1 text-white/80 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            <Navegacion onNavigate={() => setAbierto(false)} cuotas={cuotas} />
          </div>
        </div>
      )}
    </>
  );
}
