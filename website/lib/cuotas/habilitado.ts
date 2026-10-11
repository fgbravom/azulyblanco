/**
 * El sistema de cuotas está oculto hasta que el club decida usarlo
 * (ver docs/CUOTAS.md). Se activa con CUOTAS_HABILITADAS=true.
 */
export function cuotasHabilitadas() {
  return process.env.CUOTAS_HABILITADAS === 'true'
}
