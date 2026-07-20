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

            {/* CLÁUSULA 2 - INVESTIGACIÓN, RESPONSABILIDAD Y GENERACIÓN DE DEUDA */}
            <section className="space-y-3 bg-indigo-50/60 p-6 rounded-2xl border border-indigo-200/80">
              <div className="flex items-center gap-2 text-lg font-bold text-indigo-950">
                <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
                <h2>2. Investigación de Incidencias, Responsabilidad y Generación de Deuda</h2>
              </div>
              <p className="text-indigo-950 text-sm sm:text-base leading-relaxed">
                UniRent protege la integridad de los bienes de nuestra comunidad estudiantil. Ante cualquier reporte de daño, avería, no devolución o pérdida de un artículo durante el alquiler:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-indigo-900 text-xs sm:text-sm">
                <li><strong>Investigación por la Administración:</strong> Los administradores de UniRent llevarán a cabo una investigación exhaustiva e imparcial analizando las evidencias digitales, fotografías pre/post alquiler y testimonios de ambas partes.</li>
                <li><strong>Asignación de Responsabilidad y Generación de Deuda:</strong> Si de la investigación se determina la culpabilidad o negligencia de un usuario, <strong>se le generará automáticamente una deuda formal en la plataforma al usuario agraviador</strong>, equivalente al valor de reparación o reposición del bien afectado.</li>
                <li><strong>Obligatoriedad de Pago:</strong> La deuda generada deberá ser saldada de forma obligatoria para restituir el valor al propietario agraviado.</li>
              </ul>
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

            {/* CLÁUSULA 4 - OBLIGACIONES Y CONDUCTA */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Building className="h-5 w-5 text-indigo-600 shrink-0" />
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

            {/* CLÁUSULA 5 - FONDO DE GARANTÍA */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Lock className="h-5 w-5 text-emerald-600 shrink-0" />
                <h2>5. Fondo de Garantía (30%) y Gestión de Cancelaciones</h2>
              </div>
              <p>
                Para proteger la seriedad de las solicitudes, el sistema calcula automáticamente un monto del 30% en concepto de garantía sobre el subtotal de días de alquiler.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>Si una solicitud es rechazada o cancelada, las fechas se liberan automáticamente en la plataforma.</li>
                <li>En caso de traslapes o incumplimientos comprobados, la administración aplicará las retenciones administrativas correspondientes.</li>
              </ul>
            </section>

            {/* CLÁUSULA 6 - SISTEMA DE 3 INFRACCIONES (STRIKES) Y SUSPENSIÓN PERMANENTE */}
            <section className="space-y-3 bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
              <div className="flex items-center gap-2 text-lg font-bold text-amber-400">
                <Scale className="h-5 w-5 text-amber-400 shrink-0" />
                <h2>6. Política de 3 Infracciones (Sistema de Strikes) y Suspensión Definitiva</h2>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                Para mantener la confianza y seguridad de la comunidad universitaria, UniRent aplica una norma estricta de <strong>máximo tres (3) infracciones por usuario</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs sm:text-sm">
                <li><strong>Constituye Infracción:</strong> El retraso en la devolución de un artículo, la generación de deudas por daños o pérdidas, la acumulación de calificaciones bajas (&lt; 3.0 stars), o el maltrato verbal/difamatorio.</li>
                <li><strong>Acumulación de 3 Infracciones:</strong> Al incurrir en su <strong>tercera (3ª) infracción, el usuario será sancionado con la expulsión y bloqueo permanente de su cuenta de forma inapelable</strong>.</li>
                <li><strong>Prohibición Definitiva:</strong> No existirá posibilidad ni excepción alguna de reactivación; el usuario quedará inhabilitado de por vida para volver a alquilar o poner bienes en alquiler en UniRent.</li>
              </ul>
            </section>

            {/* CLÁUSULA 7 - ACEPTACIÓN */}
            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">7. Aceptación Expresa y Vinculante</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Al marcar la casilla *"Acepto los Términos y Condiciones"* durante el registro, el usuario declara haber leído, comprendido y aceptado la investigación de incidencias, la asignación de deudas al agraviador y la suspensión definitiva tras la 3ª infracción.
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
