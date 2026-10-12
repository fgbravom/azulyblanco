import { PAISES, type CodigoPais } from '@/lib/jugadores/paises';

// Estrella de cinco puntas de radio 1 centrada en el origen
const ESTRELLA =
  '0,-1 0.225,-0.309 0.951,-0.309 0.363,0.118 0.588,0.809 0,0.382 -0.588,0.809 -0.363,0.118 -0.951,-0.309 -0.225,-0.309';

// Arco de las ocho estrellas de Venezuela
const ESTRELLAS_VE = [
  [9.36, 12.45],
  [10.4, 10.64],
  [12, 9.3],
  [13.96, 8.59],
  [16.04, 8.59],
  [18, 9.3],
  [19.6, 10.64],
  [20.64, 12.45],
];

// Banderas en SVG: los emoji de banderas no se dibujan en Windows
const DIBUJOS: Record<CodigoPais, React.ReactNode> = {
  CL: (
    <>
      <rect width="30" height="20" fill="#D52B1E" />
      <rect width="30" height="10" fill="#FFFFFF" />
      <rect width="10" height="10" fill="#0039A6" />
      <polygon points={ESTRELLA} fill="#FFFFFF" transform="translate(5 5) scale(2.5)" />
    </>
  ),
  HT: (
    <>
      <rect width="30" height="20" fill="#D21034" />
      <rect width="30" height="10" fill="#00209F" />
    </>
  ),
  VE: (
    <>
      <rect width="30" height="20" fill="#CF142B" />
      <rect width="30" height="13.34" fill="#00247D" />
      <rect width="30" height="6.67" fill="#FFCC00" />
      {ESTRELLAS_VE.map(([x, y]) => (
        <polygon
          key={x}
          points={ESTRELLA}
          fill="#FFFFFF"
          transform={`translate(${x} ${y}) scale(0.6)`}
        />
      ))}
    </>
  ),
  PE: (
    <>
      <rect width="30" height="20" fill="#D91023" />
      <rect x="10" width="10" height="20" fill="#FFFFFF" />
    </>
  ),
};

export default function Bandera({
  codigo,
  className = 'h-4 w-6',
}: {
  codigo: CodigoPais;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 30 20"
      role="img"
      aria-label={`Bandera de ${PAISES[codigo]}`}
      className={`${className} shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]`}
    >
      <title>{PAISES[codigo]}</title>
      {DIBUJOS[codigo]}
    </svg>
  );
}
