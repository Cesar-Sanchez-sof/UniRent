"use client"

import Link from "next/link"
import { ArrowLeft, ShieldCheck, FileText, Lock, AlertTriangle, Scale, CheckCircle2, Building, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-slate-900">
            <span className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
              U
            </span>
            <span>Uni<span className="text-primary">Rent</span></span>
          </Link>

          <Button variant="ghost" asChild className="font-semibold text-slate-600 hover:text-slate-900">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a la página principal</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* CONTENT HERO */}
      <main className="py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>Documento Legal Oficial</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Términos y Condiciones de Uso de UniRent
          </h1>
          
          <p className="text-sm text-slate-500 font-medium border-b border-slate-100 pb-4">
            Última actualización: 10 de Marzo de 2026 | Aplicable a todos los usuarios de la plataforma P2P.
          </p>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-8">
            
            {/* CLÁUSULA 1 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Building className="h-5 w-5 text-primary shrink-0" />
                <h2>1. Naturaleza del Servicio e Intermediación P2P</h2>
              </div>
              <p>
                <strong>UniRent</strong> es una plataforma tecnológica independiente de economía colaborativa Peer-to-Peer (P2P) diseñada para conectar a estudiantes y miembros de la comunidad universitaria que desean alquilar bienes, herramientas y equipos.
              </p>
              <p>
                UniRent actúa <strong>exclusivamente como un canal tecnológico de intermediación</strong>. La plataforma no es propietaria, arrendadora, distribuidora ni poseedora directa de los artículos o productos publicados en el marketplace por los usuarios independientes.
              </p>
            </section>

            {/* CLÁUSULA 2 - PROTECCIÓN Y DESLINDE DE RESPONSABILIDAD DE LA ADMINISTRACIÓN */}
            <section className="space-y-3 bg-amber-50/60 p-6 rounded-2xl border border-amber-200/80">
              <div className="flex items-center gap-2 text-lg font-bold text-amber-900">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <h2>2. Exención y Limitación de Responsabilidad de la Administración</h2>
              </div>
              <p className="text-amber-950 text-sm sm:text-base">
                La administración y propietarios titulares de la plataforma <strong>UniRent quedan expresamente eximidos de cualquier responsabilidad civil, penal, laboral, tributaria o patrimonial</strong> por:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-amber-900 text-xs sm:text-sm">
                <li>Daños físicos, fallas mecánicas, averías o defectos preexistentes u ocasionados a los artículos alquilados durante o después del período de servicio.</li>
                <li>Pérdida, hurto, robo o no devolución del producto por parte del arrendatario o terceros.</li>
                <li>Uso indebido, ilícito o peligroso de los objetos alquilados a través de la plataforma.</li>
                <li>Incumplimiento de pactos personales, entregas fuera de fecha o disputas entre arrendador y arrendatario.</li>
              </ul>
              <p className="text-xs text-amber-900 font-semibold pt-2">
                * La responsabilidad directa recae únicamente sobre las partes contratantes (el usuario dueño y el usuario arrendatario).
              </p>
            </section>

            {/* CLÁUSULA 3 - LÍMITE DE TARIFA Y ARTÍCULOS PROHIBIDOS */}
            <section className="space-y-3 bg-red-50/60 p-6 rounded-2xl border border-red-200/80">
              <div className="flex items-center gap-2 text-lg font-bold text-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                <h2>3. Límite de Tarifa (S/ 200) y Artículos Prohibidos (Laptops y Tablets)</h2>
              </div>
              <p className="text-red-950 text-sm sm:text-base leading-relaxed">
                UniRent es un marketplace pensado para el acceso económico y seguro entre universitarios. Por políticas de seguridad de la plataforma:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-red-900 text-xs sm:text-sm">
                <li><strong>Límite Máximo de Tarifa:</strong> El precio de alquiler por día no podrá exceder de <strong>S/ 200 soles</strong>.</li>
                <li><strong>Artículos Estrictamente Prohibidos:</strong> Queda prohibida la publicación y alquiler de <strong>Laptops, Tablets, computadoras portátiles o cualquier dispositivo de costo elevado superior a S/ 200 soles</strong>.</li>
                <li><strong>Baja Automática:</strong> La administración se reserva la facultad de eliminar inmediatamente y sin previo aviso cualquier publicación que supere este límite de precio o incluya artículos restringidos.</li>
              </ul>
            </section>

            {/* CLÁUSULA 4 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
                <h2>4. Obligaciones de los Usuarios y Conducta Ética</h2>
              </div>
              <p>Al registrarse en UniRent, todo usuario se compromete bajo declaración jurada a:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>Proporcionar información veraz, incluyendo DNI, código universitario y teléfono activo.</li>
                <li>Publicar únicamente artículos permitidos (calculadoras, libros, cámaras sencillas y material de estudio accesible menor a S/ 200).</li>
                <li>Entregar los artículos en óptimo estado funcional y limpio, y devolverlos en las mismas condiciones al finalizar el servicio.</li>
                <li>Mantener una conducta respetuosa, ética y libre de acoso, difamación o engaño dentro del sistema de opiniones y notificaciones.</li>
              </ul>
            </section>

            {/* CLÁUSULA 4 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Lock className="h-5 w-5 text-emerald-600 shrink-0" />
                <h2>4. Fondo de Garantía (30%) y Gestión de Cancelaciones</h2>
              </div>
              <p>
                Para proteger la seriedad de las solicitudes, el sistema calcula automáticamente un monto del 30% en concepto de garantía sobre el subtotal de días de alquiler.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>Si una solicitud es rechazada o cancelada, las fechas se liberan automáticamente en la plataforma.</li>
                <li>En caso de traslapes o incumplimientos comprobados, la administración se reserva el derecho de aplicar retenciones administrativas conforme a las políticas del servicio.</li>
              </ul>
            </section>

            {/* CLÁUSULA 5 - DERECHOS DEL DUEÑO DE LA PLATAFORMA */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <DollarSign className="h-5 w-5 text-blue-600 shrink-0" />
                <h2>5. Tarifas, Comisiones y Propiedad Intelectual</h2>
              </div>
              <p>
                La administración de UniRent se reserva el derecho de establecer o modificar comisiones por servicio de intermediación tecnológica, mantenimiento de software y procesamiento de transacciones.
              </p>
              <p>
                Todos los derechos de propiedad intelectual, marcas, prototipo de alta fidelidad, logotipo, diseño de interfaz y código fuente son propiedad exclusiva de la titularidad de UniRent. Queda estrictamente prohibida su reproducción no autorizada.
              </p>
            </section>

            {/* CLÁUSULA 6 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Scale className="h-5 w-5 text-purple-600 shrink-0" />
                <h2>6. Suspensión de Cuentas y Cancelación Unilateral</h2>
              </div>
              <p>
                UniRent se reserva la facultad de <strong>suspender, bloquear o eliminar unilateralmente la cuenta de cualquier usuario</strong> que acumule calificaciones deficientes, cometa fraude, suplante identidades o viole los presentes términos, sin derecho a indemnización.
              </p>
            </section>

            {/* CLÁUSULA 7 */}
            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">7. Aceptación Expresa</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Al marcar la casilla *"Acepto los Términos y Condiciones"* durante el proceso de registro, el usuario declara haber leído, comprendido y aceptado en su totalidad las cláusulas legales y éticas aquí estipuladas.
              </p>
            </section>

          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Documento legal vinculante para UniRent P2P</span>
            </div>

            <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6">
              <Link href="/register">Ir al Registro</Link>
            </Button>
          </div>

        </div>

      </main>

      <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} UniRent. Todos los derechos reservados.
      </footer>
    </div>
  )
}
