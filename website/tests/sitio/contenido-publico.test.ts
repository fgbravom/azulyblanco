import { beforeEach, describe, expect, it, vi } from 'vitest'
import { argsDe, crearSupabaseFalso, type Responder } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/public', () => ({ createPublicClient: vi.fn() }))

const { createPublicClient } = await import('@/lib/supabase/public')
const publico = await import('@/lib/contenido/publico')
const { eventosDiciembrePasados, eventosEnero2026 } = await import('@/lib/data/eventos-enero')
const { HERO_FOTOS_REPO } = await import('@/components/hero/hero-boot')

const SENSIBLES = [
  'dni', 'email', 'telefono', 'direccion', 'fecha_nacimiento', 'tipo_sangre', 'contacto_emergencia',
  'telefono_emergencia', 'alergias', 'lesiones_cronicas', 'codigo_cuotas', 'cuota_condicion', '*',
]

function conBase(responder: Responder) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createPublicClient).mockReturnValue(falso.cliente)
  return falso
}

function columnas(select: unknown) {
  return String(select).split(',').map((c) => c.trim())
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('plantel público', () => {
  it('lee la vista pública, nunca la tabla jugadores, y solo columnas que se muestran', async () => {
    const falso = conBase(() => ({ data: [] }))
    await publico.getPlantelPublico(3)

    expect(falso.consultas.map((c) => c.tabla)).toEqual(['vista_plantel_publico'])
    const [consulta] = falso.consultas
    for (const col of columnas(argsDe(consulta, 'select')?.[0])) {
      expect(SENSIBLES).not.toContain(col)
    }
  })

  it('filtra por serie y solo jugadores activos', async () => {
    const falso = conBase(() => ({ data: [] }))
    await publico.getPlantelPublico(3)
    expect(falso.consultas[0].ops).toEqual(
      expect.arrayContaining([
        { metodo: 'eq', args: ['equipo_id', 3] },
        { metodo: 'eq', args: ['activo', true] },
      ])
    )
  })

  it('si la base falla muestra el plantel vacío en vez de romper la página', async () => {
    conBase(() => ({ error: { message: 'timeout' } }))
    expect(await publico.getPlantelPublico(3)).toEqual([])
  })

  it('sin Supabase configurado devuelve un plantel vacío', async () => {
    vi.mocked(createPublicClient).mockReturnValue(null)
    expect(await publico.getPlantelPublico(3)).toEqual([])
  })
})

describe('respaldo a los archivos del repositorio', () => {
  it('sin base, el calendario usa los eventos de lib/data', async () => {
    vi.mocked(createPublicClient).mockReturnValue(null)
    const eventos = await publico.getEventosCalendario()
    expect(eventos).toEqual([...eventosDiciembrePasados, ...eventosEnero2026])
    // Sin base no es un error: no se ensucia el log
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('si la base responde con error, también usa los archivos y lo avisa', async () => {
    conBase(() => ({ error: { message: 'relation "programacion" does not exist' } }))
    const eventos = await publico.getEventosCalendario()
    expect(eventos.length).toBeGreaterThan(0)
    expect(console.warn).toHaveBeenCalled()
  })

  it('sin base, el hero usa las fotos del repositorio', async () => {
    vi.mocked(createPublicClient).mockReturnValue(null)
    expect(await publico.getFotosHero()).toEqual(HERO_FOTOS_REPO)
  })
})

describe('programación desde la base', () => {
  it('convierte las filas al formato del calendario', async () => {
    conBase(() => ({
      data: [
        {
          id: 'a1', tipo: 'partido', fecha: '2026-03-07', hora_inicio: '15:30:00', hora_fin: null,
          rival: 'AYB VS UNIÓN', tipo_partido: 'Oficial', actividad: null, titulo: null, descripcion: null,
          estadio: 'Estadio Municipal', confirmado: true, llevar: null, precio_entrada: null, edad_gratis: null,
          series: ['Honor'], publicado: true,
        },
      ],
    }))
    const [evento] = await publico.getEventosCalendario()
    expect(evento).toMatchObject({ id: 'a1', dia: 'SÁBADO', diaMes: 7, mes: 'MARZO', horaInicio: '15:30', rival: 'AYB VS UNIÓN' })
  })
})

describe('noticias', () => {
  const FILA = {
    id: 'n1', slug: 'gran-final', titulo: 'Gran final', bajada: 'Resumen', contenido: '# Hola',
    categoria: 'Deportes', tags: ['final', 'honor'], autor: null, fecha: '2026-03-01',
    portada_url: 'https://x/portada.webp', publicado: true,
  }

  it('el listado no trae el contenido completo y adapta los campos', async () => {
    const falso = conBase(() => ({ data: [FILA] }))
    const [noticia] = await publico.getNoticiasPublicas()
    expect(columnas(argsDe(falso.consultas[0], 'select')?.[0])).not.toContain('contenido')
    expect(noticia).toEqual({
      slug: 'gran-final', title: 'Gran final', description: 'Resumen', tags: 'final, honor',
      date: '2026-03-01', categoria: 'Deportes', author: undefined, coverUrl: 'https://x/portada.webp',
    })
  })

  it('una noticia inexistente devuelve null', async () => {
    conBase(() => ({ data: null }))
    expect(await publico.getNoticiaPublica('no-existe')).toBeNull()
  })

  it('las categorías van ordenadas, sin repetir y con "Todas" primero', () => {
    const noticias = [{ categoria: 'Social' }, { categoria: 'Deportes' }, { categoria: 'Social' }] as never[]
    expect(publico.getCategoriasNoticias(noticias)).toEqual(['Todas', 'Deportes', 'Social'])
  })
})

describe('galería', () => {
  it('ordena las fotos y usa la primera como portada si el álbum no tiene', async () => {
    conBase(() => ({
      data: {
        slug: 'final', titulo: 'Final', descripcion: '', fecha: '2026-03-01', categoria: 'partidos', tags: [],
        portada_url: null,
        fotos: [
          { url: 'https://x/b.webp', orden: 2, descripcion: null },
          { url: 'https://x/a.webp', orden: 1, descripcion: 'Gol' },
        ],
      },
    }))
    const album = await publico.getAlbumPublico('partidos', 'final')
    expect(album?.fotoUrls).toEqual(['https://x/a.webp', 'https://x/b.webp'])
    expect(album?.coverUrl).toBe('https://x/a.webp')
    expect(album?.photoDescriptions).toEqual([{ filename: 'a.webp', description: 'Gol' }])
  })
})
