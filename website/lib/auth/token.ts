/**
 * Token de sesión firmado: "<rol>.<redactorId|->.<version>.<expira_ms>.<hmac>".
 * El rol es "a" (admin) o "r" (redactor); el hmac firma todo lo anterior.
 * Usa Web Crypto para funcionar igual en el middleware (edge) y en Node.
 */

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

const encoder = new TextEncoder();

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Lo que lleva el token: el rol y, para un redactor, quién es y la versión de su sesión */
export type DatosToken = { rol: 'admin' } | { rol: 'redactor'; redactorId: string; version: number };
export type DatosSesion = DatosToken;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function firmarToken(secret: string, datos: DatosToken): Promise<string> {
  const expira = String(Date.now() + SESSION_MAX_AGE * 1000);
  const cuerpo =
    datos.rol === 'admin'
      ? `a.-.0.${expira}`
      : `r.${datos.redactorId}.${datos.version}.${expira}`;
  return `${cuerpo}.${await hmac(cuerpo, secret)}`;
}

export async function verificarToken(token: string | undefined, secret: string | undefined): Promise<DatosToken | null> {
  if (!token || !secret) return null;

  const partes = token.split('.');
  if (partes.length !== 5) return null;
  const [rol, id, version, expira, firma] = partes;
  if (!firma || !/^\d+$/.test(expira) || Number(expira) < Date.now()) return null;

  let datos: DatosToken;
  if (rol === 'a' && id === '-' && version === '0') {
    datos = { rol: 'admin' };
  } else if (rol === 'r' && UUID.test(id) && /^\d{1,9}$/.test(version)) {
    datos = { rol: 'redactor', redactorId: id, version: Number(version) };
  } else {
    return null;
  }

  const esperada = await hmac(`${rol}.${id}.${version}.${expira}`, secret);
  if (esperada.length !== firma.length) return null;

  let diff = 0;
  for (let i = 0; i < esperada.length; i++) {
    diff |= esperada.charCodeAt(i) ^ firma.charCodeAt(i);
  }
  return diff === 0 ? datos : null;
}
