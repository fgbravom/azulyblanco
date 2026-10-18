import type { JugadorCompleto } from '@/types/database';

// Punto y coma: es el separador que espera Excel con configuración regional en español.
const SEPARADOR = ';';

const COLUMNAS: [string, (j: JugadorCompleto) => string | number | null | undefined][] = [
  ['Nombre', (j) => j.nombre],
  ['Apellidos', (j) => j.apellidos],
  ['Serie', (j) => j.categoria],
  ['Estado', (j) => j.estado],
  ['Dorsal', (j) => j.dorsal],
  ['Posiciones', (j) => j.posiciones?.join(', ')],
  ['Pie hábil', (j) => j.pie_preferido],
  ['Fecha de nacimiento', (j) => j.fecha_nacimiento],
  ['Edad', (j) => j.edad],
  ['Nacionalidad', (j) => j.nacionalidad],
  ['DNI/NIE', (j) => j.dni],
  ['Email', (j) => j.email],
  ['Teléfono', (j) => j.telefono],
  ['Dirección', (j) => j.direccion],
  ['Altura (cm)', (j) => j.altura_cm],
  ['Peso (kg)', (j) => j.peso_kg],
  ['Tipo de sangre', (j) => j.tipo_sangre],
  ['Contacto de emergencia', (j) => j.contacto_emergencia],
  ['Teléfono de emergencia', (j) => j.telefono_emergencia],
  ['Alergias', (j) => j.alergias],
  ['Lesiones crónicas', (j) => j.lesiones_cronicas],
  ['Condición de cuota', (j) => j.cuota_condicion],
  ['Fecha de alta', (j) => j.fecha_alta],
];

function celda(valor: string | number | null | undefined): string {
  const texto = valor == null ? '' : String(valor);
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** CSV del plantel con BOM, para que Excel lea bien tildes y eñes. */
export function jugadoresACsv(jugadores: JugadorCompleto[]): string {
  const filas = [
    COLUMNAS.map(([titulo]) => titulo),
    ...jugadores.map((j) => COLUMNAS.map(([, valor]) => celda(valor(j)))),
  ];
  return '﻿' + filas.map((f) => f.join(SEPARADOR)).join('\r\n');
}
