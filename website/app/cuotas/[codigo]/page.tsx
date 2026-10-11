import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getEstadoCuenta } from '@/lib/cuotas/estado-cuenta'
import { cuotasHabilitadas } from '@/lib/cuotas/habilitado'
import { MEDIOS, etiquetaCuota, formatoCLP, nombreMes, type Cuota } from '@/lib/cuotas/tipos'
import { estiloCuota } from '@/components/admin/cuotas/CeldaCuota'

// Datos en vivo y privados: nada de caché ni indexación
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mis cuotas',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

function fecha(valor: string) {
  return new Date(`${valor}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function MisCuotasPage({ params }: { params: Promise<{ codigo: string }> }) {
  if (!cuotasHabilitadas()) notFound()
  const { codigo } = await params
  const cuenta = await getEstadoCuenta(codigo)
  if (!cuenta) notFound()

  const porAnio = new Map<string, Cuota[]>()
  for (const c of cuenta.cuotas) {
    const anio = c.periodo.slice(0, 4)
    porAnio.set(anio, [...(porAnio.get(anio) ?? []), c])
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-azul-primario text-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
          <Link href="/" className="shrink-0">
            <Image src="/images/escudoazulyblanco.png" alt="Azul y Blanco" width={44} height={44} className="h-11 w-11 object-contain" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-azul-cielo">{cuenta.serie} · Mis cuotas</p>
            <h1 className="truncate font-heading text-xl font-bold sm:text-2xl">{cuenta.nombre}</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-5 px-4 pt-6">
        {/* Saldo */}
        <section
          className={cn(
            'rounded-2xl p-6 text-center shadow-sm',
            cuenta.deuda > 0 ? 'border border-red-200 bg-white' : 'border border-green-200 bg-green-50'
          )}
        >
          {cuenta.deuda > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-600">Saldo pendiente</p>
              <p className="mt-1 font-heading text-4xl font-bold text-red-600">{formatoCLP(cuenta.deuda)}</p>
            </>
          ) : (
            <>
              <p className="font-heading text-2xl font-bold text-green-700">¡Estás al día!</p>
              <p className="mt-1 text-sm text-green-800">Gracias por apoyar al club.</p>
            </>
          )}
        </section>

        {/* Cómo pagar */}
        {cuenta.deuda > 0 && cuenta.datos_pago && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading font-semibold text-azul-primario">Cómo pagar</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{cuenta.datos_pago}</p>
            <p className="mt-3 text-xs text-gray-500">El pago se refleja aquí cuando el tesorero lo registra.</p>
          </section>
        )}

        {/* Detalle por mes */}
        {Array.from(porAnio.entries()).map(([anio, cuotas]) => (
          <section key={anio} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <h2 className="border-b border-gray-100 px-5 py-3 font-heading font-semibold text-azul-primario">Cuotas {anio}</h2>
            <ul className="divide-y divide-gray-100">
              {cuotas.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="font-medium text-gray-800">{nombreMes(c.periodo)}</span>
                  <span className="flex items-center gap-3">
                    {c.saldo > 0 && c.estado === 'parcial' && (
                      <span className="text-xs text-gray-500">debe {formatoCLP(c.saldo)}</span>
                    )}
                    <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', estiloCuota(c))}>
                      {c.estado === 'pendiente' ? `Debe ${formatoCLP(c.saldo)}` : c.estado === 'exenta' ? etiquetaCuota(c) : formatoCLP(c.pagado)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {cuenta.cuotas.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            Todavía no tienes cuotas registradas.
          </p>
        )}

        {/* Pagos */}
        {cuenta.pagos.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <h2 className="border-b border-gray-100 px-5 py-3 font-heading font-semibold text-azul-primario">Pagos registrados</h2>
            <ul className="divide-y divide-gray-100">
              {cuenta.pagos.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span>
                    <span className="font-medium text-gray-800">{formatoCLP(p.monto)}</span>
                    <span className="ml-2 text-gray-500">
                      {p.periodo && `cuota de ${nombreMes(p.periodo).toLowerCase()}`}
                    </span>
                  </span>
                  <span className="text-right text-xs text-gray-500">
                    {fecha(p.fecha)}
                    {p.medio !== 'otro' && ` · ${MEDIOS[p.medio]}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="pt-2 text-center text-xs text-gray-400">
          Este link es personal. ¿Ves un error? Escríbele al tesorero de tu serie.
        </p>
      </div>
    </main>
  )
}
