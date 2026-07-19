# UniRent - Sistema de Alquiler P2P Universitario (Documentación Técnica)

Este documento detalla el funcionamiento y la lógica técnica implementada en el proyecto UniRent para el manejo de alquileres, notificaciones y el sistema de confianza (reseñas).

## 🚀 Flujo del Ciclo de Alquiler

El sistema sigue un flujo circular que garantiza la seguridad de ambas partes:

1.  **Solicitud de Alquiler (Cliente):**
    *   El cliente selecciona un rango de fechas.
    *   **Validación de Traslape:** El sistema verifica que no existan alquileres en estado `Pendiente` o `Activo` en ese mismo rango. Si el dueño rechaza una solicitud (`Cancelado`), las fechas se liberan automáticamente.
    *   Se calcula el monto total y el seguro (30% del subtotal de días, excluyendo la garantía).
    *   Se envía una notificación al dueño.

2.  **Gestión de Solicitud (Dueño):**
    *   En la pestaña **"Solicitudes Recibidas"**, el dueño puede **Aceptar** (`Activo`) o **Rechazar** (`Cancelado`) el pedido.
    *   Si se acepta, el cliente recibe una notificación de confirmación.

3.  **Finalización del Servicio (Dueño):**
    *   Una vez que el producto es devuelto, el dueño marca el alquiler como **"Finalizado"**. Esto habilita la fase de calificación para ambas partes.

4.  **Sistema de Confianza Bidireccional:**
    *   **Cliente a Dueño:** El cliente califica el producto y la atención en "Mis Alquileres". Esta nota actualiza el `puntaje_dueno` del usuario propietario.
    *   **Dueño a Cliente:** El dueño califica el estado en que se devolvió el producto y la puntualidad en "Solicitudes Recibidas". Esta nota actualiza el `puntaje_arrendador` del cliente.
    *   Ambos puntajes son el promedio (`AVG`) de todas las reseñas recibidas en cada rol.

---

## 🛠️ Detalles Técnicos (Backend & Frontend)

### 📂 Estructura de la Tabla `reseña`
Se utiliza la tabla original del SQL con una columna lógica `tipo`:
*   `id_resena`: PK Autoincremental.
*   `calificacion`: Numeric (1.0 a 5.0).
*   `comentario`: Varchar (255).
*   `id_alquiler`: FK vinculada a la tabla `alquiler`.
*   `tipo`: Varchar (10) - Valores: `'cliente'` (califica al dueño) o `'dueno'` (califica al cliente).

### 🔗 Endpoints de Reseñas
*   `POST /api/resenas`: Guarda una reseña y actualiza el puntaje del usuario calificado en tiempo real usando una transacción de DB.
*   `GET /api/publicaciones/{id}/resenas`: Obtiene el historial de comentarios (solo tipo cliente) para mostrar en el detalle del producto.

### 📅 Lógica de Calendario y Disponibilidad
La disponibilidad se calcula filtrando solo los alquileres bloqueantes:
```php
whereIn('estado', ['Pendiente', 'Activo'])
```
Esto permite que si un dueño tiene varias solicitudes "Pendientes" para el mismo día, solo la primera que sea **Aceptada** bloquee definitivamente el calendario. Si una es **Rechazada**, el día vuelve a estar disponible inmediatamente.

---

## 👤 Manejo de Perfil
El usuario puede gestionar todo desde su panel:
*   **Configuración:** Cambio de datos personales, foto de perfil y contraseña.
*   **Mis Publicaciones:** CRUD de artículos, edición de precios y descripción.
*   **Mis Alquileres:** Seguimiento de pedidos realizados y botón para reseñar al dueño al finalizar.
*   **Solicitudes Recibidas:** Panel de control para el dueño para aceptar/rechazar y finalizar servicios.

---

## 🔔 Sistema de Notificaciones
*   **Polling:** El Header consulta cada 10 segundos si hay nuevas notificaciones.
*   **Tipos de Alerta:**
    *   Nuevas solicitudes para el dueño.
    *   Cambios de estado (Aceptado/Rechazado) para el cliente.
    *   Recordatorios de reseñas pendientes al finalizar un servicio.

---
**Desarrollado para:** UniRent P2P Renting System
**Fecha:** 10 de Marzo de 2026