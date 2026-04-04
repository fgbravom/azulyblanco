/**
 * Optimiza las imágenes del hero sin pérdida visible de calidad.
 *
 * Desktop: redimensiona a 1920px de ancho máximo, WebP calidad 90
 * Mobile:  redimensiona a 900px de ancho máximo, WebP calidad 90
 *
 * Los originales se mueven a /public/images/originals/ como respaldo.
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = path.join(__dirname, '../public/images')
const BACKUP_DIR = path.join(IMAGES_DIR, 'originals')

const DESKTOP_FILES = [
  'fotoportada0.jpg',
  'fotoportada1.jpg',
  'fotoportada2.jpg',
  'fotoportada3.jpg',
  'fotoportada4.jpg',
  'fotoportada5.jpg',
  'fotoportada6.jpg',
]

const MOBILE_FILES = [
  'portadamovil0.jpg',
  'portadamovil1.jpg',
  'portadamovil2.jpg',
  'portadamovil3.jpg',
  'portadamovil4.jpg',
  'portadamovil5.jpg',
  'portadamovil6.jpg',
]

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatKB(bytes) {
  return (bytes / 1024).toFixed(0) + ' KB'
}

async function optimizeImage(filename, maxWidth, maxHeight) {
  const inputPath = path.join(IMAGES_DIR, filename)
  const backupPath = path.join(BACKUP_DIR, filename)

  // Nombre de salida: mismo nombre pero .webp
  const outputFilename = filename.replace('.jpg', '.webp')
  const outputPath = path.join(IMAGES_DIR, outputFilename)

  const originalSize = fs.statSync(inputPath).size

  // Mover original a backup si no existe ya
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath)
  }

  // Procesar con sharp
  await sharp(inputPath)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',        // nunca agranda, solo achica si es necesario
      withoutEnlargement: true,
    })
    .webp({
      quality: 90,          // calidad alta, diferencia visual mínima
      effort: 6,            // compresión más agresiva (0-6), más lento pero mejor ratio
    })
    .toFile(outputPath)

  const newSize = fs.statSync(outputPath).size
  const reduction = (((originalSize - newSize) / originalSize) * 100).toFixed(0)

  console.log(
    `  ✓ ${filename.padEnd(22)} ${formatMB(originalSize).padStart(8)} → ${formatKB(newSize).padStart(8)}  (-${reduction}%)`
  )

  return { originalSize, newSize }
}

async function main() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }

  let totalOriginal = 0
  let totalNew = 0

  console.log('\nDesktop (máx 1920×1080):')
  for (const file of DESKTOP_FILES) {
    const inputPath = path.join(IMAGES_DIR, file)
    if (!fs.existsSync(inputPath)) {
      console.log(`  - ${file} no encontrado, saltando`)
      continue
    }
    const { originalSize, newSize } = await optimizeImage(file, 1920, 1080)
    totalOriginal += originalSize
    totalNew += newSize
  }

  console.log('\nMobile (máx 900×1350):')
  for (const file of MOBILE_FILES) {
    const inputPath = path.join(IMAGES_DIR, file)
    if (!fs.existsSync(inputPath)) {
      console.log(`  - ${file} no encontrado, saltando`)
      continue
    }
    const { originalSize, newSize } = await optimizeImage(file, 900, 1350)
    totalOriginal += originalSize
    totalNew += newSize
  }

  const totalReduction = (((totalOriginal - totalNew) / totalOriginal) * 100).toFixed(0)
  console.log(`\nTotal: ${formatMB(totalOriginal)} → ${formatMB(totalNew)} (-${totalReduction}%)`)
  console.log(`\nOriginales guardados en: public/images/originals/`)
  console.log(`\nAhora actualizá las referencias en HeroCarousel.tsx:`)
  console.log(`  fotoportada*.jpg → fotoportada*.webp`)
  console.log(`  portadamovil*.jpg → portadamovil*.webp`)
}

main().catch(console.error)
