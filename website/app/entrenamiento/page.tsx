import { AlertTriangle, ChevronDown, Clock, Dumbbell, Package, Play, StretchHorizontal, Timer, Utensils } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RUTINA_EN_CASA as rutina } from '@/lib/data/entrenamiento'
import { BotonEmpezar, ModoEntrenamiento } from '@/components/rutina/ModoEntrenamiento'
import { VideoEjercicio } from '@/components/rutina/VideoEjercicio'
import { CalculadoraAgua } from '@/components/rutina/CalculadoraAgua'

export const metadata = {
  title: 'Entrenamiento en casa',
  description:
    'Rutina de potencia, agilidad y velocidad para entrenar en casa: ejercicios pliométricos con video, estiramientos y temporizador, para los jugadores de Azul y Blanco.',
}

function minutos(segundos: number) {
  return segundos % 60 === 0 ? `${segundos / 60} min` : `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')} min`
}

function Titulo({ icono: Icono, children, id }: { icono: typeof Dumbbell; children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="flex items-center gap-3 text-2xl font-bold text-azul-primario md:text-3xl">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azul-claro/10">
        <Icono className="h-5 w-5 text-azul-claro" />
      </span>
      {children}
    </h2>
  )
}

export default function EntrenamientoPage() {

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
        {/* Portada */}
        <section className="relative overflow-hidden bg-azul-primario px-4 pt-14 pb-10 text-white md:pt-16 md:pb-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-azul-claro/20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-azul-brillante">Rutina en casa</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight md:text-5xl">{rutina.titulo}</h1>
            <p className="mt-4 text-lg text-gray-200">{rutina.objetivo}</p>

            <dl className="mt-8 grid grid-cols-3 gap-2 text-center">
              {[
                { valor: rutina.ejercicios.length, etiqueta: 'ejercicios' },
                { valor: rutina.estiramientos.length, etiqueta: 'estiramientos' },
                { valor: rutina.duracionMinutos, etiqueta: 'minutos' },
              ].map(({ valor, etiqueta }) => (
                <div key={etiqueta} className="rounded-2xl bg-white/10 px-2 py-3">
                  <dt className="sr-only">{etiqueta}</dt>
                  <dd>
                    <span className="block text-3xl font-bold">{valor}</span>
                    <span className="text-xs uppercase tracking-wide text-azul-cielo">{etiqueta}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <BotonEmpezar className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-lg font-bold text-azul-primario shadow-lg transition hover:bg-azul-pastel active:scale-[0.98] sm:w-auto sm:px-10">
              <Play className="h-5 w-5 fill-current" /> Empezar rutina
            </BotonEmpezar>
            <p className="mt-3 text-sm text-azul-cielo">Te guía serie por serie, con descansos y estiramientos cronometrados.</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-14 px-4 py-12">
          {/* Antes de empezar */}
          <section aria-labelledby="antes" className="space-y-4">
            <Titulo icono={Package} id="antes">Antes de empezar</Titulo>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Materiales</h3>
              <p className="mt-1 text-gray-600">{rutina.materiales}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
              <h3 className="flex items-center gap-2 font-semibold text-amber-900">
                <AlertTriangle className="h-4 w-4" /> Si tienes una lesión
              </h3>
              <ul className="mt-2 space-y-1 text-amber-900/80">
                {rutina.consideraciones.map((texto) => (
                  <li key={texto}>{texto}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Sugerencias</h3>
              <ul className="mt-2 space-y-2 text-gray-600">
                {[rutina.calentamiento, ...rutina.sugerencias].map((texto) => (
                  <li key={texto} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-azul-claro" />
                    {texto}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Ejercicios */}
          <section aria-labelledby="ejercicios" className="space-y-4">
            <Titulo icono={Dumbbell} id="ejercicios">Ejercicios</Titulo>
            <p className="text-gray-600">Fuerza y potencia del tren inferior. Toca cada uno para ver el video y cómo se hace.</p>
            <ol className="space-y-3">
              {rutina.ejercicios.map((ejercicio, i) => (
                <li key={ejercicio.id}>
                  <details className="group rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 open:ring-azul-claro/40">
                    <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-azul-primario text-lg font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-gray-900">{ejercicio.nombre}</span>
                        <span className="block text-sm text-gray-500">
                          {ejercicio.series} series de {ejercicio.objetivo}
                        </span>
                      </span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-4 px-4 pb-5">
                      <VideoEjercicio id={ejercicio.video} titulo={ejercicio.nombre} />
                      <p className="text-gray-700">{ejercicio.descripcion}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
                            <Timer className="h-3.5 w-3.5" /> Método
                          </p>
                          <p className="mt-1 font-semibold text-gray-900">
                            {ejercicio.series} series de {ejercicio.objetivo}
                          </p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
                            <Clock className="h-3.5 w-3.5" /> Descanso
                          </p>
                          <p className="mt-1 font-semibold text-gray-900">{minutos(ejercicio.descanso)} entre series</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Músculos</p>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {ejercicio.musculos.map((musculo) => (
                            <li key={musculo} className="rounded-full bg-azul-claro/10 px-3 py-1 text-xs font-medium text-azul-medio">
                              {musculo}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Variante: </span>
                        {ejercicio.variante}
                      </p>
                      {ejercicio.aviso && (
                        <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                          <AlertTriangle className="h-4 w-4 shrink-0" /> {ejercicio.aviso}
                        </p>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </section>

          {/* Estiramientos */}
          <section aria-labelledby="estiramientos" className="space-y-4">
            <Titulo icono={StretchHorizontal} id="estiramientos">Estiramientos</Titulo>
            <p className="text-gray-600">
              Al terminar la rutina, y también después de cada partido o entrenamiento. Cada uno: 3 veces, 10 segundos, con 5
              segundos de pausa.
            </p>
            <ol className="grid gap-3 sm:grid-cols-2">
              {rutina.estiramientos.map((estiramiento) => (
                <li key={estiramiento.id}>
                  <details className="group h-full rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 open:ring-azul-claro/40">
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-gray-900">{estiramiento.nombre}</span>
                        <span className="block text-sm text-gray-500">
                          {estiramiento.repeticiones} veces de {estiramiento.mantener} segundos{estiramiento.porLado ? ' por lado' : ''}
                        </span>
                      </span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-3 px-4 pb-4">
                      <VideoEjercicio id={estiramiento.video} titulo={`Estiramiento de ${estiramiento.nombre}`} />
                      <p className="text-sm text-gray-700">{estiramiento.descripcion}</p>
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </section>

          {/* Hidratación y comida */}
          <section aria-labelledby="alimentacion" className="space-y-4">
            <Titulo icono={Utensils} id="alimentacion">Hidratación y comida</Titulo>
            <CalculadoraAgua mlPorKilo={rutina.alimentacion.mlPorKilo} minimoLitros={rutina.alimentacion.minimoLitros} />
            <p className="rounded-2xl bg-white p-5 text-gray-700 shadow-sm ring-1 ring-gray-100">
              <span className="font-semibold text-gray-900">Antes de jugar: </span>
              {rutina.alimentacion.previo}
            </p>

            <h3 className="pt-4 text-lg font-bold text-gray-900">Qué comer antes de un partido o entrenamiento</h3>
            <ol className="relative space-y-4 border-l-2 border-azul-claro/30 pl-6">
              {rutina.alimentacion.antes.map((momento) => (
                <li key={momento.cuando} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-4 border-gray-50 bg-azul-claro" />
                  <p className="text-sm font-semibold uppercase tracking-wide text-azul-claro">{momento.cuando}</p>
                  <div className="mt-1 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                    <h4 className="font-bold text-gray-900">{momento.titulo}</h4>
                    <p className="mt-1 text-gray-600">{momento.texto}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {momento.ejemplos.map((ejemplo) => (
                        <li key={ejemplo} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                          {ejemplo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
            <p className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 font-semibold text-red-800 ring-1 ring-red-200">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>Evita: {rutina.alimentacion.evitar}</span>
            </p>
          </section>
        </div>

        {/* En el celular el botón queda siempre a mano */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          <BotonEmpezar className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-azul-primario font-bold text-white active:scale-[0.98]">
            <Play className="h-4 w-4 fill-current" /> Empezar rutina ({rutina.duracionMinutos} min)
          </BotonEmpezar>
        </div>
      </main>
      <Footer />
      {/* Espacio para que la barra fija no tape el final del footer */}
      <div className="h-20 bg-gray-900 md:hidden" />
      <ModoEntrenamiento rutina={rutina} />
    </>
  )
}
