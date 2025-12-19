'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SITE_CONFIG, NAVIGATION_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/escudoazulyblanco.png"
              alt={`Escudo ${SITE_CONFIG.name}`}
              width={50}
              height={50}
              className="h-12 w-auto"
            />
            <span className="text-xl font-bold text-black hidden sm:block">
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-azul-primario transition-colors"
              >
                {item.title}
              </Link>
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
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium text-gray-700 hover:text-azul-primario transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
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
