import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'blog')

export interface BlogPost {
  slug: string
  title: string
  description: string
  tags: string
  date: string
  content: string
}

export interface BlogPostMetadata {
  slug: string
  title: string
  description: string
  tags: string
  date: string
}

/**
 * Obtiene todos los archivos .md del directorio blog
 */
function getPostFiles(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'))
}

/**
 * Obtiene todos los posts con su metadata, ordenados por fecha descendente
 */
export function getAllPosts(): BlogPostMetadata[] {
  const files = getPostFiles()

  const posts = files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

    return {
      slug,
      title: data.title || 'Sin título',
      description: data.description || '',
      tags: data.tags || '',
      date: data.date || '',
    }
  })

  // Ordenar por fecha descendente (más reciente primero)
  return posts.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    return 0
  })
}

/**
 * Obtiene un post específico por su slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)

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
      content,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

/**
 * Obtiene todos los slugs de posts disponibles
 */
export function getAllPostSlugs(): string[] {
  const files = getPostFiles()
  return files.map(filename => filename.replace(/\.md$/, ''))
}
