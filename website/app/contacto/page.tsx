import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FormularioContacto } from '@/components/contacto/FormularioContacto'
import { SITE_CONFIG } from '@/lib/constants'
import { Mail, Phone, MapPin } from 'lucide-react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'

export const metadata = {
  title: 'Contacto',
  description: 'Contacta al Club Deportivo Azul y Blanco de Curicó: súmate al club o consulta por nuestras series.',
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
              ¿Quieres ser parte del club? ¡Escríbenos!
            </p>
          </div>
        </section>

        {/* Contenido Principal */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

              {/* Formulario */}
              <div className="lg:col-span-3">
                <FormularioContacto />
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

                    {/* Teléfono: se muestra solo si hay un número real en SITE_CONFIG */}
                    {SITE_CONFIG.contact.phone && (
                      <a
                        href={`tel:${SITE_CONFIG.contact.phone}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-azul-primario transition-colors"
                      >
                        <Phone className="w-5 h-5 text-azul-primario" />
                        <span>{SITE_CONFIG.contact.phone}</span>
                      </a>
                    )}

                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 text-azul-primario flex-shrink-0" />
                      <span>{SITE_CONFIG.contact.address}</span>
                    </div>
                  </div>

                  {/* Redes sociales - Botones pequeños */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-3">Síguenos en redes</p>
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
