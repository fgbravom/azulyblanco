import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const IMAGES_DIR = './public/images';
const ORIGINALS_DIR = './public/images/originals';

// Configuración de compresión
const DESKTOP_MAX_WIDTH = 1920;
const MOBILE_MAX_WIDTH = 828;
const QUALITY = 82;

async function optimizeImage(filename) {
  const sourcePath = join(ORIGINALS_DIR, filename);
  const destPath = join(IMAGES_DIR, filename);

  const isMobile = filename.startsWith('portadamovil');
  const maxWidth = isMobile ? MOBILE_MAX_WIDTH : DESKTOP_MAX_WIDTH;

  try {
    const originalStats = await stat(sourcePath);
    const originalSize = originalStats.size;

    await sharp(sourcePath)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({
        quality: QUALITY,
        mozjpeg: true
      })
      .toFile(destPath);

    const newStats = await stat(destPath);
    const newSize = newStats.size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`✓ ${filename}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024).toFixed(0)}KB (-${reduction}%)`);

    return { filename, originalSize, newSize };
  } catch (error) {
    console.error(`✗ Error processing ${filename}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Optimizando imágenes del hero...\n');

  const files = await readdir(ORIGINALS_DIR);
  const heroImages = files.filter(f =>
    (f.startsWith('fotoportada') || f.startsWith('portadamovil')) && f.endsWith('.jpg')
  );

  console.log(`Encontradas ${heroImages.length} imágenes para optimizar\n`);

  const results = [];
  for (const file of heroImages) {
    const result = await optimizeImage(file);
    if (result) results.push(result);
  }

  // Resumen
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
  const totalReduction = ((1 - totalNew / totalOriginal) * 100).toFixed(1);

  console.log('\n========================================');
  console.log(`Total: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB → ${(totalNew / 1024 / 1024).toFixed(2)}MB (-${totalReduction}%)`);
  console.log('========================================');
}

main().catch(console.error);
