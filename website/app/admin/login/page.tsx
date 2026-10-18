'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Contraseña incorrecta');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-azul-oscuro via-azul-primario to-azul-medio p-4">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-[url('/images/patron-futbol.svg')] opacity-5"></div>

      <div className="relative w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header con logo */}
          <div className="bg-gradient-to-r from-azul-primario to-azul-claro p-6 text-center sm:p-8">
            <div className="flex justify-center mb-4">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                <Image
                  src="/images/escudoazulyblanco.png"
                  alt="Escudo Azul y Blanco"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
              Panel de Administración
            </h1>
            <p className="text-white/80 text-sm">
              Club Deportivo Azul y Blanco
            </p>
          </div>

          {/* Formulario */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-azul-primario" />
                  Contraseña de acceso
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={mostrar ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                    autoComplete="current-password"
                    className="h-12 pr-12 text-base sm:text-sm border-2 border-gray-200 focus:border-azul-primario focus:ring-azul-primario transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar((v) => !v)}
                    aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={mostrar}
                    title={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-gray-400 hover:text-azul-primario focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-primario"
                  >
                    {mostrar ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-azul-primario hover:bg-azul-oscuro text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-sm mt-6">
          Acceso restringido solo para administradores
        </p>
      </div>
    </div>
  );
}
