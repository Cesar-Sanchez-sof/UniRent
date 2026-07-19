import { AuthLayout } from "@/components/auth-layout"
import { RegisterForm } from "@/components/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Cuenta - UniRent",
  description: "Regístrate en UniRent y empieza a alquilar artículos entre universitarios.",
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
