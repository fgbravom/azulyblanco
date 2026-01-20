'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SITE_CONFIG, NAVIGATION_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'

interface HeaderProps {
  isHome?: boolean
  hideInitially?: boolean
}

export function Header({ isHome = false, hideInitially = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(!hideInitially)

  useEffect(() => {
    setMounted(true)

    if (hideInitially) {
      // Esperar a que la imagen del hero esté cargada antes de mostrar el header
      const handleImageLoaded = () => {
        const timer = setTimeout(() => {
          setVisible(true)
        }, 100)
        return () => clearTimeout(timer)
      }

      window.addEventListener('heroImageLoaded', handleImageLoaded)
      return () => window.removeEventListener('heroImageLoaded', handleImageLoaded)
    }
  }, [hideInitially])

  useEffect(() => {
    if (isHome) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 50)
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isHome])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all ${
          isHome
            ? scrolled
              ? 'bg-azul-primario'
              : 'bg-transparent'
            : 'bg-azul-primario'
        }`}
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transitionDuration: visible ? '500ms' : '0ms'
        }}
      >
        <div className="container mx-auto px-2 2xl:px-4">
          <div className="flex h-22 2xl:h-20 items-center justify-between gap-1 2xl:gap-4">
            {/* Mobile Menu Button - Visible below 1536px */}
            <button
              className="2xl:hidden p-2 order-1 text-white transition-colors duration-300 relative z-[60]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo - Always centered */}
            <Link href="/" className="flex items-center flex-shrink-0 order-2 absolute left-1/2 -translate-x-1/2 2xl:top-1">
              <Image
                src="/images/escudoazulyblanco.png"
                alt={`Escudo ${SITE_CONFIG.name}`}
                width={200}
                height={200}
                className="h-20 2xl:h-35 w-auto"
              />
            </Link>

            {/* Navigation - Desktop (visible from 1536px to handle 125% zoom) */}
            <nav className="hidden 2xl:flex items-center gap-2 order-1 2xl:ml-4 2xl:pt-7 max-w-[40%]" suppressHydrationWarning>
              {mounted && NAVIGATION_ITEMS.map((item) => (
                item.submenu ? (
                  <DropdownMenu key={item.href}>
                    <DropdownMenuTrigger className="flex items-center gap-0.5 text-xs lg:text-sm font-medium text-white hover:bg-white hover:text-azul-primario transition-colors outline-none data-[state=open]:bg-white data-[state=open]:text-azul-primario whitespace-nowrap px-1.5 py-1">
                      {item.title}
                      <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[180px] bg-azul-primario border-0 p-0 overflow-hidden">
                      {item.submenu.map((subitem) => (
                        <DropdownMenuItem key={subitem.href} asChild className="focus:bg-white focus:text-azul-primario p-0 m-0 rounded-none">
                          <Link
                            href={subitem.href}
                            className="w-full cursor-pointer text-white hover:text-azul-primario hover:bg-white transition-colors px-4 py-2.5 block"
                          >
                            {subitem.title}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-xs lg:text-sm font-medium text-white hover:bg-white hover:text-azul-primario transition-colors whitespace-nowrap px-1.5 py-1"
                  >
                    {item.title}
                  </Link>
                )
              ))}
            </nav>

            {/* Social Media Icons - Between logo and CTA */}
            <div className="hidden 2xl:flex items-center gap-3 flex-shrink-0 order-3 2xl:pt-7 ml-30">
              <Link
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-azul-claro transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </Link>
              {/*<Link
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-azul-claro transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-6 h-6" />
              </Link>*/}
            </div>

            {/* CTA Button - Right side, visible from 1536px */}
            <div className="hidden 2xl:block flex-shrink-0 order-4 2xl:pt-3">
              <Button asChild className="bg-white hover:bg-azul-claro text-azul-primario hover:text-white text-sm px-4 h-10 transition-colors">
                <Link href="/contacto">Únete al Club</Link>
              </Button>
            </div>

            {/* Spacer for mobile to balance layout */}
            <div className="2xl:hidden w-10 order-3"></div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sidebar - Visible below 1536px */}
      <div
        className={`fixed inset-0 bg-black/50 z-[55] 2xl:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[80%] max-w-md bg-white z-[56] 2xl:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-6 right-6 p-2 text-azul-primario hover:text-azul-claro transition-colors"
          aria-label="Close menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <nav className="flex flex-col gap-4 p-6 pt-24">
          {NAVIGATION_ITEMS.map((item) => (
            item.submenu ? (
              <div key={item.href}>
                <button
                  onClick={() => setOpenSubmenu(openSubmenu === item.title ? null : item.title)}
                  className="w-[60%] flex items-center justify-between text-xl font-semibold text-azul-primario hover:text-azul-claro transition-colors py-3"
                >
                  {item.title}
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSubmenu === item.title ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSubmenu === item.title && (
                  <div className="ml-6 mt-3 flex flex-col gap-3 w-[60%]">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className="text-lg font-medium text-azul-primario/80 hover:text-azul-claro transition-colors py-2"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setOpenSubmenu(null)
                        }}
                      >
                        {subitem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-xl font-semibold text-azul-primario hover:text-azul-claro transition-colors py-3 w-[60%]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            )
          ))}
          <Button asChild className="bg-azul-primario hover:bg-azul-oscuro text-white mt-4 transition-colors w-[60%] h-12 text-lg">
            <Link href="/contacto" onClick={() => setMobileMenuOpen(false)}>
              Únete al Club
            </Link>
          </Button>

          {/* Social Media - Mobile */}
          <div className="mt-6 pt-6 border-t border-gray-200 w-[60%]">
            
            <Link
              href={SITE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-azul-primario hover:text-azul-claro transition-colors py-2"
              aria-label="Instagram"
            >
              <FaInstagram className="w-6 h-6" />
              <span className="text-lg font-medium">Instagram</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
