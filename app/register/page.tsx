import { AuthLayout } from "@/components/auth-layout"
import { RegisterForm } from "@/components/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Cuenta - NexUs",
  description: "Registrate en NexUs y empieza a alquilar articulos entre universitarios.",
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
