import { z } from 'zod';
import { NACIONALIDADES } from '@/lib/jugadores/paises';

/** Punto fijo de un recorte, de 0 a 100 por eje; null o ausente = sin ajustar */
const puntoFijo = z
  .number()
  .int('El encuadre debe ser un número entero')
  .min(0, 'El encuadre debe estar entre 0 y 100')
  .max(100, 'El encuadre debe estar entre 0 y 100')
  .optional()
  .nullable();

/** Ancho de la foto respecto al marco, en %; null o ausente = sin acercar */
const anchoRecorte = z
  .number()
  .int('El tamaño del recorte debe ser un número entero')
  .min(10, 'El tamaño del recorte debe estar entre 10 y 2000')
  .max(2000, 'El tamaño del recorte debe estar entre 10 y 2000')
  .optional()
  .nullable();

export const jugadorSchema = z.object({
  // Información personal (requerida)
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidos: z.string().min(1, 'Los apellidos son requeridos'),
  equipo_id: z.number().int().positive('Debe seleccionar un equipo'),
  // La primera es la principal; la API la copia a jugadores.posicion_id
  posiciones_ids: z.array(z.number().int().positive()).min(1, 'Elige al menos una posición'),

  // Información personal (opcional)
  fecha_nacimiento: z.string().optional().nullable(),
  // Listado cerrado: el formulario ofrece solo estas opciones
  nacionalidad: z.enum(NACIONALIDADES).optional().nullable(),
  dni: z.string().optional().nullable(),
  foto_url: z.url({ protocol: /^https?$/, error: 'Debe ser una URL válida' }).optional().nullable().or(z.literal('')),
  /** Recorte de la foto en la ficha del plantel */
  foto_foco_x: puntoFijo,
  foto_foco_y: puntoFijo,
  foto_foco_ancho: anchoRecorte,
  /** Recorte de la cara, para el avatar; independiente del de la ficha */
  foto_cara_x: puntoFijo,
  foto_cara_y: puntoFijo,
  foto_cara_ancho: anchoRecorte,

  // Información deportiva
  dorsal: z.number().int().min(1).max(99).optional().nullable(),
  altura_cm: z.number().int().min(100).max(250).optional().nullable(),
  peso_kg: z.number().min(30).max(200).optional().nullable(),
  pie_preferido: z.enum(['Derecho', 'Izquierdo', 'Ambidiestro']).optional().nullable(),

  // Información de contacto
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),

  // Información médica
  tipo_sangre: z.string().optional().nullable(),
  alergias: z.string().optional().nullable(),
  contacto_emergencia: z.string().optional().nullable(),
  telefono_emergencia: z.string().optional().nullable(),
  lesiones_cronicas: z.string().optional().nullable(),

  // Estado
  estado: z.enum(['Activo', 'Lesionado', 'Sancionado', 'Inactivo']).optional().nullable(),
  fecha_alta: z.string().optional().nullable(),
  fecha_baja: z.string().optional().nullable(),
  activo: z.boolean().optional().nullable(),
});

export type JugadorFormData = z.infer<typeof jugadorSchema>;

/** Ids de posición que llegan a la API, o undefined si el body no los trae */
export function parsePosiciones(valor: unknown): number[] | undefined {
  if (!Array.isArray(valor)) return undefined;
  return valor.map(Number).filter((n) => Number.isInteger(n) && n > 0);
}
