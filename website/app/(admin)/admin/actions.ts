'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { parseTags } from '@/lib/admin/slug'
import { BUCKET_MEDIOS } from '@/lib/contenido/tipos'
import { eventosDiciembrePasados, eventosEnero2026 } from '@/lib/data/eventos-enero'
import { getAllNoticiaSlugs, getNoticiaBySlug } from '@/lib/news'
import { getAllAlbums } from '@/lib/gallery'

export interface ResultadoImportacion {
  actividades: number
  noticias: number
  albumes: number
  fotos: number
  avisos: string[]
}

const MIME_POR_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

function fechaISO(valor: string | undefined): string {
  const fecha = valor?.slice(0, 10)
  return fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : new Date().toISOString().slice(0, 10)
}

export interface PendientesImportacion {
  actividades: number
  noticias: number
  albumes: number
}

/**
 * Cuánto contenido de los archivos antiguos todavía no está en la base.
 * Solo cuenta los álbumes cuyas fotos existen en este equipo, porque son los
 * únicos que la importación puede traer.
 */
export async function pendientesDeImportar(): Promise<PendientesImportacion> {
  await requireAdmin()
  const supabase = createAdminClient()

  const idsEventos = [...eventosDiciembrePasados, ...eventosEnero2026].map((e) => e.id)
  const slugsNoticias = getAllNoticiaSlugs()
  const slugsAlbumes = getAllAlbums()
    .filter((a) => a.fotos.length > 0)
    .map((a) => a.slug)

  const [eventos, noticias, albumes] = await Promise.all([
    supabase.from('programacion').select('legacy_id').in('legacy_id', idsEventos),
    supabase.from('noticias').select('slug').in('slug', slugsNoticias),
    supabase.from('albumes').select('slug').in('slug', slugsAlbumes),
  ])

  return {
    actividades: idsEventos.length - (eventos.data?.length ?? 0),
    noticias: slugsNoticias.length - (noticias.data?.length ?? 0),
    albumes: slugsAlbumes.length - (albumes.data?.length ?? 0),
  }
}

/**
 * Copia a Supabase el contenido que antes vivía en archivos del repositorio:
 * eventos de lib/data, noticias de noticias/*.md y álbumes de public/galeria.
 * Es idempotente: lo que ya existe (mismo id antiguo o mismo slug) se omite.
 *
 * Las fotos de los álbumes solo se pueden leer donde estén los archivos
 * (normalmente en local con `npm run dev`), porque no están en el repositorio.
 */
export async function importarContenidoAnterior(): Promise<ResultadoImportacion> {
  await requireAdmin()
  const supabase = createAdminClient()
  const resultado: ResultadoImportacion = { actividades: 0, noticias: 0, albumes: 0, fotos: 0, avisos: [] }

  // 1. Programación
  const eventos = [...eventosDiciembrePasados, ...eventosEnero2026]
  const { data: actividades, error: errorActividades } = await supabase
    .from('programacion')
    .upsert(
      eventos.map((e) => ({
        legacy_id: e.id,
        tipo: e.tipo,
        fecha: e.fecha,
        hora_inicio: e.horaInicio ?? null,
        hora_fin: e.horaFin ?? null,
        rival: e.rival ?? null,
        tipo_partido: e.tipoPartido ?? null,
        actividad: e.actividad ?? null,
        titulo: e.titulo ?? null,
        descripcion: e.descripcion ?? null,
        estadio: e.estadio,
        confirmado: e.confirmado,
        llevar: e.llevar ?? null,
        precio_entrada: e.precioEntrada ?? null,
        edad_gratis: e.edadGratis ?? null,
        series: e.series ?? [],
        publicado: true,
      })),
      { onConflict: 'legacy_id', ignoreDuplicates: true }
    )
    .select('id')
  if (errorActividades) resultado.avisos.push(`Programación: ${errorActividades.message}`)
  resultado.actividades = actividades?.length ?? 0

  // 2. Noticias
  const noticias = getAllNoticiaSlugs()
    .map(getNoticiaBySlug)
    .filter((n) => n !== null)
  if (noticias.length > 0) {
    const { data, error } = await supabase
      .from('noticias')
      .upsert(
        noticias.map((n) => ({
          slug: n.slug, // se conserva: la URL ya está publicada
          titulo: n.title,
          bajada: n.description,
          contenido: n.content,
          categoria: n.categoria,
          tags: parseTags(n.tags),
          autor: n.author ?? null,
          fecha: fechaISO(n.date),
          publicado: true,
        })),
        { onConflict: 'slug', ignoreDuplicates: true }
      )
      .select('id')
    if (error) resultado.avisos.push(`Noticias: ${error.message}`)
    resultado.noticias = data?.length ?? 0
  }

  // 3. Galería
  for (const album of getAllAlbums()) {
    const { data: existente } = await supabase.from('albumes').select('id').eq('slug', album.slug).maybeSingle()
    if (existente) continue

    if (album.fotos.length === 0) {
      resultado.avisos.push(`Álbum "${album.title}": no se encontraron sus fotos en public/galeria; se omitió.`)
      continue
    }

    const { data: nuevo, error } = await supabase
      .from('albumes')
      .insert({
        slug: album.slug,
        titulo: album.title,
        descripcion: album.description,
        categoria: album.categoria,
        fecha: fechaISO(album.date),
        tags: album.tags ?? [],
        publicado: true,
      })
      .select('id')
      .single()
    if (error) {
      resultado.avisos.push(`Álbum "${album.title}": ${error.message}`)
      continue
    }
    resultado.albumes++

    let portada: string | null = null
    for (const [orden, archivo] of album.fotos.entries()) {
      const origen = path.join(process.cwd(), 'public', 'galeria', album.categoria, album.slug, archivo)
      const destino = `galeria/${nuevo.id}/${archivo}`
      const { error: errorSubida } = await supabase.storage
        .from(BUCKET_MEDIOS)
        .upload(destino, fs.readFileSync(origen), {
          contentType: MIME_POR_EXTENSION[path.extname(archivo).toLowerCase()] ?? 'image/jpeg',
          upsert: true,
        })
      if (errorSubida) {
        resultado.avisos.push(`${archivo}: ${errorSubida.message}`)
        continue
      }

      const url = supabase.storage.from(BUCKET_MEDIOS).getPublicUrl(destino).data.publicUrl
      await supabase.from('fotos').insert({
        album_id: nuevo.id,
        path: destino,
        url,
        orden,
        descripcion: album.photoDescriptions?.find((d) => d.filename === archivo)?.description ?? null,
      })
      resultado.fotos++
      if (archivo === album.cover || !portada) portada = url
    }
    await supabase.from('albumes').update({ portada_url: portada }).eq('id', nuevo.id)
  }

  revalidatePath('/admin', 'layout')
  revalidarSitio('programacion', 'noticias', 'galeria')
  return resultado
}
