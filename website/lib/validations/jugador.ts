import { z } from 'zod';

export const jugadorSchema = z.object({
  // Información personal (requerida)
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidos: z.string().min(1, 'Los apellidos son requeridos'),
  equipo_id: z.number().int().positive('Debe seleccionar un equipo'),
  posicion_id: z.number().int().positive('Debe seleccionar una posición'),

  // Información personal (opcional)
  fecha_nacimiento: z.string().optional().nullable(),
  nacionalidad: z.string().optional().nullable(),
  dni: z.string().optional().nullable(),
  foto_url: z.string().url('Debe ser una URL válida').optional().nullable().or(z.literal('')),

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
