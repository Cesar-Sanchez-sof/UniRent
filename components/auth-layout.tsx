"use client"

import Image from "next/image"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left panel - Hero */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden">
        <Image
          src="/images/login-hero.jpg"
          alt="Campus universitario"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-primary-foreground">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10">
              <span className="text-primary-foreground font-bold text-base">U</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-foreground">
              Uni<span className="text-primary-foreground/80">Rent</span>
            </span>
          </a>

          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-primary-foreground leading-tight text-balance">
                {"La comunidad universitaria que comparte y ahorra"}
              </h2>
              <p className="text-primary-foreground/70 mt-3 text-base leading-relaxed max-w-md">
                {"Alquila lo que necesitas de otros estudiantes cerca de ti. Ahorra dinero, reduce el desperdicio."}
              </p>
            </div>

            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold text-primary-foreground">2,400+</p>
                <p className="text-sm text-primary-foreground/70 mt-1">Estudiantes activos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary-foreground">5,800+</p>
                <p className="text-sm text-primary-foreground/70 mt-1">{"Art\u00edculos disponibles"}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary-foreground">98%</p>
                <p className="text-sm text-primary-foreground/70 mt-1">{"Satisfacci\u00f3n"}</p>
              </div>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-6 border border-primary-foreground/10">
              <p className="text-base leading-relaxed text-primary-foreground/90">
                {'"Alquil\u00e9 una c\u00e1mara DSLR para un proyecto de la uni y me ahorr\u00e9 m\u00e1s de $200.000. La entrega fue en el mismo campus."'}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">MC</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-foreground">{"Mar\u00eda C."}</p>
                  <p className="text-xs text-primary-foreground/60">Ing. Industrial, 6to semestre</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-4 w-4 text-[oklch(0.85_0.18_85)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-border">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">U</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Uni<span className="text-primary">Rent</span>
            </span>
          </a>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            Volver al inicio
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-8 lg:px-10 xl:px-20">
          {children}
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <p>{"UniRent 2026. Todos los derechos reservados."}</p>
          <div className="hidden sm:flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Ayuda</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
            <a href="#" className="hover:text-foreground transition-colors">{"T\u00e9rminos"}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
