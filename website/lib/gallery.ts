import fs from 'fs'
import path from 'path'

const galeriaDirectory = path.join(process.cwd(), 'public', 'galeria')

export interface PhotoDescription {
  filename: string
  description: string
}

export interface AlbumMetadata {
  title: string
  description: string
  date: string
  categoria: 'partidos' | 'entrenamientos' | 'eventos' | 'historia'
  tags: string[]
  cover: string
  photoDescriptions?: PhotoDescription[]
}

export interface Album extends AlbumMetadata {
  slug: string
  fotos: string[]
  coverUrl: string
}

/**
 * Lee el archivo album.json de un directorio
 */
function readAlbumMetadata(albumPath: string): AlbumMetadata | null {
  const metadataPath = path.join(albumPath, 'album.json')

  if (!fs.existsSync(metadataPath)) {
    return null
  }

  try {
    const content = fs.readFileSync(metadataPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading album metadata at ${albumPath}:`, error)
    return null
  }
}

/**
 * Obtiene las fotos de un álbum (excluyendo album.json)
 */
function getAlbumPhotos(albumPath: string): string[] {
  if (!fs.existsSync(albumPath)) {
    return []
  }

  const files = fs.readdirSync(albumPath)

  return files.filter(file => {
    const ext = path.extname(file).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
  })
}

/**
 * Escanea una categoría y retorna todos los álbumes
 */
function getAlbumsFromCategory(categoria: string): Album[] {
  const categoryPath = path.join(galeriaDirectory, categoria)

  if (!fs.existsSync(categoryPath)) {
    return []
  }

  const albums: Album[] = []
  const entries = fs.readdirSync(categoryPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const albumPath = path.join(categoryPath, entry.name)
      const metadata = readAlbumMetadata(albumPath)

      if (metadata) {
        const fotos = getAlbumPhotos(albumPath)

        albums.push({
          slug: entry.name,
          ...metadata,
          fotos,
          coverUrl: `/galeria/${categoria}/${entry.name}/${metadata.cover}`,
        })
      }
    }
  }

  return albums
}

/**
 * Obtiene todos los álbumes de todas las categorías
 */
export function getAllAlbums(): Album[] {
  const categorias = ['partidos', 'entrenamientos', 'eventos', 'historia']
  const allAlbums: Album[] = []

  for (const categoria of categorias) {
    const albums = getAlbumsFromCategory(categoria)
    allAlbums.push(...albums)
  }

  // Ordenar por fecha descendente
  return allAlbums.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

/**
 * Obtiene álbumes filtrados por categoría
 */
export function getAlbumsByCategoria(categoria: string): Album[] {
  if (categoria === 'todas') {
    return getAllAlbums()
  }

  return getAlbumsFromCategory(categoria)
}

/**
 * Obtiene todas las categorías disponibles
 */
export function getAllCategorias(): string[] {
  return ['todas', 'partidos', 'entrenamientos', 'eventos', 'historia']
}

/**
 * Obtiene un álbum específico por categoría y slug
 */
export function getAlbumBySlug(categoria: string, slug: string): Album | null {
  const albumPath = path.join(galeriaDirectory, categoria, slug)

  if (!fs.existsSync(albumPath)) {
    return null
  }

  const metadata = readAlbumMetadata(albumPath)

  if (!metadata) {
    return null
  }

  const fotos = getAlbumPhotos(albumPath)

  return {
    slug,
    ...metadata,
    fotos,
    coverUrl: `/galeria/${categoria}/${slug}/${metadata.cover}`,
  }
}

/**
 * Obtiene todas las fotos de un álbum con URLs completas
 */
export function getAlbumPhotosWithUrls(categoria: string, slug: string): string[] {
  const album = getAlbumBySlug(categoria, slug)

  if (!album) {
    return []
  }

  return album.fotos.map(foto => `/galeria/${categoria}/${slug}/${foto}`)
}
