import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verificarToken } from '@/lib/auth/token';
import { APIS_PLANTEL_COLABORADOR, RUTAS_COLABORADOR, coincideRuta } from '@/lib/auth/permisos';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login y logout quedan abiertos
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const sesion = await verificarToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    process.env.SESSION_SECRET
  );

  if (sesion?.rol === 'admin') {
    return NextResponse.next();
  }

  if (sesion?.rol === 'colaborador') {
    // Las APIs de cada sección revisan su permiso; aquí solo se filtra cuáles existen para él
    if (pathname.startsWith('/api/')) {
      if (coincideRuta(pathname, APIS_PLANTEL_COLABORADOR)) return NextResponse.next();
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (coincideRuta(pathname, RUTAS_COLABORADOR)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/admin/noticias', request.url));
  }

  // Las APIs solo las usa el panel: exponen datos personales del plantel
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
