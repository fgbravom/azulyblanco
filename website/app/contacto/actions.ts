'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'
import { SITE_CONFIG } from '@/lib/constants'
import { contactoSchema, type EstadoContacto } from '@/lib/validations/contacto'

// Rate limit por IP en memoria: mejor esfuerzo (en Vercel cada instancia
// lleva su propia cuenta, pero igual frena envíos masivos desde un mismo origen)
const ENVIOS_POR_MINUTO = 5
const envios = new Map<string, number[]>()

function limiteAlcanzado(ip: string): boolean {
  const ahora = Date.now()
  const recientes = (envios.get(ip) ?? []).filter((t) => ahora - t < 60_000)
  if (recientes.length >= ENVIOS_POR_MINUTO) {
    envios.set(ip, recientes)
    return true
  }
  recientes.push(ahora)
  envios.set(ip, recientes)
  return false
}

const EXITO: EstadoContacto = {
  ok: true,
  mensaje: '¡Gracias! Recibimos tu mensaje y te responderemos pronto.',
}

const ERROR_GENERICO: EstadoContacto = {
  ok: false,
  mensaje: 'No se pudo enviar el mensaje. Inténtalo nuevamente o escríbenos directo al correo.',
}

/**
 * Envía el formulario público de contacto al email del club.
 * Es la única server action sin requireAdmin(): no toca la base ni el storage
 * (queda declarada como pública en tests/admin/acciones-protegidas.test.ts).
 */
export async function enviarMensajeContacto(formData: FormData): Promise<EstadoContacto> {
  // Honeypot: los bots rellenan el campo oculto; fingimos éxito sin enviar nada
  if (String(formData.get('website') ?? '').trim() !== '') return EXITO

  const ip =
    (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocida'
  if (limiteAlcanzado(ip)) {
    return {
      ok: false,
      mensaje: 'Demasiados envíos seguidos. Espera un minuto e inténtalo de nuevo.',
    }
  }

  const datos = contactoSchema.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    telefono: formData.get('telefono') ?? '',
    asunto: formData.get('asunto'),
    mensaje: formData.get('mensaje'),
  })
  if (!datos.success) {
    return {
      ok: false,
      mensaje: datos.error.issues[0]?.message ?? 'Revisa los campos del formulario.',
    }
  }
  const { nombre, email, telefono, asunto, mensaje } = datos.data

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // En local sin API key el mensaje queda en la consola del servidor para probar
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '\n[contacto] Mensaje de prueba (falta RESEND_API_KEY en .env.local):\n' +
          `De: ${nombre} <${email}>${telefono ? ` · Tel: ${telefono}` : ''}\n` +
          `Asunto: ${asunto}\n${mensaje}\n`
      )
      return {
        ok: true,
        mensaje: '¡Gracias! (Modo local: el mensaje se registró en la consola del servidor.)',
      }
    }
    console.error('[contacto] Falta RESEND_API_KEY: el mensaje no se pudo enviar')
    return ERROR_GENERICO
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    // Requiere el dominio azulyblanco.cl verificado en Resend (ver .env.example)
    from: `Sitio Azul y Blanco <no-reply@azulyblanco.cl>`,
    to: [SITE_CONFIG.contact.email],
    replyTo: email, // responder desde el correo del club llega directo al remitente
    subject: `[Sitio · Contacto] ${asunto}`,
    text:
      `Nuevo mensaje desde www.azulyblanco.cl\n\n` +
      `Nombre: ${nombre}\n` +
      `Email: ${email}\n` +
      (telefono ? `Teléfono: ${telefono}\n` : '') +
      `Asunto: ${asunto}\n\n` +
      `Mensaje:\n${mensaje}\n`,
  })

  if (error) {
    console.error('[contacto] Error de Resend:', error.message)
    return ERROR_GENERICO
  }
  return { ...EXITO, mensaje: `¡Gracias, ${nombre}! Recibimos tu mensaje y te responderemos pronto.` }
}
