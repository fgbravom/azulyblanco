import manifest from './hero-manifest.json'

/* ============================================
 * Arranque del hero
 *
 * Elige la foto de portada (rota en cada visita),
 * la descarga y abre la cortina solo cuando está
 * lista para pintarse. El estado se expone como
 * html[data-hero="open"] y lo anima globals.css.
 * ============================================ */

interface HeroImageSet {
  names: string[]
  widths: number[]
  storageKey: string
}

export interface HeroBootConfig {
  photoId: string
  crestId: string
  /** Logo del header donde aterriza el escudo de la intro */
  crestTargetSelector: string
  basePath: string
  mobileQuery: string
  /** Tiempo mínimo con la cortina cerrada, para que el efecto se lea aunque la foto esté en caché */
  minCurtainMs: number
  /** Tope de espera: pasado este tiempo la cortina abre aunque la foto no haya llegado */
  maxWaitMs: number
  desktop: HeroImageSet
  mobile: HeroImageSet
}

export const HERO_BOOT_CONFIG: HeroBootConfig = {
  photoId: 'hero-photo',
  crestId: 'hero-crest',
  crestTargetSelector: '[data-hero-crest-target]',
  basePath: '/images/hero/',
  mobileQuery: '(max-width: 767px)',
  minCurtainMs: 700,
  maxWaitMs: 5000,
  desktop: { ...manifest.desktop, storageKey: 'hero_index_desktop' },
  mobile: { ...manifest.mobile, storageKey: 'hero_index_mobile' },
}

/**
 * Se ejecuta de dos formas: serializada con toString() en un <script> inline
 * (carga inicial, antes de que React hidrate) y llamada directamente desde
 * HeroBoot (navegación interna). Por eso debe ser autocontenida: sin imports
 * ni referencias a nada fuera de su propio cuerpo.
 */
export function bootHero(cfg: HeroBootConfig) {
  const root = document.documentElement
  const found = document.getElementById(cfg.photoId)
  if (!found || found.getAttribute('data-booted')) return

  const photo = found as HTMLImageElement
  photo.setAttribute('data-booted', '1')

  // Cierra la cortina (al volver al home por navegación interna sigue en "open")
  // y apaga la red de seguridad de globals.css: desde aquí abre este script
  root.setAttribute('data-hero', 'wait')

  let start = Date.now()
  let opened = false

  // La intro espera a que haya alguien mirando. En una pestaña oculta decode()
  // no resuelve: la cortina abriría sin público y, al volver, la foto entraría
  // tarde con un fundido sobre el fondo azul.
  function whenVisible(fn: () => void) {
    if (!document.hidden) return fn()

    function onChange() {
      if (document.hidden) return
      document.removeEventListener('visibilitychange', onChange)
      fn()
    }
    document.addEventListener('visibilitychange', onChange)
  }

  // El escudo de la intro viaja desde el centro hasta calzar con el logo del header
  function flyCrest() {
    const crest = document.getElementById(cfg.crestId)
    const target = document.querySelector(cfg.crestTargetSelector)
    if (!crest || !target) return

    const from = crest.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    if (!from.width || !to.width) return

    const dx = to.left + to.width / 2 - (from.left + from.width / 2)
    const dy = to.top + to.height / 2 - (from.top + from.height / 2)
    crest.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + to.width / from.width + ')'
  }

  function open() {
    // Ignora temporizadores de un hero anterior que ya no está en la página
    if (opened || document.getElementById(cfg.photoId) !== photo) return

    if (document.hidden) {
      // Al volver deja ver el escudo un instante antes de abrir
      whenVisible(function () {
        setTimeout(open, cfg.minCurtainMs)
      })
      return
    }

    opened = true
    try {
      flyCrest()
    } catch {
      // Sin vuelo: el escudo se desvanece en su sitio
    }
    root.setAttribute('data-hero', 'open')
  }

  function onReady() {
    photo.setAttribute('data-loaded', '1')
    const remaining = cfg.minCurtainMs - (Date.now() - start)
    if (remaining > 0) setTimeout(open, remaining)
    else open()
  }

  // Sin foto a tiempo (o con error): abre igual y la foto entra con un fundido
  function giveUp() {
    if (opened) return
    photo.setAttribute('data-late', '1')
    open()
  }

  // El tope de espera solo corre con la pestaña visible
  function onTimeout() {
    if (opened) return
    if (document.hidden) whenVisible(armTimeout)
    else giveUp()
  }

  function armTimeout() {
    setTimeout(onTimeout, cfg.maxWaitMs)
  }

  whenVisible(function () {
    start = Date.now()
    armTimeout()
  })

  try {
    const set = window.matchMedia(cfg.mobileQuery).matches ? cfg.mobile : cfg.desktop

    let index = 0
    try {
      const last = parseInt(localStorage.getItem(set.storageKey) || '', 10)
      index = isNaN(last) ? 0 : (last + 1) % set.names.length
      localStorage.setItem(set.storageKey, String(index))
    } catch {
      // localStorage bloqueado: se queda con la primera foto
    }

    const base = cfg.basePath + set.names[index] + '-'

    const sources = photo.parentNode ? photo.parentNode.querySelectorAll('source') : []
    for (let i = 0; i < sources.length; i++) {
      const ext = (sources[i].getAttribute('type') || '').split('/')[1]
      const srcset = set.widths.map(function (width) {
        return base + width + '.' + ext + ' ' + width + 'w'
      })
      sources[i].setAttribute('srcset', srcset.join(', '))
    }

    photo.onload = function () {
      // decode() evita que la cortina abra sobre una foto aún sin decodificar
      if (typeof photo.decode === 'function') photo.decode().then(onReady, onReady)
      else onReady()
    }
    photo.onerror = giveUp
    photo.src = base + set.widths[Math.floor(set.widths.length / 2)] + '.webp'
  } catch {
    // Pase lo que pase al elegir la foto, la página no se queda tapada
    giveUp()
  }
}
