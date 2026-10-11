import { createRequire } from 'node:module'
import path from 'node:path'
import type Sharp from 'sharp'

/**
 * Carga sharp en tiempo de ejecución, por fuera del bundler.
 *
 * Con un `import sharp from 'sharp'` normal, Turbopack lo trata como paquete
 * externo y crea un enlace simbólico en .next/node_modules. En Windows eso
 * falla sin el «Modo de desarrollador» (os error 1314) y rompe `next dev` y
 * `next build`. Este require no lo ve el bundler; para que Vercel incluya
 * sharp en la función, next.config.mjs lo agrega con outputFileTracingIncludes.
 */
export function cargarSharp(): typeof Sharp {
  const requerir = createRequire(path.join(process.cwd(), 'package.json'))
  return requerir('sharp')
}
