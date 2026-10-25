import Image from 'next/image'
import { claveEquipo, type TablaPublicada } from '@/lib/data/posiciones'

// Columnas en el mismo orden que la tabla oficial de ANFA
const COLUMNAS = [
  { clave: 'pos', etiqueta: 'Pos', alineacion: 'centro' },
  { clave: 'escudo', etiqueta: '', alineacion: 'centro' },
  { clave: 'equipo', etiqueta: 'Equipo', alineacion: 'izquierda' },
  { clave: 'pts', etiqueta: 'Pts', alineacion: 'centro' },
  { clave: 'pj', etiqueta: 'PJ', alineacion: 'centro' },
  { clave: 'g', etiqueta: 'G', alineacion: 'centro' },
  { clave: 'e', etiqueta: 'E', alineacion: 'centro' },
  { clave: 'p', etiqueta: 'P', alineacion: 'centro' },
  { clave: 'gf', etiqueta: 'GF', alineacion: 'centro' },
  { clave: 'gc', etiqueta: 'GC', alineacion: 'centro' },
  { clave: 'dg', etiqueta: 'DG', alineacion: 'centro' },
] as const

// La imagen oficial muestra el signo en la diferencia de gol ("+4", "-2")
function conSigno(valor: number): string {
  return valor > 0 ? `+${valor}` : String(valor)
}

const ESCUDO_AYB = '/images/escudoazulyblanco.png'
const TAMANO_ESCUDO = 28

// Equipo sin logo en el catálogo: círculo con la inicial, para no romper la alineación
function Escudo({ src, equipo }: { src?: string; equipo: string }) {
  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: TAMANO_ESCUDO, height: TAMANO_ESCUDO }}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${TAMANO_ESCUDO}px`} className="object-contain" />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500"
        >
          {equipo.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

interface TablaPosicionesProps {
  tabla: TablaPublicada
  /** Logo de cada club por nombre normalizado (claveEquipo); Azul y Blanco usa el del club */
  escudos?: Record<string, string>
}

export function TablaPosiciones({ tabla, escudos = {} }: TablaPosicionesProps) {
  const { campeonato, torneo, fechaNumero, organizador, leyenda, equivalencias, serie } = tabla

  return (
    <div>
      <h2 className="sr-only">Tabla de posiciones</h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        {campeonato} · {torneo} · Fecha N°{fechaNumero}
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="bg-azul-primario text-white">
              {COLUMNAS.map((columna) => (
                <th
                  key={columna.clave}
                  scope="col"
                  className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide ${
                    columna.alineacion === 'izquierda' ? 'text-left' : 'text-center'
                  }`}
                >
                  {columna.clave === 'escudo' ? (
                    <span className="sr-only">Escudo</span>
                  ) : (
                    <abbr title={leyenda[columna.clave]} className="no-underline">
                      {columna.etiqueta}
                    </abbr>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {serie.tabla.map((fila) => {
              const esAyb = fila.es_ayb === true
              return (
                <tr
                  key={fila.equipo}
                  className={`border-t border-gray-100 ${esAyb ? 'bg-azul-primario/5 font-semibold' : 'even:bg-gray-50/60'}`}
                >
                  <td className="px-3 py-2.5 text-center text-gray-500">{fila.pos}</td>
                  <td className="w-12 px-1 py-2">
                    <Escudo src={esAyb ? ESCUDO_AYB : escudos[claveEquipo(equivalencias[fila.equipo] ?? fila.equipo)]} equipo={fila.equipo} />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={esAyb ? 'text-azul-primario' : 'text-gray-800'}>{fila.equipo}</span>
                    {esAyb && <span className="sr-only"> (nuestro club)</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-azul-primario">{fila.pts}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{fila.pj}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{fila.g}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{fila.e}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{fila.p}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{fila.gf}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{fila.gc}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{conSigno(fila.dg)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        Fuente: {organizador}. Las cifras se publican tal como figuran en la tabla oficial.
      </p>
    </div>
  )
}
