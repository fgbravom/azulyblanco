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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-azul-primario/40 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/escudoazulyblanco.png"
              alt={`Escudo ${SITE_CONFIG.name}`}
              width={50}
              height={50}
              className="h-10 md:h-12 w-auto"
            />
            <span className="text-xl font-bold text-black hidden sm:block">
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6" suppressHydrationWarning>
            {mounted && NAVIGATION_ITEMS.map((item) => (
              item.submenu ? (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-azul-primario transition-colors outline-none data-[state=open]:text-azul-primario">
                    {item.title}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
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
                  className="text-sm font-medium text-gray-700 hover:text-azul-primario transition-colors"
                >
                  {item.title}
                </Link>
              )
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button asChild className="bg-azul-primario hover:bg-azul-oscuro text-white">
              <Link href="/contacto">Únete al Club</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t-[3px] border-azul-primario/40">
            <nav className="flex flex-col gap-2">
              {NAVIGATION_ITEMS.map((item) => (
                item.submenu ? (
                  <div key={item.href}>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.title ? null : item.title)}
                      className="w-full flex items-center justify-between text-base font-medium text-gray-700 hover:text-azul-primario transition-colors py-2"
                    >
                      {item.title}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSubmenu === item.title ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openSubmenu === item.title && (
                      <div className="ml-4 mt-2 flex flex-col gap-2">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            className="text-sm font-medium text-gray-600 hover:text-azul-primario transition-colors py-2"
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
                    className="text-base font-medium text-gray-700 hover:text-azul-primario transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                )
              ))}
              <Button asChild className="bg-azul-primario hover:bg-azul-oscuro text-white mt-2">
                <Link href="/contacto" onClick={() => setMobileMenuOpen(false)}>
                  Únete al Club
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
