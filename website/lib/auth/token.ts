/**
 * Token de sesión firmado: "<expira_ms>.<hmac>".
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

export async function firmarToken(secret: string): Promise<string> {
  const expira = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expira}.${await hmac(expira, secret)}`;
}

export async function verificarToken(token: string | undefined, secret: string | undefined): Promise<boolean> {
  if (!token || !secret) return false;

  const [expira, firma] = token.split('.');
  if (!expira || !firma || Number(expira) < Date.now()) return false;

  const esperada = await hmac(expira, secret);
  if (esperada.length !== firma.length) return false;

  let diff = 0;
  for (let i = 0; i < esperada.length; i++) {
    diff |= esperada.charCodeAt(i) ^ firma.charCodeAt(i);
  }
  return diff === 0;
}
