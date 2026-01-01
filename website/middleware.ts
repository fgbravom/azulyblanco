import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Proteger todas las rutas /admin excepto /admin/login
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const session = request.cookies.get('admin_session');
    const sessionSecret = process.env.SESSION_SECRET;

    if (!session || !sessionSecret || session.value !== sessionSecret) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
