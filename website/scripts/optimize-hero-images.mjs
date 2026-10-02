/**
 * Genera las variantes finales de las imágenes del hero.
 *
 * Lee los originales desde /originals/ (carpeta de respaldo, fuera de git) y escribe en
 * /public/images/hero/ una versión AVIF y otra WebP por cada ancho.
 * Se sirven como archivos estáticos (sin pasar por /_next/image), así
 * la primera visita no espera al optimizador de Vercel.
 *
 * Desktop: fotoportada{n}.jpg → 1440, 1920 y 2560 px de ancho
 * Mobile:  portadamovil{n}.jpg → 640, 828 y 1080 px de ancho
 *
 * También genera el escudo que se muestra sobre la cortina y el
 * manifiesto que consume components/hero/HeroSection.tsx.
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = path.join(__dirname, '../public/images')
const SOURCE_DIR = path.join(__dirname, '../originals')
const OUTPUT_DIR = path.join(IMAGES_DIR, 'hero')
const MANIFEST_PATH = path.join(__dirname, '../components/hero/hero-manifest.json')

const CREST_SOURCE = path.join(IMAGES_DIR, 'escudoazulyblanco.png')
const CREST_SIZE = 384

// En móvil el hero es más alto que ancho (60vh): la imagen debe cubrir
// una caja de ancho × ancho*1.3 para no verse estirada en fotos apaisadas.
const MOBILE_BOX_RATIO = 1.3

const SETS = {
  desktop: { prefix: 'fotoportada', widths: [1440, 1920, 2560] },
  mobile: { prefix: 'portadamovil', widths: [640, 828, 1080] },
}

// AVIF 45 no se distingue a simple vista de 55 y pesa casi la mitad
const AVIF_OPTIONS = { quality: 45, effort: 4 }
const WEBP_OPTIONS = { quality: 72, effort: 6 }

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatKB(bytes) {
  return (bytes / 1024).toFixed(0) + ' KB'
}

/**
 * Busca los originales de un set (prefijo + número) ordenados por número.
 */
function findSources(prefix) {
  const pattern = new RegExp(`^${prefix}(\\d+)\\.jpe?g$`, 'i')

  return fs
    .readdirSync(SOURCE_DIR)
    .map((file) => ({ file, match: file.match(pattern) }))
    .filter(({ match }) => match)
    .sort((a, b) => Number(a.match[1]) - Number(b.match[1]))
    .map(({ file }) => file)
}

function resizeFor(setName, source, width) {
  const image = sharp(source).rotate() // respeta la orientación EXIF

  if (setName === 'mobile') {
    return image.resize(width, Math.round(width * MOBILE_BOX_RATIO), {
      fit: 'outside',
      withoutEnlargement: true,
    })
  }

  return image.resize({ width, withoutEnlargement: true })
}

async function buildImage(setName, file, widths) {
  const source = path.join(SOURCE_DIR, file)
  const name = path.parse(file).name
  const sizes = []

  for (const width of widths) {
    const base = path.join(OUTPUT_DIR, `${name}-${width}`)

    await resizeFor(setName, source, width).avif(AVIF_OPTIONS).toFile(`${base}.avif`)
    await resizeFor(setName, source, width).webp(WEBP_OPTIONS).toFile(`${base}.webp`)

    sizes.push({
      width,
      avif: fs.statSync(`${base}.avif`).size,
      webp: fs.statSync(`${base}.webp`).size,
    })
  }

  const detail = sizes
    .map((s) => `${s.width}: ${formatKB(s.avif)} avif / ${formatKB(s.webp)} webp`)
    .join('  |  ')
  console.log(`  ✓ ${name.padEnd(15)} ${detail}`)

  return { name, bytes: sizes.reduce((sum, s) => sum + s.avif + s.webp, 0) }
}

async function buildCrest() {
  const output = path.join(OUTPUT_DIR, `escudo-${CREST_SIZE}.webp`)

  await sharp(CREST_SOURCE)
    .resize(CREST_SIZE, CREST_SIZE)
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(output)

  console.log(`\nEscudo de la cortina: ${formatKB(fs.statSync(output).size)}`)
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`No existe la carpeta de originales: ${SOURCE_DIR}`)
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const manifest = {}
  let totalBytes = 0

  for (const [setName, { prefix, widths }] of Object.entries(SETS)) {
    const files = findSources(prefix)
    console.log(`\n${setName} (${files.length} imágenes, anchos ${widths.join(', ')}):`)

    const names = []
    for (const file of files) {
      const { name, bytes } = await buildImage(setName, file, widths)
      names.push(name)
      totalBytes += bytes
    }

    manifest[setName] = { names, widths }
  }

  await buildCrest()

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')

  console.log(`\nTotal generado: ${formatMB(totalBytes)} en public/images/hero/`)
  console.log(`Manifiesto actualizado: components/hero/hero-manifest.json`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
