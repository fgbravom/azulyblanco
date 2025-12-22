'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { PhotoDescription } from '@/lib/gallery'

interface AlbumViewerProps {
  fotos: string[]
  albumTitle: string
  photoDescriptions?: PhotoDescription[]
}

export function AlbumViewer({ fotos, albumTitle, photoDescriptions = [] }: AlbumViewerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Helper para obtener descripción de una foto
  const getPhotoDescription = (fotoUrl: string) => {
    const filename = fotoUrl.split('/').pop()
    return photoDescriptions?.find(pd => pd.filename === filename)?.description
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % fotos.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + fotos.length) % fotos.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'ArrowLeft') goToPrevious()
  }

  return (
    <>
      {/* Grid de fotos */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto, index) => {
              const hasDescription = !!getPhotoDescription(foto)
              return (
                <div
                  key={index}
                  className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg bg-gray-200"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={foto}
                    alt={`${albumTitle} - Foto ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Indicador de descripción */}
                  {hasDescription && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
                      <Info className="w-4 h-4 text-azul-primario" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Contador */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {fotos.length}
          </div>

          {/* Botón anterior */}
          {fotos.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>
          )}

          {/* Imagen actual */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4 flex flex-col">
            <div className="relative flex-1">
              <Image
                src={fotos[currentIndex]}
                alt={`${albumTitle} - Foto ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Descripción de la foto */}
            {getPhotoDescription(fotos[currentIndex]) && (
              <div className="bg-black/80 backdrop-blur-sm text-white p-4 mt-2 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base leading-relaxed">
                    {getPhotoDescription(fotos[currentIndex])}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botón siguiente */}
          {fotos.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-12 h-12" />
            </button>
          )}

          {/* Click en fondo para cerrar */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeLightbox}
          />
        </div>
      )}
    </>
  )
}
