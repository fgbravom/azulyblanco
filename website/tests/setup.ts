import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

// Sin globals, Testing Library no desmonta solo lo renderizado entre pruebas
if (typeof document !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')
  afterEach(cleanup)
}

process.env.SESSION_SECRET = 'secreto-solo-para-pruebas-0123456789'

// Fuera de Next no existe el contexto de la petición: cookies() la simula
// tests/helpers/sesion.ts, y revalidatePath no tiene caché que invalidar.
vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
