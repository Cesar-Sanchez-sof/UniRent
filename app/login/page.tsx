import { AuthLayout } from "@/components/auth-layout"
import { LoginForm } from "@/components/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar Sesi\u00f3n - NexUs",
  description: "Accede a tu cuenta NexUs y alquila art\u00edculos entre universitarios.",
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
