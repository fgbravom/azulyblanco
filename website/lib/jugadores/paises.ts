export type CodigoPais = 'CL' | 'HT' | 'VE' | 'PE';

export const PAISES: Record<CodigoPais, string> = {
  CL: 'Chile',
  HT: 'Haití',
  VE: 'Venezuela',
  PE: 'Perú',
};

// La nacionalidad es texto libre: se acepta el país o el gentilicio
// ("Chile", "chilena", "Haiti", "haitiano", "venezolana", "Perú"...).
const PREFIJOS: [string, CodigoPais][] = [
  ['chil', 'CL'],
  ['hait', 'HT'],
  ['venez', 'VE'],
  ['peru', 'PE'],
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
