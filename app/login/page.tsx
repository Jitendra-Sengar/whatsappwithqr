import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default async function LoginPage() {
  const session = await getSession()
  
  if (session) {
    redirect("/dashboard")
  }
  
  return (
    <AuthLayout 
      title="Welcome back"
      subtitle="Sign in to your Warest account"
    >
      <LoginForm />
    </AuthLayout>
  )
}
