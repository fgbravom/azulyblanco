import { NextRequest, NextResponse } from 'next/server';
import { verificarCredenciales } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { ipDe, limpiarIntentos, loginBloqueado, registrarFallo } from '@/lib/auth/intentos';

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json();

    if (typeof usuario !== 'string' || !usuario.trim() || typeof password !== 'string' || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña requeridos' },
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

    const datos = await verificarCredenciales(usuario, password);

    if (!datos) {
      await registrarFallo(ip);
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    await limpiarIntentos(ip);
    await createSession(datos);

    return NextResponse.json({ success: true, rol: datos.rol });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
