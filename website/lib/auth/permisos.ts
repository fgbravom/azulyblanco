/**
 * Qué puede usar cada cuenta del panel. Sin dependencias: lo leen el middleware
 * (edge), las server actions y el menú.
 */

/** Secciones que puede usar un colaborador. El administrador usa todo. */
export const SECCIONES_COLABORADOR = [
  'noticias',
  'portada',
  'programacion',
  'galeria',
  'medios',
  'plantel',
] as const;

export type Seccion = (typeof SECCIONES_COLABORADOR)[number];

/** Páginas del panel de cada sección */
export const RUTAS_SECCION: Record<Seccion, readonly string[]> = {
  noticias: ['/admin/noticias'],
  portada: ['/admin/hero'],
  programacion: ['/admin/programacion'],
  galeria: ['/admin/galeria'],
  medios: ['/admin/medios'],
  plantel: ['/admin/jugadores', '/admin/series'],
};

/** APIs que usa la sección de plantel (el formulario de jugadores) */
export const APIS_PLANTEL_COLABORADOR = ['/api/jugadores', '/api/equipos'] as const;

/** Páginas que puede abrir un colaborador: sus secciones y su cuenta */
export const RUTAS_COLABORADOR = [
  ...Object.values(RUTAS_SECCION).flat(),
  '/admin/cuenta',
] as const;

/** Si la ruta es la ruta o está dentro de alguna de `rutas` */
export function coincideRuta(pathname: string, rutas: readonly string[]): boolean {
  return rutas.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}
