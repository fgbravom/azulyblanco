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

interface HeaderProps {
  isHome?: boolean
}

export function Header({ isHome = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)

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
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isHome
          ? scrolled
            ? 'bg-azul-primario'
            : 'bg-azul-primario md:bg-transparent'
          : 'bg-azul-primario'
      }`}>
        <div className="container mx-auto px-2 md:px-3 lg:px-4">
          <div className="flex h-22 md:h-16 lg:h-20 items-center justify-between gap-1 md:gap-2 lg:gap-4">
            {/* Mobile Menu Button - Left on mobile */}
            <button
              className="md:hidden p-2 order-1 text-white transition-colors duration-300 relative z-[60]"
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

            {/* Logo - Center on mobile, left on desktop */}
            <Link href="/" className="flex items-center flex-shrink-0 order-2 md:order-1 absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0">
              <Image
                src="/images/escudoazulyblanco.png"
                alt={`Escudo ${SITE_CONFIG.name}`}
                width={100}
                height={100}
                className="h-20 md:h-11 lg:h-16 w-auto"
              />
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-6 order-3 md:order-2" suppressHydrationWarning>
              {mounted && NAVIGATION_ITEMS.map((item) => (
                item.submenu ? (
                  <DropdownMenu key={item.href}>
                    <DropdownMenuTrigger className="flex items-center gap-0.5 text-[11px] lg:text-sm font-medium text-white hover:text-azul-claro transition-colors outline-none data-[state=open]:text-azul-claro whitespace-nowrap">
                      {item.title}
                      <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[180px] bg-white">
                      {item.submenu.map((subitem) => (
                        <DropdownMenuItem key={subitem.href} asChild>
                          <Link
                            href={subitem.href}
                            className="cursor-pointer text-gray-700 hover:text-azul-primario hover:bg-blue-50 focus:text-azul-primario focus:bg-blue-50"
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
                    className="text-[11px] lg:text-sm font-medium text-white hover:text-azul-claro transition-colors whitespace-nowrap"
                  >
                    {item.title}
                  </Link>
                )
              ))}
            </nav>

            {/* CTA Button - Right side, hidden on mobile */}
            <div className="hidden md:block flex-shrink-0 order-4 md:order-3">
              <Button asChild className="bg-white hover:bg-azul-claro text-azul-primario hover:text-white text-[11px] lg:text-sm px-2 lg:px-4 h-7 lg:h-10 transition-colors">
                <Link href="/contacto">Únete al Club</Link>
              </Button>
            </div>

            {/* Spacer for mobile to balance layout */}
            <div className="md:hidden w-10 order-3"></div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 z-[55] md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[80%] bg-white z-[56] md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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
        </nav>
      </div>
    </>
  )
}
