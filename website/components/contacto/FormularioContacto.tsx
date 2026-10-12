'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SITE_CONFIG } from '@/lib/constants'
import { enviarMensajeContacto } from '@/app/contacto/actions'
import type { EstadoContacto } from '@/lib/validations/contacto'
import { CheckCircle, Loader2, Send, TriangleAlert } from 'lucide-react'

/**
 * Formulario de contacto: envía por server action al email del club.
 * Muestra estado de envío, éxito y error con respaldo por correo directo.
 */
export function FormularioContacto() {
  const [estado, setEstado] = useState<EstadoContacto | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setEnviando(true)
    setEstado(null)
    try {
      const resultado = await enviarMensajeContacto(new FormData(form))
      setEstado(resultado)
      if (resultado.ok) form.reset()
    } catch {
      setEstado({
        ok: false,
        mensaje: 'No se pudo enviar el mensaje. Inténtalo nuevamente o escríbenos directo al correo.',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Envíanos un mensaje</h2>
      </div>

      {estado?.ok ? (
        /* Éxito: el formulario se reemplaza por la confirmación */
        <div className="p-6 text-center" role="status" aria-live="polite">
          <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Mensaje enviado!</h3>
          <p className="text-gray-600 mb-6">{estado.mensaje}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEstado(null)}
            className="border-azul-primario text-azul-primario hover:bg-azul-primario hover:text-white"
          >
            Enviar otro mensaje
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="p-6 space-y-5" noValidate={false}>
          {/* Honeypot: oculto para las personas, los bots suelen rellenarlo */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-gray-700">Nombre completo</Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Juan Pérez"
                required
                maxLength={120}
                className="h-11 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                maxLength={200}
                className="h-11 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-gray-700">
                Teléfono <span className="text-gray-400 text-sm">(opcional)</span>
              </Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="Ej: +56 9 1234 5678"
                maxLength={40}
                className="h-11 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asunto" className="text-gray-700">Asunto</Label>
              <Input
                id="asunto"
                name="asunto"
                type="text"
                placeholder="Quiero unirme al club"
                required
                maxLength={150}
                className="h-11 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensaje" className="text-gray-700">Mensaje</Label>
            <Textarea
              id="mensaje"
              name="mensaje"
              placeholder="Cuéntanos por qué quieres ser parte de Azul y Blanco..."
              required
              maxLength={5000}
              className="min-h-32 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20 resize-none"
            />
          </div>

          {estado && !estado.ok && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <div className="flex gap-2">
                <TriangleAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
                <div>
                  <p>{estado.mensaje}</p>
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}?subject=${encodeURIComponent('Contacto desde el sitio')}`}
                    className="underline underline-offset-2 font-medium"
                  >
                    Escribir a {SITE_CONFIG.contact.email}
                  </a>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={enviando}
            className="w-full h-12 bg-azul-primario hover:bg-azul-oscuro text-white font-medium transition-colors disabled:opacity-70"
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                Enviar Mensaje
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
