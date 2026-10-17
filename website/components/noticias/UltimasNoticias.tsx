import Link from 'next/link'
import Image from 'next/image'
import { Newspaper } from 'lucide-react'
import type { NoticiaPublica } from '@/lib/contenido/publico'

interface UltimasNoticiasProps {
  noticias: NoticiaPublica[]
}

// En móvil y tablet las tarjetas forman una tira desplazable con snap;
// desde lg pasan a una grilla de cuatro columnas.
const ITEM = 'shrink-0 w-[78%] sm:w-[45%] lg:w-auto snap-start'

function fechaRelativa(fecha: string) {
  // El servidor corre en UTC: "hoy" se calcula en hora de Chile
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
  const dias = Math.round((Date.parse(hoy) - Date.parse(fecha)) / 86_400_000)
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })
}

function NoticiaTile({ noticia }: { noticia: NoticiaPublica }) {
  return (
    <Link href={`/noticias/${noticia.slug}`} className={`${ITEM} group flex flex-col`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-azul-oscuro to-azul-medio">
        {noticia.coverUrl ? (
          <Image
            src={noticia.coverUrl}
            alt={noticia.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 78vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Newspaper className="w-12 h-12 text-white/20" />
          </div>
        )}
      </div>
      <div className="px-2 pt-5 pb-2">
        <p className="text-xs mb-2">
          <span className="font-bold uppercase text-white">{noticia.categoria}</span>
          {noticia.date && <span className="text-white/60"> — {fechaRelativa(noticia.date)}</span>}
        </p>
        <h3 className="text-white font-semibold leading-snug line-clamp-3 decoration-azul-brillante decoration-2 underline-offset-4 group-hover:underline">
          {noticia.title}
        </h3>
      </div>
    </Link>
  )
}

export function UltimasNoticias({ noticias }: UltimasNoticiasProps) {
  return (
    <section className="py-12 md:py-16 bg-azul-profundo">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold uppercase text-white">Últimas noticias</h2>
          <Link
            href="/noticias"
            className="text-sm md:text-base font-semibold text-white border-b-2 border-white pb-1 hover:text-azul-brillante hover:border-azul-brillante transition-colors"
          >
            Ver todas
          </Link>
        </div>

        {noticias.length === 0 ? (
          <p className="py-12 text-center text-white/60">No hay noticias disponibles en este momento.</p>
        ) : (
          <div className="-mx-4 md:-mx-8 px-4 md:px-8 scroll-px-4 md:scroll-px-8 flex gap-0.5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {noticias.map((noticia) => (
              <NoticiaTile key={noticia.slug} noticia={noticia} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
