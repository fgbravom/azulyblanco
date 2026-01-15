import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SITE_CONFIG } from '@/lib/constants'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'

export const metadata = {
  title: 'Contacto',
  description: 'Contacta con el Club Azul y Blanco',
}

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-22 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Contacto</h1>
            <p className="text-xl text-gray-200">
              ¿Quieres ser parte del club? ¡Escribenos!
            </p>
          </div>
        </section>

        {/* Contenido Principal */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

              {/* Formulario */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">Envianos un mensaje</h2>
                  </div>

                  <form className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-gray-700">Nombre completo</Label>
                        <Input
                          id="nombre"
                          type="text"
                          placeholder="Juan Pérez"
                          required
                          className="h-11 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          required
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
                          type="tel"
                          placeholder="+569 311 930 07"
                          className="h-11 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="asunto" className="text-gray-700">Asunto</Label>
                        <Input
                          id="asunto"
                          type="text"
                          placeholder="Quiero unirme al club"
                          required
                          className="h-11 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje" className="text-gray-700">Mensaje</Label>
                      <Textarea
                        id="mensaje"
                        placeholder="Cuentanos por qué quieres ser parte de Azul y Blanco..."
                        required
                        className="min-h-32 border-gray-200 focus:border-azul-primario focus:ring-azul-primario/20 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-azul-primario hover:bg-azul-oscuro text-white font-medium transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </Button>
                  </form>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">

                {/* Información de contacto */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">Información de Contacto</h3>

                  <div className="space-y-4">
                    <a
                      href={`mailto:${SITE_CONFIG.contact.email}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-azul-primario transition-colors"
                    >
                      <Mail className="w-5 h-5 text-azul-primario" />
                      <span>{SITE_CONFIG.contact.email}</span>
                    </a>

                    <a
                      href={`tel:${SITE_CONFIG.contact.phone}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-azul-primario transition-colors"
                    >
                      <Phone className="w-5 h-5 text-azul-primario" />
                      <span>{SITE_CONFIG.contact.phone}</span>
                    </a>

                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 text-azul-primario flex-shrink-0" />
                      <span>{SITE_CONFIG.contact.address}</span>
                    </div>
                  </div>

                  {/* Redes sociales - Botones pequeños */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-3">Siguenos en redes</p>
                    <div className="flex gap-3">
                      <a
                        href={SITE_CONFIG.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-azul-primario hover:text-white transition-colors"
                        aria-label="Instagram"
                      >
                        <FaInstagram className="w-5 h-5" />
                      </a>
                      <a
                        href={SITE_CONFIG.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-azul-primario hover:text-white transition-colors"
                        aria-label="Facebook"
                      >
                        <FaFacebook className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
