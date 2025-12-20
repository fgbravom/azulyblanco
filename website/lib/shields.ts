import fs from 'fs'
import path from 'path'

const escudosDirectory = path.join(process.cwd(), 'public', 'escudos')

export interface Shield {
  year: number
  imageUrl: string
  description?: string
  designer?: string
}

/**
 * Lee metadata opcional de escudos desde escudos.json
 */
function readShieldsMetadata(): Record<string, { description?: string; designer?: string }> {
  const metadataPath = path.join(escudosDirectory, 'escudos.json')

  if (!fs.existsSync(metadataPath)) {
    return {}
  }

  try {
    const content = fs.readFileSync(metadataPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading shields metadata:', error)
    return {}
  }
}

/**
 * Obtiene todos los escudos ordenados por año (ascendente)
 */
export function getAllShields(): Shield[] {
  if (!fs.existsSync(escudosDirectory)) {
    return []
  }

  const files = fs.readdirSync(escudosDirectory)
  const metadata = readShieldsMetadata()
  const shields: Shield[] = []

  // Filtrar solo archivos de imagen y excluir README y JSON
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp']

  for (const file of files) {
    const ext = path.extname(file).toLowerCase()

    if (!imageExtensions.includes(ext)) {
      continue
    }

    // Extraer el año del nombre del archivo (ej: "2006.png" -> 2006)
    const fileName = path.basename(file, ext)
    const year = parseInt(fileName, 10)

    // Validar que el nombre sea un año válido
    if (isNaN(year) || year < 1900 || year > 2100) {
      console.warn(`Skipping file ${file}: filename is not a valid year`)
      continue
    }

    const yearStr = year.toString()
    const meta = metadata[yearStr] || {}

    shields.push({
      year,
      imageUrl: `/escudos/${file}`,
      description: meta.description,
      designer: meta.designer,
    })
  }

  // Ordenar por año ascendente (del más antiguo al más reciente)
  return shields.sort((a, b) => a.year - b.year)
}

/**
 * Obtiene un escudo específico por año
 */
export function getShieldByYear(year: number): Shield | null {
  const shields = getAllShields()
  return shields.find(shield => shield.year === year) || null
}

/**
 * Obtiene el escudo más reciente
 */
export function getCurrentShield(): Shield | null {
  const shields = getAllShields()
  return shields.length > 0 ? shields[shields.length - 1] : null
}
