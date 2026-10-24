import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { claveEquipo, type TablaPublicada } from '@/lib/data/posiciones'

const ESCUDO_AYB = '/images/escudoazulyblanco.png'
const TAMANO_ESCUDO = 24

function Escudo({ src, equipo }: { src?: string; equipo: string }) {
  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: TAMANO_ESCUDO, height: TAMANO_ESCUDO }}>
      {src ? (
        <Image src={src} alt="" fill sizes={`${TAMANO_ESCUDO}px`} className="object-contain" />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white/80"
        >
          {equipo.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

function TablaCompacta({ tabla, escudos }: { tabla: TablaPublicada; escudos: Record<string, string> }) {
  return (
    <div className="overflow-hidden rounded-lg bg-black/20 text-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs font-semibold uppercase text-white/60">
            <th scope="col" colSpan={3} className="px-3 py-3 text-left">Equipo</th>
            <th scope="col" className="px-2 py-3 text-center">Pts</th>
            <th scope="col" className="px-2 py-3 text-center">J</th>
            <th scope="col" className="px-2 py-3 text-center">V</th>
            <th scope="col" className="px-2 py-3 text-center">E</th>
            <th scope="col" className="px-2 py-3 text-center">D</th>
          </tr>
        </thead>
        <tbody>
          {tabla.serie.tabla.map((fila) => {
            const esAyb = fila.es_ayb === true
            const src = esAyb ? ESCUDO_AYB : escudos[claveEquipo(tabla.equivalencias[fila.equipo] ?? fila.equipo)]
            return (
              <tr key={fila.equipo} className={`border-t border-white/10 ${esAyb ? 'bg-white/10 font-semibold' : ''}`}>
                <td className="w-8 px-3 py-2.5 text-center text-white/80">{fila.pos}</td>
                <td className="w-9 py-2">
                  <Escudo src={src} equipo={fila.equipo} />
                </td>
                <td className="px-2 py-2.5 uppercase">
                  {fila.equipo}
                  {esAyb && <span className="sr-only"> (nuestro club)</span>}
                </td>
                <td className="px-2 py-2.5 text-center font-bold">{fila.pts}</td>
                <td className="px-2 py-2.5 text-center text-white/90">{fila.pj}</td>
                <td className="px-2 py-2.5 text-center text-white/90">{fila.g}</td>
                <td className="px-2 py-2.5 text-center text-white/90">{fila.e}</td>
                <td className="px-2 py-2.5 text-center text-white/90">{fila.p}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="border-t border-white/10 px-3 py-2 text-xs text-white/60">
        Fecha N°{tabla.fechaNumero} · {tabla.torneo} · Fuente: {tabla.organizador}
      </p>
    </div>
  )
}

interface PosicionesHomeProps {
  tablas: TablaPublicada[]
  escudos: Record<string, string>
}

export function PosicionesHome({ tablas, escudos }: PosicionesHomeProps) {
  return (
    <Tabs defaultValue={tablas[0].serie.slug}>
      <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-white/20 bg-transparent p-0 text-white/60">
        {tablas.map(({ serie }) => (
          <TabsTrigger
            key={serie.slug}
            value={serie.slug}
            className="-mb-px rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-0 text-base text-white/60 shadow-none data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            {serie.nombre}
          </TabsTrigger>
        ))}
      </TabsList>
      {tablas.map((tabla) => (
        <TabsContent key={tabla.serie.slug} value={tabla.serie.slug} className="mt-4">
          <TablaCompacta tabla={tabla} escudos={escudos} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
