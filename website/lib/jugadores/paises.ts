export type CodigoPais = 'AR' | 'CL' | 'CO' | 'HT' | 'PE' | 'VE';

export const PAISES: Record<CodigoPais, string> = {
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  HT: 'Haití',
  PE: 'Perú',
  VE: 'Venezuela',
};

// Opciones del listado desplegable de nacionalidad, en orden alfabético.
// Deben coincidir con los valores de PAISES.
export const NACIONALIDADES = ['Argentina', 'Chile', 'Colombia', 'Haití', 'Perú', 'Venezuela'] as const;
export type Nacionalidad = (typeof NACIONALIDADES)[number];

// Lo guardado antes del listado desplegable puede ser el país o el gentilicio
// ("Chile", "chilena", "Haiti", "haitiano", "venezolana", "Perú"...).
const PREFIJOS: [string, CodigoPais][] = [
  ['argen', 'AR'],
  ['chil', 'CL'],
  ['colomb', 'CO'],
  ['hait', 'HT'],
  ['peru', 'PE'],
  ['venez', 'VE'],
];

export function codigoPais(nacionalidad: string | null | undefined): CodigoPais | null {
  if (!nacionalidad) return null;
  const texto = nacionalidad
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
  return PREFIJOS.find(([prefijo]) => texto.startsWith(prefijo))?.[1] ?? null;
}

/** Nombre canónico del país ("Chile") a partir de cualquier forma guardada ("chilena"), o null si no se reconoce */
export function nombrePais(nacionalidad: string | null | undefined): Nacionalidad | null {
  const codigo = codigoPais(nacionalidad);
  return codigo ? (PAISES[codigo] as Nacionalidad) : null;
}
