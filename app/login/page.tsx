import { AuthLayout } from "@/components/auth-layout"
import { LoginForm } from "@/components/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar Sesión - UniRent",
  description: "Accede a tu cuenta UniRent y alquila artículos entre universitarios.",
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
