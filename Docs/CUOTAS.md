# Cuotas

> **Estado: oculto.** El sistema está construido y probado, pero el club no lo usa por ahora. Mientras `CUOTAS_HABILITADAS` no sea `true`, no aparece en el menú del admin, `/admin/cuotas` y `/cuotas/<código>` responden 404 y las server actions se niegan a correr. El código, las tablas y los datos se conservan.
>
> **Para activarlo:**
> 1. Confirmar que la migración `20260101000004_cuotas.sql` está aplicada (`npm run db:pendientes`) (ya se necesita para el plantel: deja la posición del jugador como opcional).
> 2. Revisar que los datos estén al día: el archivo de la Serie 35 llega hasta septiembre de 2026. Los meses que falten se generan con «Generar cuotas del mes» y los pagos se registran en cada celda.
> 3. Agregar `CUOTAS_HABILITADAS=true` en Vercel (Production) y en `website/.env.local`, y volver a desplegar (o reiniciar `npm run dev`).
> 4. En Cuotas → Configuración, escribir los datos de transferencia de cada serie antes de enviar links a los jugadores.
>
> Para ocultarlo de nuevo basta con quitar la variable: los links ya enviados dejan de funcionar hasta que se reactive.

`/admin/cuotas` lleva las cuotas mensuales de cada serie: quién pagó, quién debe y quién está exento. Cada jugador tiene además un link personal (`/cuotas/<código>`) para ver su estado de cuenta y los datos para pagar.

Hoy el pago es **manual**: el jugador transfiere o paga en efectivo y el tesorero lo registra en el admin. Más abajo están los pasos para sumar una pasarela (Mercado Pago o Flow) y cuentas de administrador individuales.

## Uso

1. **Configuración** (una vez por serie y temporada): monto de la cuota y datos para pagar (banco, cuenta, a quién enviar el comprobante). Los datos los ven los jugadores en su link.
2. **Generar cuotas del mes**: crea la cuota de cada jugador activo de la serie que aún no la tenga. Refuerzos, becados y lesionados quedan exentos de partida. Se puede volver a pulsar sin duplicar nada, por ejemplo después de sumar un jugador.
3. **Tocar una celda** para:
   - registrar un pago (total o abono parcial), con fecha, medio, n° de comprobante y quién lo registró;
   - anular un pago mal ingresado (queda en el historial como anulado, no se borra);
   - marcar una exención (lesión, ausente, retiro, refuerzo, becado, otro) o cambiar el monto de esa cuota (descuento puntual);
   - eliminar una cuota generada por error (solo si no tiene pagos válidos).
   
   Una celda vacía (—) también se puede tocar: la cuota se crea al registrar el pago o la exención.
4. **Tocar el nombre** del jugador para copiar su link personal, enviarlo por WhatsApp, generar uno nuevo (el anterior deja de funcionar) o cambiar su condición (regular, refuerzo, becado).

Colores de la grilla: verde pagada, ámbar abono parcial, rojo debe; celeste, violeta, morado y gris son exenciones. Los jugadores dados de baja aparecen tachados al final mientras tengan cuotas en el año.

## Modelo (migración `20260101000004_cuotas.sql`)

| Tabla / vista | Qué guarda |
|---|---|
| `equipos.cuota_monto`, `equipos.cuota_datos_pago` | Configuración de la serie en la temporada |
| `jugadores.cuota_condicion` | `regular`, `refuerzo` o `becado` |
| `jugadores.codigo_cuotas` | 32 caracteres hex aleatorios; la única llave del link personal |
| `cuotas` | Una por jugador y mes (`periodo` = día 1). `exencion` la saca de la deuda; el `monto` se conserva para que, al quitar la exención, la deuda vuelva |
| `pagos` | Abonos a una cuota. Solo los `aprobado` descuentan deuda |
| `vista_cuotas` | Cada cuota con `pagado`, `saldo` y `estado` (`pagada`, `parcial`, `pendiente`, `exenta`) |

Nada de esto es legible con la clave pública: RLS sin políticas en las tablas y `REVOKE` en las vistas. El admin (server actions en `app/(admin)/admin/cuotas/actions.ts`) y el link personal (`lib/cuotas/estado-cuenta.ts`) leen con la `service_role` desde el servidor. El link personal muestra solo nombre, serie, cuotas, pagos y datos de pago; nunca la ficha personal.

### Datos de la Serie 35

El plantel y las cuotas de marzo a septiembre de 2026 se cargan con `database/privado/serie35_cuotas_2026.sql`. Esa carpeta está en `.gitignore` porque el repositorio es público y el archivo trae nombres con deudas y lesiones. Se corre a mano en el SQL Editor después de la migración 004 (y en local después de cada `npm run db:reset`). No duplica nada si se vuelve a correr, y al final muestra los totales por mes para compararlos con la planilla.

## Mejora 1: pago online con Mercado Pago o Flow

El esquema ya lo contempla: `pagos.medio` acepta `mercadopago` y `flow`, `pagos.estado` tiene `pendiente` y `rechazado`, y `pagos.proveedor_id` guarda el id de la transacción (con índice).

1. **Cuenta y credenciales**
   - Mercado Pago: crear una aplicación en el panel de desarrolladores y obtener el `access token` (primero el de prueba). Variable `MERCADOPAGO_ACCESS_TOKEN`.
   - Flow: cuenta de comercio, `apiKey` y `secretKey` (sandbox en `sandbox.flow.cl`). Variables `FLOW_API_KEY` y `FLOW_SECRET_KEY`.
   - Las dos solo en el servidor (Vercel y `.env.local`), nunca con prefijo `NEXT_PUBLIC_`.
2. **Botón «Pagar» en el link personal**: una server action recibe el código del jugador y las cuotas a pagar, recalcula el monto en el servidor (nunca confiar en el que manda el navegador) e inserta un `pago` por cuota con `estado = 'pendiente'`, `medio` y una referencia común. Luego:
   - Mercado Pago: crea una *preferencia* de Checkout Pro con `external_reference` = esa referencia y `notification_url` = `/api/pagos/webhook/mercadopago`; redirige a `init_point`.
   - Flow: llama a `payment/create` (parámetros firmados con HMAC-SHA256 usando `secretKey`) con `commerceOrder` = la referencia y `urlConfirmation` = `/api/pagos/webhook/flow`; redirige a `url + "?token=" + token`.
3. **Webhook** `app/api/pagos/webhook/<proveedor>/route.ts`:
   - El middleware hoy cierra todas las `/api/*` sin sesión: hay que excluir `/api/pagos/webhook/` en `middleware.ts`.
   - No confiar en el cuerpo de la notificación: consultar el pago a la API del proveedor (Mercado Pago `GET /v1/payments/{id}`, Flow `payment/getStatus` con el token) y verificar la firma (`x-signature` en Mercado Pago).
   - Si está aprobado y el monto coincide: `UPDATE pagos SET estado = 'aprobado', proveedor_id = <id>` sobre los pagos de esa referencia. Rechazado: `estado = 'rechazado'`.
   - Debe ser idempotente: los proveedores reintentan la misma notificación.
4. **Página de retorno** (`/cuotas/<código>?pago=ok|error`) que muestre el resultado; la confirmación real llega por el webhook.
5. **Comisiones**: definir si el club las absorbe o se suman al monto. Los pagos `pendiente` que nunca se confirman se pueden limpiar con un cron.

Si un pago online cubre varios meses, se crean varios `pagos` con el mismo `proveedor_id` (por eso no es único).

## Mejora 2: cuentas de administrador con roles

Hoy hay una sola contraseña (`ADMIN_PASSWORD_HASH`) y una cookie firmada sin identidad. `pagos.registrado_por` es texto libre que el navegador recuerda; no es una auditoría confiable.

1. **Usuarios**: usar Supabase Auth (correo + contraseña o link mágico) en vez de la contraseña única. Tabla `admins (user_id UUID PK REFERENCES auth.users, nombre TEXT, rol TEXT, equipo_id BIGINT NULL)`.
2. **Roles sugeridos**
   | Rol | Puede |
   |---|---|
   | `admin` | Todo: contenido, plantel, series, cuotas de todas las series, gestionar admins |
   | `editor` | Contenido (portada, programación, noticias, galerías, imágenes) |
   | `tesorero` | Cuotas de su serie (`equipo_id`); ver el plantel de su serie |
   | `entrenador` | Plantel y datos de su serie |
3. **Sesión**: reemplazar `lib/auth/session.ts` y `lib/auth/token.ts` por el cliente SSR de Supabase (`@supabase/ssr`); `requireAdmin()` pasa a `requireRol(rol, equipoId?)` y devuelve el usuario. El middleware valida la sesión de Supabase.
4. **Auditoría**: agregar `pagos.registrado_por_id UUID REFERENCES auth.users` (y lo mismo en `cuotas` para exenciones) y llenarlo desde el servidor con el usuario de la sesión. Mantener `registrado_por` para los registros antiguos.
5. **Permisos en la base**: mientras las escrituras sigan pasando por server actions con `service_role`, el control vive en `requireRol`. Si más adelante el navegador consulta directo, agregar políticas RLS que lean `admins` (por ejemplo, un tesorero solo ve cuotas con su `equipo_id`).
6. **Barra lateral**: mostrar solo las secciones que el rol puede usar.
7. **Miembros**: si se quiere login para jugadores, la misma tabla de usuarios puede enlazarse a `jugadores` con un `user_id`; el link personal puede seguir existiendo como acceso sin contraseña.
