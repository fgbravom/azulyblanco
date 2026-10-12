import { z } from 'zod';

/** Mensaje del formulario público de contacto (app/contacto) */
export const contactoSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingresa tu nombre completo').max(120, 'El nombre es demasiado largo'),
  email: z.string().trim().max(200, 'El email es demasiado largo').email('Ingresa un email válido'),
  telefono: z.string().trim().max(40, 'El teléfono es demasiado largo').optional().or(z.literal('')),
  asunto: z.string().trim().min(2, 'Ingresa un asunto').max(150, 'El asunto es demasiado largo'),
  mensaje: z
    .string()
    .trim()
    .min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)')
    .max(5000, 'El mensaje es demasiado largo'),
});

/** Resultado del envío del formulario de contacto */
export interface EstadoContacto {
  ok: boolean;
  mensaje: string;
}
