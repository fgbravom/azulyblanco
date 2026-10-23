/**
 * Cliente de Supabase falso para pruebas unitarias.
 *
 * Cada .from(tabla) registra la cadena de métodos que se le aplica
 * (select, eq, order, insert...) y, al hacer await, responde lo que
 * devuelva `responder` para esa consulta. Así se prueba qué se le pide a la
 * base sin tener una.
 */

export interface Operacion {
  metodo: string
  args: unknown[]
}

export interface Consulta {
  tabla: string
  ops: Operacion[]
}

export interface Respuesta {
  data?: unknown
  error?: { message: string; code?: string } | null
  count?: number | null
}

export type Responder = (consulta: Consulta) => Respuesta | undefined

/** Argumentos de la primera llamada a `metodo` en la consulta, o undefined */
export function argsDe(consulta: Consulta, metodo: string): unknown[] | undefined {
  return consulta.ops.find((o) => o.metodo === metodo)?.args
}

/** ¿La consulta usó este método? */
export function uso(consulta: Consulta, metodo: string): boolean {
  return consulta.ops.some((o) => o.metodo === metodo)
}

/**
 * La sesión de la petición que simula simularSesion (tests/helpers/sesion.ts).
 * Toda consulta que valida la sesión (cuentas_panel) recibe esta fila, sin
 * importar qué responda la prueba para el resto de las consultas.
 */
export const sesionDePrueba: { activa: boolean; fila: Record<string, unknown> | null } = { activa: false, fila: null }

function esConsultaDeSesion(consulta: Consulta): boolean {
  return (
    consulta.tabla === 'cuentas_panel' &&
    consulta.ops.some((o) => o.metodo === 'select' && String(o.args[0]).includes('debe_cambiar_password'))
  )
}

export function crearSupabaseFalso(responder: Responder = () => ({ data: [] })) {
  const consultas: Consulta[] = []
  /** Consultas que validan la sesión: se guardan aparte para no contarlas como contenido */
  const sesiones: Consulta[] = []

  function from(tabla: string) {
    const consulta: Consulta = { tabla, ops: [] }
    consultas.push(consulta)

    const builder: object = new Proxy(
      {},
      {
        get(_destino, prop) {
          if (prop === 'then') {
            const porSesion = sesionDePrueba.activa && esConsultaDeSesion(consulta)
            if (porSesion) {
              const indice = consultas.indexOf(consulta)
              if (indice >= 0) consultas.splice(indice, 1)
              sesiones.push(consulta)
            }
            const respuesta = {
              data: null,
              error: null,
              count: null,
              ...(porSesion ? { data: sesionDePrueba.fila } : responder(consulta)),
            }
            return (ok: (r: unknown) => unknown, falla: (e: unknown) => unknown) =>
              Promise.resolve(respuesta).then(ok, falla)
          }
          return (...args: unknown[]) => {
            consulta.ops.push({ metodo: String(prop), args })
            return builder
          }
        },
      }
    )
    return builder
  }

  const storage = {
    from: () => ({
      remove: async () => ({ data: [], error: null }),
      createSignedUploadUrl: async (path: string) => ({ data: { path, token: 'token-falso' }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://falso.supabase.co/storage/v1/object/public/medios/${path}` } }),
    }),
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cliente: { from, storage } as any,
    consultas,
    sesiones,
    /** Consultas hechas a una tabla, en orden */
    a: (tabla: string) => consultas.filter((c) => c.tabla === tabla),
  }
}
