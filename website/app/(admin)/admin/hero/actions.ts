'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { BUCKET_MEDIOS, type HeroFoto } from '@/lib/contenido/tipos'
import { HERO_WIDTHS } from '@/components/hero/hero-boot'
import { cargarSharp } from '@/lib/admin/sharp'

type Dispositivo = HeroFoto['dispositivo']

// Mismos parámetros que scripts/optimize-hero-images.mjs, para que las fotos
// subidas desde el admin pesen y se vean igual que las del repositorio.
const AVIF_OPTIONS = { quality: 45, effort: 4 }
const WEBP_OPTIONS = { quality: 72, effort: 6 }
// En móvil el hero es más alto que ancho (60vh): la imagen debe cubrir una
// caja de ancho × ancho*1.3 para no verse estirada en fotos apaisadas.
const MOBILE_BOX_RATIO = 1.3
// Las variantes viven en carpetas con id único y nunca se sobrescriben
const CACHE_UN_ANIO = '31536000'

const RUTA_ORIGINAL = /^hero\/([0-9a-f-]{36})\/original\.(jpg|png|webp|gif|avif)$/

function cambios() {
  revalidatePath('/admin/hero')
  revalidatePath('/')
}

function redimensionar(original: Buffer, dispositivo: Dispositivo, ancho: number) {
  const imagen = cargarSharp()(original).rotate() // respeta la orientación EXIF
  if (dispositivo === 'mobile') {
    return imagen.resize(ancho, Math.round(ancho * MOBILE_BOX_RATIO), { fit: 'outside', withoutEnlargement: true })
  }
  return imagen.resize({ width: ancho, withoutEnlargement: true })
}

async function borrarCarpeta(carpeta: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.storage.from(BUCKET_MEDIOS).list(carpeta)
  if (data?.length) {
    await supabase.storage.from(BUCKET_MEDIOS).remove(data.map((f) => `${carpeta}/${f.name}`))
  }
}

async function contarActivas(dispositivo: Dispositivo, excepto?: string) {
  let consulta = createAdminClient()
    .from('hero_fotos')
    .select('*', { count: 'exact', head: true })
    .eq('dispositivo', dispositivo)
    .eq('activo', true)
  if (excepto) consulta = consulta.neq('id', excepto)
  const { count } = await consulta
  return count ?? 0
}

export async function listarFotosHero(): Promise<HeroFoto[]> {
  await requireAdmin()
  const { data, error } = await createAdminClient()
    .from('hero_fotos')
    .select('*')
    .order('orden')
    .order('created_at')
  if (error) throw new Error(error.message)
  return data as HeroFoto[]
}

/**
 * Toma el original que el navegador subió a hero/<id>/original.* y genera al
 * lado las variantes <ancho>.avif y <ancho>.webp. Con `reemplaza`, la foto
 * nueva toma el lugar (orden y estado) de una existente, que se elimina.
 */
export async function procesarFotoHero(
  dispositivo: Dispositivo,
  pathOriginal: string,
  reemplaza?: string
): Promise<HeroFoto> {
  await requireAdmin()
  if (dispositivo !== 'desktop' && dispositivo !== 'mobile') throw new Error('Dispositivo inválido')

  const coincidencia = pathOriginal.match(RUTA_ORIGINAL)
  if (!coincidencia) throw new Error('Ruta inválida')
  const carpeta = `hero/${coincidencia[1]}`

  const supabase = createAdminClient()
  const bucket = supabase.storage.from(BUCKET_MEDIOS)

  const { data: archivo, error: errorDescarga } = await bucket.download(pathOriginal)
  if (errorDescarga) throw new Error(`No se pudo leer la foto subida: ${errorDescarga.message}`)
  const original = Buffer.from(await archivo.arrayBuffer())
  const { width, height } = await cargarSharp()(original).rotate().metadata()

  try {
    for (const ancho of HERO_WIDTHS[dispositivo]) {
      const [avif, webp] = await Promise.all([
        redimensionar(original, dispositivo, ancho).avif(AVIF_OPTIONS).toBuffer(),
        redimensionar(original, dispositivo, ancho).webp(WEBP_OPTIONS).toBuffer(),
      ])
      const subidas = await Promise.all([
        bucket.upload(`${carpeta}/${ancho}.avif`, avif, { contentType: 'image/avif', cacheControl: CACHE_UN_ANIO, upsert: true }),
        bucket.upload(`${carpeta}/${ancho}.webp`, webp, { contentType: 'image/webp', cacheControl: CACHE_UN_ANIO, upsert: true }),
      ])
      const fallo = subidas.find((s) => s.error)
      if (fallo?.error) throw new Error(fallo.error.message)
    }
  } catch (error) {
    await borrarCarpeta(carpeta)
    throw new Error(`No se pudo procesar la foto: ${error instanceof Error ? error.message : error}`)
  }

  const base_url = `${bucket.getPublicUrl(carpeta).data.publicUrl}/`
  const datos = { dispositivo, base_url, carpeta, ancho_original: width ?? null, alto_original: height ?? null }

  let fila
  if (reemplaza) {
    const { data: anterior } = await supabase.from('hero_fotos').select('carpeta').eq('id', reemplaza).single()
    const { data, error } = await supabase.from('hero_fotos').update(datos).eq('id', reemplaza).select().single()
    if (error) throw new Error(error.message)
    if (anterior?.carpeta) await borrarCarpeta(anterior.carpeta)
    fila = data
  } else {
    const { data: ultima } = await supabase
      .from('hero_fotos')
      .select('orden')
      .eq('dispositivo', dispositivo)
      .order('orden', { ascending: false })
      .limit(1)
      .maybeSingle()
    const { data, error } = await supabase
      .from('hero_fotos')
      .insert({ ...datos, orden: (ultima?.orden ?? -1) + 1 })
      .select()
      .single()
    if (error) throw new Error(error.message)
    fila = data
  }

  cambios()
  return fila as HeroFoto
}

export async function cambiarVisibilidadHero(id: string, activo: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()

  if (!activo) {
    const { data: foto } = await supabase.from('hero_fotos').select('dispositivo').eq('id', id).single()
    if (foto && (await contarActivas(foto.dispositivo, id)) === 0) {
      throw new Error('Debe quedar al menos una foto visible en cada versión del hero')
    }
  }

  const { error } = await supabase.from('hero_fotos').update({ activo }).eq('id', id)
  if (error) throw new Error(error.message)
  cambios()
}

export async function reordenarFotosHero(ids: string[]) {
  await requireAdmin()
  const supabase = createAdminClient()
  const resultados = await Promise.all(ids.map((id, orden) => supabase.from('hero_fotos').update({ orden }).eq('id', id)))
  const fallo = resultados.find((r) => r.error)
  if (fallo?.error) throw new Error(fallo.error.message)
  cambios()
}

export async function eliminarFotoHero(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: foto, error } = await supabase.from('hero_fotos').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  if (foto.activo && (await contarActivas(foto.dispositivo, id)) === 0) {
    throw new Error('Debe quedar al menos una foto visible en cada versión del hero')
  }

  // Las fotos del repositorio (carpeta null) siguen en public/images/hero: solo se quitan de la rotación
  if (foto.carpeta) await borrarCarpeta(foto.carpeta)
  const { error: errorBorrado } = await supabase.from('hero_fotos').delete().eq('id', id)
  if (errorBorrado) throw new Error(errorBorrado.message)
  cambios()
}
