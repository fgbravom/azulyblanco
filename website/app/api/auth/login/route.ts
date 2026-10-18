import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { ipDe, limpiarIntentos, loginBloqueado, registrarFallo } from '@/lib/auth/intentos';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (typeof password !== 'string' || !password) {
      return NextResponse.json(
        { error: 'Contraseña requerida' },
        { status: 400 }
      );
    }

    const ip = ipDe(request);
    if (await loginBloqueado(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espera 15 minutos.' },
        { status: 429 }
      );
    }

    const isValid = await verifyPassword(password);

    if (!isValid) {
      await registrarFallo(ip);
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    await limpiarIntentos(ip);
    await createSession({ rol: 'admin' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
