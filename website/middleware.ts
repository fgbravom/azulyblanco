import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verificarToken } from '@/lib/auth/token';

// Lo único del panel que ve un redactor
const REDACTOR_RUTAS = ['/admin/noticias', '/admin/cuenta'];

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

  if (sesion?.rol === 'redactor') {
    // Las APIs son solo del admin
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (REDACTOR_RUTAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/admin/noticias', request.url));
  }

  // Las APIs solo las usa el admin: exponen datos personales del plantel
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
