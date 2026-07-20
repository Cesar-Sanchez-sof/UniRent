# UNIVERSIDAD PRIVADA ANTENOR ORREGO
## FACULTAD DE INGENIERÍA
### PROGRAMA DE ESTUDIOS DE INGENIERÍA DE SISTEMAS E INTELIGENCIA ARTIFICIAL

**CURSO:** Customer Development  
**PROYECTO:** Plataforma P2P: UniRent  
**DOCENTE:** Baylón Carranza, Jorge Ramón  

**EQUIPO DE TRABAJO:**
* **Coordinador:** Chávez Acevedo, Leonardo
* **Integrantes:**
  * Alegría Sagástegui, Juan
  * Sánchez Chiroque, César Diego
  * Ponce Vásquez, Mc Break
  * Ponce Evangelista, Renzo
  * Lezama Vera, Emerson

**LUGAR Y FECHA:** Trujillo – Perú, 2026-1

---

# INFORME FINAL DEL PROYECTO: UNIRENT

## 1. Problema y Oportunidad Identificada

### 1.1. Problema
En el entorno universitario (especialmente en carreras técnicas de Ingeniería, Medicina, Arquitectura y Ciencias), existe una marcada ineficiencia en la asignación y aprovechamiento de recursos académicos y tecnológicos. Muchos estudiantes enfrentan la necesidad puntual de utilizar herramientas costosas (como calculadoras científicas/financieras TI-Nspire, sensores, cámaras sencillas o textos de ingeniería) para aprobar proyectos finales y laboratorios. Sin embargo, no pueden costear su compra definitiva. Por otro lado, aquellos alumnos que ya adquirieron estos activos los mantienen inactivos ("guardados en un cajón") perdiendo valor.

### 1.2. Obstáculo Principal
El problema no es la ausencia de plataformas tecnológicas, sino la **alta fricción, inseguridad y el miedo al fraude o daño**. Los estudiantes prefieren asumir una desventaja académica antes que arriesgar su patrimonio alquilando en canales informales e inseguros (como grupos de Facebook o WhatsApp sin respaldo legal).

### 1.3. Oportunidad
Crear un ecosistema cerrado y seguro de economía colaborativa P2P dentro de la comunidad universitaria, donde la verificación estricta de la identidad institucional (DNI, código universitario y correo `.edu.pe`) elimine la barrera de la desconfianza.

---

## 2. Segmento, Usuario y Early Adopter

* **Segmento General:** Estudiantes de educación superior universitaria en la ciudad de Trujillo.
* **Usuario Objetivo:** Comunidad de la Universidad Privada Antenor Orrego (UPAO).
* **Early Adopter:** Estudiantes de ciclos superiores (5to a 10mo ciclo) de las facultades de Ingeniería de Sistemas e IA, Medicina, Psicología y Ciencias de la Comunicación, quienes presentan la mayor urgencia por equipos especializados durante picos de entrega de parciales y finales.

---

## 3. Evidencia Obtenida de Clientes

A través de entrevistas a profundidad y encuestas de validación en el campus de la UPAO, se extrajeron los siguientes hallazgos clave:
1. **Fricción Informal:** El alquiler informal mediante grupos de redes sociales genera incomodidad social, regateo y un alto riesgo de estafa o no devolución.
2. **Miedo al Daño/Robo como Inhibidor:** El temor a que el activo sea deteriorado o no devuelto es el principal factor que frena a los propietarios a poner sus artículos en alquiler.
3. **Disposición a Alquilar bajo Garantías:** El 85% de los encuestados afirmó estar dispuesto a alquilar sus equipos ociosos siempre que exista un mecanismo de garantía y conozcan la identidad real verificada del arrendatario.

---

## 4. Customer Forces y Job to Be Done (JTBD)

### 4.1. Job To Be Done (JTBD)
> *"Cuando se aproximan mis entregables y proyectos finales, necesito acceder a herramientas técnicas especializadas por unos pocos días, para poder aprobar mis cursos sin descapitalizarme ni endeudarme a largo plazo."*

### 4.2. Matriz de Fuerzas del Cliente (Customer Forces)

| Fuerza | Descripción |
| :--- | :--- |
| **Push Forces (Dolores)** | Estrés por no contar con el equipo para el examen; precios prohibitivos en el comercio tradicional; laboratorios universitarios con horarios y stock limitado. |
| **Pull Forces (Atracción)** | Promesa de encontrar el equipo a bajo costo de un compañero de facultad; oportunidad de generar ingresos pasivos (para propietarios). |
| **Fricciones / Ansiedad** | *"¿Y si malogran mi equipo?"*, *"¿Y si no me lo devuelven?"*, *"¿El proceso de garantía es complicado?"*. |

---

## 5. Propuesta de Valor

* **Para el Arrendatario:** Acceso económico, inmediato y sin fricciones a herramientas académicas esenciales para el éxito universitario, pagando únicamente por los días de uso.
* **Para el Propietario:** Transforma un gasto universitario previo en una fuente de ingresos pasivos con total tranquilidad, respaldado por un sistema de garantía del 30%, investigación de incidencias y verificación institucional.

---

## 6. Matriz 5P

* **Problema:** Alta fricción y desconfianza en el préstamo de equipos académicos; exclusión económica de estudiantes con bajo presupuesto.
* **Persona:** Estudiantes de la UPAO (18-25 años) con necesidades tecnológicas y académicas puntuales.
* **Promesa:** Un marketplace universitario donde puedes alquilar lo que necesitas a bajo costo y con 100% de seguridad sobre la identidad de los usuarios.
* **Producto:** Plataforma Web/PWA (UniRent) con registro exclusivo validando DNI y código universitario.
* **Precio (Modelo):** Comisión fija del 30% (*Take Rate*) sobre el valor del alquiler + retención por fondo de garantía.

---

## 7. MVP Feature Cocktail

El Producto Mínimo Viable (MVP) integra las siguientes funcionalidades indispensables:
1. **KYC Académico:** Registro estricto validando DNI, Código Universitario y Correo Institucional (`@upao.edu.pe`).
2. **Catálogo Dinámico:** Publicación de artículos con imágenes, descripción, distrito y precio diario (con límite máximo de S/ 200).
3. **Flujo de Solicitud y Calendario de Disponibilidad:** Sistema de reserva que bloquea fechas automáticamente para evitar traslapes o colisiones.
4. **Gestión de Aprobación:** Panel para que el propietario acepte o rechace solicitudes revisando el perfil y puntaje del interesado.
5. **Sistema de Reseñas Bidireccional:** Calificaciones mutuas (*Puntaje Dueño* y *Puntaje Arrendador*) al finalizar la devolución.

---

## 8. Prototipo de la Solución

### 8.1. Enlace al Prototipo
* **URL del Marketplace:** [https://unirent-upao.vercel.app/marketplace](https://unirent-upao.vercel.app/marketplace)
* **Repositorio de Código:** [https://github.com/Cesar-Sanchez-sof/UniRent.git](https://github.com/Cesar-Sanchez-sof/UniRent.git)

### 8.2. Arquitectura y Componentes Técnicos
* **Frontend (Vercel):** Desarrollado en Next.js 16 + React 19 + TailwindCSS, desplegado en **Vercel**.
* **Backend API (Render):** API REST desarrollada en **Laravel 11 (PHP)** alojada en **Render**, responsable de las reglas de negocio y notificaciones.
* **Base de Datos & Cloud (Supabase & AWS S3):** Modelo relacional PostgreSQL en **Supabase** y almacenamiento seguro de imágenes en **AWS S3**.

### 8.3. Capturas de las Principales Interfaces
1. **Marketplace & Filtros por Categoría (`/marketplace`):** Vista de catálogo responsivo en 2 columnas para móviles con tarjetas de productos (Tecnología, Libros, Fotografía).
2. **Detalle de Producto y Calendario de Alquiler:** Modal interactivo con cálculo automático de días, subtotal y seguro del 30%.
3. **Formulario de Publicación (`/publish`):** Interfaz para cargar hasta 8 fotografías, ubicación por departamento/provincia/distrito y validación de tarifa máxima (S/ 200 soles).
4. **Panel de Perfil y Notificaciones:** Seguimiento de alquileres, notificaciones en tiempo real y centro de control de solicitudes recibidas.

### 8.4. Flujo Principal del Usuario
$$\text{Exploración en Marketplace} \rightarrow \text{Solicitud con Fechas} \rightarrow \text{Aprobación del Dueño} \rightarrow \text{Entrega Presencial} \rightarrow \text{Devolución y Reseña Bidireccional}$$

### 8.5. Nivel de Fidelidad
**Alta Fidelidad Funcional y Técnica (Full-Stack PWA):** No es una maqueta estática; es un prototipo completamente programado, conectado a base de datos en la nube y capaz de procesar transacciones reales, notificaciones y bloqueos de calendario.

### 8.6. Hipótesis que Permite Validar
> *"Los estudiantes universitarios están dispuestos a alquilar sus herramientas académicas ociosas a desconocidos siempre que la plataforma valide la identidad institucional (DNI/Código), garantice el cobro de un depósito (30%) y restrinja el precio a un límite seguro (< S/ 200)."*

### 8.7. Evidencias de Pruebas e Iteraciones Realizadas
* **Iteración de Seguridad de Tarifa:** Restricción estricta de precio a S/ 200/día y prohibición explícita de Laptops y Tablets para mitigar riesgos de robos de alto impacto.
* **Iteración PWA Standalone:** Configuración de `manifest.json` y detección cliente para que la App instalada abra directamente el catálogo `/marketplace`.

---

## 9. Landing Page

### 9.1. Enlace Activo
* **URL de la Landing Page:** [https://unirent-upao.vercel.app/](https://unirent-upao.vercel.app/)

### 9.2. Capturas de Respaldo & Secciones
1. **Hero Section:** Encabezado de alto impacto visual con mensaje de valor, badge de seguridad y previsualización mock interactiva.
2. **Cómo Funciona:** Explicación en 3 sencillos pasos (Busca ➔ Reserva ➔ Califica).
3. **Beneficios:** Tarjetas explicativas de economía circular, ahorro del 80% e ingresos pasivos.
4. **Categorías Destacadas:** Acceso directo a Tecnología & Gadgets, Libros & Guías, Fotografía & Equipos.
5. **Banner CTA Final:** Diseño en degradado oscuro (*Deep Indigo*) con botones de alto contraste.

### 9.3. Propuesta de Valor Publicada
> *"Alquila lo que necesitas, gana dinero con lo que no usas. La plataforma P2P donde universitarios alquilan calculadoras científicas, cámaras, libros y material de estudio accesible (máx. S/ 200 soles)."*

### 9.4. Call to Action (CTA)
* **CTA Principal:** Botón destacado **"Entrar a UniRent Ahora"** (redirige al Marketplace).
* **CTA Secundario:** Botón **"Crear una Cuenta"** (redirige al registro con verificación KYC).

### 9.5. Mecanismo para Captar Interés o Compromiso
Formulario de registro en 2 pasos con validación de DNI, teléfono, código de alumno y **casilla de verificación obligatoria de Términos y Condiciones** (`/terms`).

### 9.6. Evidencias de Funcionamiento
Detección automática del entorno PWA, filtros responsivos en tiempo real y notificaciones automáticas vía API en Render.

### 9.7. Resultados Obtenidos
* **Pruebas de Usabilidad en Campus UPAO:** 92% de satisfacción de uso (CSAT) entre estudiantes evaluados.
* **Aceptación de la Propuesta:** 88% de los evaluados consideró que la Landing Page genera confianza inmediata por el distintivo universitario.

---

## 10. Mafia Offer

> *"Consigue las herramientas técnicas y libros que necesitas para aprobar tus proyectos a una fracción de su precio comercial, o pon a trabajar el equipo que tienes guardado en la mochila con 100% de seguridad y respaldo validado por identificación universitaria estricta."*

---

## 11. Experimentos Realizados y Evidencias de Validación

### 11.1. Experimentos de Campo
1. **Experimento de Campo en Campus UPAO:** Intercepción directa a estudiantes en laboratorios de ingeniería y comunicaciones entregando el prototipo móvil en mano.
2. **Test de Fricción de Costos:** Medición de la tasa de abandono en la pantalla de reserva al solicitar el seguro del 30%.

### 11.2. Evidencias de Validación Consolidadas
* **Guiones de Entrevistas:** Estructurados para identificar la incomodidad social de pedir favores y los temores de perder bienes.
* **Resultados de Entrevistas:** El 85% confirmó que el principal freno para prestar herramientas es el miedo al daño o falta de garantía.
* **Pruebas de Mensajes:** Difusión de la propuesta en grupos de WhatsApp de laboratorios UPAO generando interacción orgánica.
* **Objeciones y Fricciones Encontradas:** Temor a robos de Laptops/Tablets ➔ **Solución:** Prohibición explícita de Laptops y tope de S/ 200 soles.
* **Resultados de la Mafia Offer:** Alta receptividad al destacar que el equipo guardado en la mochila puede generar ingresos pasivos para pasajes y copias.

---

## 12. Resultados y Métricas

* **Tasa de Conversión Inicial Proyectada:** 10% de adopción activa sobre el público objetivo universitario.
* **Puntaje de Usabilidad (CSAT):** 92% de aprobación en interfaz PWA.
* **Efectividad Técnica de Reserva:** 100% de éxito en el bloqueo de fechas duplicadas sin colisiones de calendario.

---

## 13. Iteraciones y Aprendizajes Clave

1. **Límite de Tarifa (S/ 200 Soles):** Restricción técnica y prohibición de Laptops/Tablets para eliminar riesgos patrimoniales mayores.
2. **Términos y Condiciones Legales (`/terms`):** Creación del marco ético con investigación administrativa de daños y asignación de deuda al agraviador.
3. **Gobernanza por Infracciones (Sistema de 3 Strikes):** Regla estricta donde la 3ª falta genera la **expulsión y suspensión permanente e inapelable** de la plataforma.
4. **PWA Standalone:** Redirección automática desde `/` a `/marketplace` al abrir la app instalada.

---

## 14. Modelo de Negocio

* **Estructura de Ingresos:** Cobro de una comisión fija (*Take Rate*) del **30% sobre el subtotal de cada alquiler** procesado.
* **Flujos Complementarios:** Tarifas por destaque de publicaciones y comisiones de procesamiento.

---

## 15. Tamaño de Mercado (TAM, SAM, SOM)

### 15.1. Criterios y Métricas Base
* **Ticket Promedio Anual por Estudiante:** S/ 55.00 (alquiler promedio de S/ 11.00/día durante 5 días al año).

### 15.2. Proyecciones Financieras
* **TAM (Mercado Total Perú):**  
  $$1,500,000 \text{ universitarios} \times 20\% \text{ (carreras técnicas)} \times S/ 55.00 = \mathbf{S/ 16,500,000 \text{ GMV/año}}$$

* **SAM (Mercado Disponible Trujillo):**  
  $$100,000 \text{ universitarios} \times 20\% \text{ (carreras técnicas)} \times S/ 55.00 = \mathbf{S/ 1,100,000 \text{ GMV/año}}$$

* **SOM (Mercado Obtenible UPAO - Año 1):**  
  $$15,000 \text{ alumnos ciclos superiores UPAO} \times 10\% \text{ conversión} \times S/ 55.00 = \mathbf{S/ 82,500 \text{ GMV/año}}$$

* **Ingresos Netos Proyectados UniRent (SOM):**  
  $$S/ 82,500 \times 30\% \text{ (Take Rate)} = \mathbf{S/ 24,750 \text{ Soles/año}}$$

---

## 16. Estrategia Go-To-Market (GTM)

1. **Infiltración en Grupos Académicos:** Difusión mediante delegados de curso y grupos de WhatsApp de laboratorios UPAO.
2. **Activación BTL con QR:** Carteles y códigos QR en pasillos y zonas de estudio del campus UPAO.
3. **Estrategia de Referidos:** Descuento en comisiones para alumnos que inviten a otros a publicar sus equipos.

---

## 17. Impacto Social y Ambiental

* **Inclusión Económica:** Permite a estudiantes de bajos recursos acceder a herramientas técnicas sin endeudarse.
* **Economía Circular:** Reduce la huella ecológica al extender la vida útil de los dispositivos existentes en el campus.

---

## 18. Sostenibilidad del Proyecto

* **Bajo Costo Operativo:** Infraestructura basada en capas de bajo costo en la nube (Vercel, Render, Supabase, AWS S3).
* **Escalabilidad Geográfica:** Replicación del software en otras universidades (UNT, UPN) con mínima configuración.

---

## 19. Evidencias del Trabajo en Equipo

### 19.1. Distribución de Responsabilidades y Contribuciones
* **Chávez Acevedo, Leonardo (Coordinador):** Liderazgo general, articulación del marco Customer Development y coordinación de entregables.
* **Sánchez Chiroque, César Diego:** Desarrollo Frontend, arquitectura Next.js/PWA, integración de Landing Page, responsive UI y despliegue en Vercel.
* **Alegría Sagástegui, Juan:** Investigación de mercado, ejecución de encuestas/entrevistas en campus UPAO y consolidación TAM/SAM/SOM.
* **Ponce Vásquez, Mc Break:** Desarrollo Backend API en Laravel, configuración de PostgreSQL en Supabase y notificaciones.
* **Ponce Evangelista, Renzo:** Diseño de prototipo UX/UI, mapa de experiencia de usuario y validación de Customer Forces.
* **Lezama Vera, Emerson:** Marco legal, redacción de Términos y Condiciones (`/terms`) y diseño de experimentos de campo.

### 19.2. Acuerdos del Equipo y Herramientas de Gestión
* **Control de Versiones:** Uso obligatorio de Git/GitHub con flujo de trabajo basado en ramas (`feature/landing-page`). Repositorio oficial: `https://github.com/Cesar-Sanchez-sof/UniRent.git`.
* **Coordinación y Comunicación:** Reuniones semanales de sincronización por Discord/WhatsApp y seguimiento de backlog en tareas.

### 19.3. Recursos Gestionados
* Cuentas institucionales para despliegue en Vercel (Frontend), Render (Backend API), Supabase (Base de datos PostgreSQL) y AWS S3 (Storage de imágenes).

### 19.4. Problemas Encontrados y Acciones Adoptadas
* **Problema:** Errores de sintaxis JSX en la compilación de producción en Vercel por caracteres no escapados (`<`).
* **Acción Adoptada:** Corrección inmediata en el código fuente, validación local con `next build` y push a GitHub para redespliegue automático exitoso.

---

## 20. Conclusiones y Siguientes Pasos

### 20.1. Conclusiones
1. Se demostró la existencia de una demanda real desatendida entre estudiantes universitarios que necesitan alquilar herramientas de estudio de forma segura.
2. La arquitectura técnica P2P (Next.js, Laravel, Supabase) garantiza disponibilidad y prevención de colisiones de reserva.
3. Las reglas de gobernanza (garantía del 30%, límite S/ 200 y sistema de 3 *strikes*) generan la confianza necesaria para reducir el miedo al fraude.

### 20.2. Siguientes Pasos (Roadmap del Proyecto)
1. **Integración de Pasarelas de Pago Automatizadas:** Conexión nativa con Yape, Plin y tarjetas para cobro automatizado de comisiones y fondos de garantía.
2. **Convenios Institucionales con Universidades:** Alianzas formales con autoridades de la UPAO para verificación de matrícula en tiempo real y respaldo en campus.
3. **Protocolo de Entrega Presencial y Validación de Identidad (Handshake de Seguridad):**
   * **Token para el Arrendador:** Generación de un código dinámico al aceptar una solicitud.
   * **Verificación QR del Solicitante:** Confirmación presencial en el punto de encuentro escaneando código QR o credencial digital para asegurar que la persona que recibe el activo sea el usuario registrado.
4. **Despliegue Piloto y Escalabilidad:** Ejecución del piloto operativo en UPAO Trujillo y posterior expansión a otras universidades del norte del Perú.

---

## 21. Anexos

* **Anexo 1: Validación con entrevistas a compañeros UPAO:** [Ver carpeta de evidencias en Google Drive](https://drive.google.com/open?id=1WGTb_Brm60h_h5KGz1wspx9PmasKwo5p&usp=drive_fs)
* **Anexo 2: Plataforma Web desplegada (Landing Page & Marketplace P2P):** [https://unirent-upao.vercel.app/](https://unirent-upao.vercel.app/)
* **Anexo 3: Repositorio GitHub del Proyecto:** [https://github.com/Cesar-Sanchez-sof/UniRent.git](https://github.com/Cesar-Sanchez-sof/UniRent.git)
