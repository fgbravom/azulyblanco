import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata = {
  title: 'Contacto',
  description: 'Contacta con el Club Azul y Blanco',
}

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro to-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Contacto</h1>
            <p className="text-xl text-gray-200">
              ¿Querés ser parte del club? ¡Escribinos!
            </p>
          </div>
        </section>

        {/* Contenido */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Formulario */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Envianos un mensaje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="nombre">Nombre completo *</Label>
                        <Input
                          id="nombre"
                          type="text"
                          placeholder="Juan Pérez"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          type="tel"
                          placeholder="+54 9 11 1234-5678"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="asunto">Asunto *</Label>
                        <Input
                          id="asunto"
                          type="text"
                          placeholder="Quiero unirme al club"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="mensaje">Mensaje *</Label>
                        <Textarea
                          id="mensaje"
                          placeholder="Contanos por qué querés ser parte de Azul y Blanco..."
                          required
                          className="mt-1 min-h-32"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-azul-primario hover:bg-azul-oscuro">
                        Enviar Mensaje
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        * Campos obligatorios
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-6">
                {/* Datos de Contacto */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📧</div>
                      <div>
                        <p className="font-semibold">Email</p>
                        <a
                          href={`mailto:${SITE_CONFIG.contact.email}`}
                          className="text-azul-primario hover:underline"
                        >
                          {SITE_CONFIG.contact.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📱</div>
                      <div>
                        <p className="font-semibold">Teléfono</p>
                        <a
                          href={`tel:${SITE_CONFIG.contact.phone}`}
                          className="text-azul-primario hover:underline"
                        >
                          {SITE_CONFIG.contact.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📍</div>
                      <div>
                        <p className="font-semibold">Dirección</p>
                        <p className="text-gray-600">{SITE_CONFIG.contact.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Horarios */}
                <Card>
                  <CardHeader>
                    <CardTitle>Horarios de Entrenamiento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Sábados</span>
                      <span className="text-gray-600">15:00 - 17:00hs</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Domingos</span>
                      <span className="text-gray-600">09:00 - 11:00hs</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      📍 Estadio Municipal - Campo 2
                    </p>
                  </CardContent>
                </Card>

                {/* Redes Sociales */}
                <Card>
                  <CardHeader>
                    <CardTitle>Seguinos en Redes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <a
                        href={SITE_CONFIG.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        <span className="text-xl">📷</span>
                        <span className="font-semibold">Instagram</span>
                      </a>

                      <a
                        href={SITE_CONFIG.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        <span className="text-xl">👍</span>
                        <span className="font-semibold">Facebook</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Mapa Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cómo Llegar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <div className="text-5xl mb-2">🗺️</div>
                        <p className="text-sm">Mapa de ubicación</p>
                        <p className="text-xs">(Integrar Google Maps)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
