import Link from 'next/link'
import Image from 'next/image'
import { SITE_CONFIG, NAVIGATION_ITEMS } from '@/lib/constants'
import { Instagram, Facebook } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo + Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/escudoazulyblanco.png"
                alt={`Escudo ${SITE_CONFIG.name}`}
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-lg font-bold text-white">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Club de fútbol amateur apasionado por el deporte. Fundado en {SITE_CONFIG.founded}.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {NAVIGATION_ITEMS.slice(0, 4).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </li>
              <li className="text-gray-400">{SITE_CONFIG.contact.address}</li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Redes Sociales</h3>
            <div className="flex gap-4">
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.name}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
