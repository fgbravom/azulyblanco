import { revalidatePath } from 'next/cache'

/**
 * Regenera las páginas públicas afectadas por un cambio en el admin.
 * Usa 'layout' para cubrir también las rutas dinámicas de cada sección.
 */
export function revalidarSitio(...secciones: ('programacion' | 'noticias' | 'galeria' | 'series')[]) {
  for (const seccion of secciones) {
    switch (seccion) {
      case 'programacion':
        revalidatePath('/')
        revalidatePath('/partidos')
        break
      case 'noticias':
        revalidatePath('/')
        revalidatePath('/noticias', 'layout')
        break
      case 'galeria':
        revalidatePath('/galeria', 'layout')
        break
      case 'series':
        revalidatePath('/series', 'layout')
        break
    }
  }
}
