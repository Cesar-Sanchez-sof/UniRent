import { Leaf, Shield, HelpCircle } from "lucide-react"

const footerLinks = [
  {
    title: "Economía Circular",
    description: "Reutiliza, comparte y ahorra en campus",
    icon: Leaf,
    href: "#",
  },
  {
    title: "Seguro UniRent Protect",
    description: "Protección contra daños y robo",
    icon: Shield,
    href: "#",
  },
  {
    title: "Centro de Ayuda",
    description: "Resuelve tus dudas rápidamente",
    icon: HelpCircle,
    href: "#",
  },
]

export function UniRentFooter() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Links row */}
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {footerLinks.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.title}
                href={link.href}
                className="flex items-start gap-3 group"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {link.description}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px]">U</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {"© 2026 UniRent. Todos los derechos reservados."}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
            <a href="#" className="hover:text-foreground transition-colors">Terminos</a>
            <a href="https://wa.me/+51907905925" className="hover:text-foreground transition-colors">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
