// Pitidos y vibración del modo entrenamiento. Los navegadores móviles solo
// dejan sonar audio creado tras un toque del usuario: desbloquearAudio() se
// llama desde el botón que empieza la rutina.

let contexto: AudioContext | null = null
let silenciado = false

export function silenciarAudio(valor: boolean) {
  silenciado = valor
}

export function desbloquearAudio() {
  if (typeof window === 'undefined') return
  try {
    contexto ??= new AudioContext()
    if (contexto.state === 'suspended') void contexto.resume()
  } catch {
    contexto = null
  }
}

/** Tono corto; `largo` marca el inicio de una serie o de un estiramiento */
export function pitido(largo = false) {
  if (silenciado || !contexto || contexto.state !== 'running') return
  const inicio = contexto.currentTime
  const duracion = largo ? 0.45 : 0.15
  const oscilador = contexto.createOscillator()
  const volumen = contexto.createGain()
  oscilador.type = 'sine'
  oscilador.frequency.value = largo ? 1046 : 784
  volumen.gain.setValueAtTime(0.0001, inicio)
  volumen.gain.exponentialRampToValueAtTime(0.35, inicio + 0.02)
  volumen.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion)
  oscilador.connect(volumen).connect(contexto.destination)
  oscilador.start(inicio)
  oscilador.stop(inicio + duracion + 0.05)
}

/** Vibra donde el navegador lo permite (Android); en iPhone no hace nada */
export function vibrar(patron: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(patron)
    } catch {
      // Algunos navegadores lo bloquean sin un toque reciente
    }
  }
}
