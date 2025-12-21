import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const noticiasDirectory = path.join(process.cwd(), 'noticias')

export interface Noticia {
  slug: string
  title: string
  description: string
  tags: string
  date: string
  categoria: string
  author?: string
  content: string
}

export interface NoticiaMetadata {
  slug: string
  title: string
  description: string
  tags: string
  date: string
  categoria: string
  author?: string
}

/**
 * Obtiene todos los archivos .md del directorio noticias
 */
function getNoticiaFiles(): string[] {
  if (!fs.existsSync(noticiasDirectory)) {
    return []
  }
  return fs.readdirSync(noticiasDirectory).filter(file => file.endsWith('.md'))
}

/**
 * Obtiene todas las noticias con su metadata, ordenadas por fecha descendente
 */
export function getAllNoticias(): NoticiaMetadata[] {
  const files = getNoticiaFiles()

  const noticias = files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const fullPath = path.join(noticiasDirectory, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

    return {
      slug,
      title: data.title || 'Sin título',
      description: data.description || '',
      tags: data.tags || '',
      date: data.date || '',
      categoria: data.categoria || data.tags?.split(',')[0]?.trim() || 'General',
      author: data.author || data.autor,
    }
  })

  // Ordenar por fecha descendente (más reciente primero)
  return noticias.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    return 0
  })
}

/**
 * Obtiene noticias filtradas por categoría
 */
export function getNoticiasByCategoria(categoria: string): NoticiaMetadata[] {
  const allNoticias = getAllNoticias()
  if (categoria === 'Todas') {
    return allNoticias
  }
  return allNoticias.filter(noticia => noticia.categoria === categoria)
}

/**
 * Obtiene todas las categorías únicas
 */
export function getAllCategorias(): string[] {
  const noticias = getAllNoticias()
  const categorias = new Set(noticias.map(n => n.categoria))
  return ['Todas', ...Array.from(categorias).sort()]
}

/**
 * Obtiene una noticia específica por su slug
 */
export function getNoticiaBySlug(slug: string): Noticia | null {
  try {
    const fullPath = path.join(noticiasDirectory, `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || 'Sin título',
      description: data.description || '',
      tags: data.tags || '',
      date: data.date || '',
      categoria: data.categoria || data.tags?.split(',')[0]?.trim() || 'General',
      author: data.author || data.autor,
      content,
    }
  } catch (error) {
    console.error(`Error reading noticia ${slug}:`, error)
    return null
  }
}

/**
 * Obtiene todos los slugs de noticias disponibles
 */
export function getAllNoticiaSlugs(): string[] {
  const files = getNoticiaFiles()
  return files.map(filename => filename.replace(/\.md$/, ''))
}
