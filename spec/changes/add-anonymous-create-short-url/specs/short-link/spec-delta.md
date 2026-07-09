# Spec Delta: short-link

**Change:** add-anonymous-create-short-url
**Format:** EARS (`WHEN <trigger> the system SHALL <response>`)

## ADDED Requirements

### Requirement: Crear short URL para URL http/https válida

WHEN un usuario anónimo envía una URL con esquema `http://` o `https://` bien formada y pública, the system SHALL crear un registro `short_links` y responder con `{ shortCode, shortUrl, originalUrl, createdAt }` donde `shortCode` tiene exactamente 8 caracteres base62.

#### Scenario: Creación exitosa con http

- **WHEN** se recibe `POST /api/links` con `{ "url": "http://example.com/articulos/123" }`
- **THEN** el sistema responde `201` con un objeto cuyo `shortCode` tiene 8 caracteres del alfabeto base62 y `shortUrl` concatena el código al dominio del servicio.

#### Scenario: Creación exitosa con https

- **WHEN** se recibe `POST /api/links` con `{ "url": "https://example.com/ruta?q=1" }`
- **THEN** el sistema responde `201` con un `shortCode` válido de 8 caracteres y `originalUrl` idéntica a la enviada.

### Requirement: Idempotencia por URL original

WHEN un usuario anónimo envía una URL ya acortada previamente, the system SHALL devolver el mismo `shortCode` y `shortUrl` existentes sin crear un registro duplicado.

#### Scenario: Segunda petición devuelve el mismo short code

- **WHEN** se envía dos veces `POST /api/links` con la misma `originalUrl` válida
- **THEN** ambas respuestas contienen el mismo `shortCode` y la segunda NO crea un nuevo registro en `short_links`.

### Requirement: Rechazar URL no parseable

WHEN un usuario anónimo envía una cadena que no es parseable como URL, the system SHALL rechazar la petición con `400 Bad Request` y un mensaje de error tipado.

#### Scenario: Cadena no válida como URL

- **WHEN** se recibe `POST /api/links` con `{ "url": "no-es-una-url" }` o `{ "url": "" }`
- **THEN** el sistema responde `400` indicando que la URL no es válida y NO crea ningún registro.

### Requirement: Rechazar esquemas distintos de http/https

WHEN un usuario anónimo envía una URL con esquema diferente de `http://` o `https://` (p.ej. `ftp://`, `javascript:`, `data:`), the system SHALL rechazarla con `400 Bad Request` y mensaje de error específico de esquema no permitido.

#### Scenario: Esquema ftp rechazado

- **WHEN** se recibe `POST /api/links` con `{ "url": "ftp://example.com/file" }`
- **THEN** el sistema responde `400` con causa "scheme_not_allowed" y NO crea registro.

#### Scenario: Esquema javascript rechazado

- **WHEN** se recibe `POST /api/links` con `{ "url": "javascript:alert(1)" }`
- **THEN** el sistema responde `400` con causa "scheme_not_allowed" y NO crea registro.

### Requirement: Proteger contra SSRF bloqueando destinos locales/privados

WHEN un usuario anónimo envía una URL cuyo host resuelve a `localhost`, `127.0.0.1`, `::1` o a rangos de IP privadas (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0–172.31.255.255`), the system SHALL rechazarla con `400 Bad Request` y mensaje de error de destino no permitido.

#### Scenario: localhost bloqueado

- **WHEN** se recibe `POST /api/links` con `{ "url": "http://localhost:3000/admin" }`
- **THEN** el sistema responde `400` con causa "unsafe_target" y NO crea registro.

#### Scenario: IP privada 192.168 bloqueada

- **WHEN** se recibe `POST /api/links` con `{ "url": "http://192.168.1.1/" }`
- **THEN** el sistema responde `400` con causa "unsafe_target".

#### Scenario: IP privada 172.16 bloqueada

- **WHEN** se recibe `POST /api/links` con `{ "url": "http://172.16.5.4/" }`
- **THEN** el sistema responde `400` con causa "unsafe_target".

#### Scenario: IP privada 10.x bloqueada

- **WHEN** se recibe `POST /api/links` con `{ "url": "http://10.0.0.1/" }`
- **THEN** el sistema responde `400` con causa "unsafe_target".

#### Scenario: loopback IPv6 bloqueado

- **WHEN** se recibe `POST /api/links` con `{ "url": "http://[::1]/" }`
- **THEN** el sistema responde `400` con causa "unsafe_target".

### Requirement: Resolver colisiones de short code

WHEN el `shortCode` generado de 8 caracteres base62 ya existe en `short_links`, the system SHALL regenerar un nuevo `shortCode` y reintentar hasta obtener uno libre antes de crear el registro.

#### Scenario: Colisión resuelta con reintento

- **WHEN** el generador produce un `shortCode` ya presente en el repositorio
- **THEN** el sistema genera otro `shortCode` hasta encontrar uno libre y crea el registro con un código único de 8 caracteres.

### Requirement: Mostrar error inline accesible en la UI

WHEN el endpoint `POST /api/links` responde `400`, the system SHALL mostrar en la tool card un mensaje de error inline asociado al input vía `aria-describedby`, marcar el input en estado de error (borde rojo) y exponer el mensaje en una live region `aria-live="polite"`, sin perder el foco del teclado.

#### Scenario: Error inline tras URL inválida

- **WHEN** la UI recibe una respuesta `400` del endpoint tras enviar una URL inválida
- **THEN** el campo muestra borde rojo, un mensaje de error debajo enlazado por `aria-describedby`, y el mensaje se anuncia vía live region; el formulario permanece utilizable por teclado.

#### Scenario: Éxito muestra acciones Copy/Visit

- **WHEN** la UI recibe `201` con la short URL
- **THEN** se muestra la short URL con botones Copy (`btn-copy`) y Visit, y un botón "Shorten another" que resetea el formulario, según sección 4.1 de `docs/REQUISITOS.md`.
