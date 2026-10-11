import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verificarToken } from '@/lib/auth/token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login y logout quedan abiertos
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const autenticado = await verificarToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    process.env.SESSION_SECRET
  );

  if (autenticado) {
    return NextResponse.next();
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
