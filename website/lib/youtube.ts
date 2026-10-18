// IDs de YouTube: 11 caracteres de letras, dígitos, guion y guion bajo
const ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Devuelve el id del video si la URL es de YouTube (watch, youtu.be, shorts,
 * embed, live o m.youtube.com); si no, null.
 */
export function idVideoYoutube(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;

  const host = u.hostname.replace(/^(www\.|m\.)/, '');
  let id: string | null = null;
  if (host === 'youtu.be') {
    id = u.pathname.split('/')[1] ?? null;
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, tipo, valor] = u.pathname.split('/');
    if (tipo === 'watch') id = u.searchParams.get('v');
    else if (['shorts', 'embed', 'live'].includes(tipo)) id = valor ?? null;
  }
  return id && ID.test(id) ? id : null;
}

/** Segundo de inicio indicado con ?t= o ?start= (acepta "90", "90s" o "1m30s") */
export function inicioVideoYoutube(url: string): number | null {
  let valor: string | null;
  try {
    const u = new URL(url.trim());
    valor = u.searchParams.get('t') ?? u.searchParams.get('start');
  } catch {
    return null;
  }
  if (!valor) return null;
  const partes = valor.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (!partes) return null;
  const [, h = '0', m = '0', s = '0'] = partes;
  const total = Number(h) * 3600 + Number(m) * 60 + Number(s);
  return total > 0 ? total : null;
}
