/** "Gran Final: AYB vs Unión" → "gran-final-ayb-vs-union" */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** "a, b ,c" → ["a", "b", "c"] */
export function parseTags(texto: string): string[] {
  return texto
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}
