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

  it('trae el recorte de la foto para mostrarla igual que en el sitio', async () => {
    const falso = conBase(() => ({ data: [] }))
    await publico.getPlantelPublico(3)
    expect(columnas(argsDe(falso.consultas[0], 'select')?.[0])).toEqual(
      expect.arrayContaining(['foto_foco_x', 'foto_foco_y', 'foto_foco_ancho'])
    )
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

  it('agrega los goleadores de vista_goles_publico con nombre y primer apellido', async () => {
    const falso = conBase((c) =>
      c.tabla === 'vista_goles_publico'
        ? {
            data: [
              { programacion_id: 'a1', lado: 'local', en_contra: false, autor_nombre: 'Juan Andrés', autor_apellidos: 'Pérez Soto', asistencia_nombre: 'Pedro', asistencia_apellidos: 'Rojas' },
              { programacion_id: 'a1', lado: 'local', en_contra: true, autor_nombre: null, autor_apellidos: null, asistencia_nombre: null, asistencia_apellidos: null },
              // El jugador se borró: el gol queda sin nombre y no se muestra
              { programacion_id: 'a1', lado: 'local', en_contra: false, autor_nombre: null, autor_apellidos: null, asistencia_nombre: null, asistencia_apellidos: null },
            ],
          }
        : c.tabla === 'programacion'
          ? { data: [{ id: 'a1', tipo: 'partido', fecha: '2026-03-07', rival: 'AYB VS UNIÓN', series: [], goles_local: 3, goles_visitante: 0 }] }
          : { data: [] }
    )
    const [evento] = await publico.getEventosCalendario()

    expect(evento.goles).toEqual([
      { lado: 'local', autor: 'Juan Pérez', asistencia: 'Pedro Rojas', enContra: false },
      { lado: 'local', autor: undefined, asistencia: undefined, enContra: true },
    ])
    for (const col of columnas(argsDe(falso.a('vista_goles_publico')[0], 'select')?.[0])) {
      expect(SENSIBLES).not.toContain(col)
    }
  })

  it('si la vista de goles falla, el partido se muestra sin goleadores', async () => {
    conBase((c) =>
      c.tabla === 'vista_goles_publico'
        ? { error: { message: 'relation does not exist' } }
        : { data: c.tabla === 'programacion' ? [{ id: 'a1', tipo: 'partido', fecha: '2026-03-07', series: [], goles_local: 1, goles_visitante: 0 }] : [] }
    )
    const [evento] = await publico.getEventosCalendario()
    expect(evento.resultado).toEqual({ local: 1, visitante: 0 })
    expect(evento.goles).toBeUndefined()
  })
})

describe('noticias', () => {
  const FILA = {
    id: 'n1', slug: 'gran-final', titulo: 'Gran final', bajada: 'Resumen', contenido: '# Hola',
    categoria: 'Deportes', tags: ['final', 'honor'], autor: null, fecha: '2026-03-01',
    portada_url: 'https://x/portada.webp', portada_foco_x: 30, portada_foco_y: 70, publicado: true,
  }

  it('el listado no trae el contenido completo y adapta los campos', async () => {
    const falso = conBase(() => ({ data: [FILA] }))
    const [noticia] = await publico.getNoticiasPublicas()
    expect(columnas(argsDe(falso.consultas[0], 'select')?.[0])).not.toContain('contenido')
    expect(noticia).toEqual({
      slug: 'gran-final', title: 'Gran final', description: 'Resumen', tags: 'final, honor',
      date: '2026-03-01', categoria: 'Deportes', author: undefined, coverUrl: 'https://x/portada.webp',
      coverPos: '30% 70%',
    })
  })

  it('una portada sin encuadre (fila anterior a la migración 017) se recorta al centro', async () => {
    conBase(() => ({ data: [{ ...FILA, portada_foco_x: undefined, portada_foco_y: undefined }] }))
    const [noticia] = await publico.getNoticiasPublicas()
    expect(noticia.coverPos).toBeUndefined()
  })

  it('la noticia trae el avatar de su redactor', async () => {
    const falso = conBase((c) =>
      c.tabla === 'redactores'
        ? { data: { avatar_url: 'https://x/felipe.webp' } }
        : { data: { ...FILA, autor: 'Felipe Bravo', redactor_id: 'r1' } }
    )
    const noticia = await publico.getNoticiaPublica('gran-final')
    expect(argsDe(falso.a('redactores')[0], 'eq')).toEqual(['id', 'r1'])
    expect(noticia).toMatchObject({ author: 'Felipe Bravo', authorAvatar: 'https://x/felipe.webp', content: '# Hola' })
  })

  it('sin la tabla de redactores la noticia se muestra igual, sin avatar', async () => {
    conBase((c) =>
      c.tabla === 'redactores'
        ? { error: { message: 'relation "redactores" does not exist' } }
        : { data: { ...FILA, autor: 'Felipe Bravo', redactor_id: 'r1' } }
    )
    const noticia = await publico.getNoticiaPublica('gran-final')
    expect(noticia).toMatchObject({ author: 'Felipe Bravo', authorAvatar: undefined })
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
