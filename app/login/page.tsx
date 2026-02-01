import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { AuthLayoutServer } from "@/components/auth/auth-layout-server"

export default async function LoginPage() {
  try {
    const session = await getSession()
    
    if (session) {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("[v0] Login page session check error:", error)
    // Continue to render login page even if session check fails
  }
  
  return (
    <AuthLayoutServer 
      title="Welcome back"
      subtitle="Sign in to your Warest account"
    >
      <LoginForm />
    </AuthLayoutServer>
  )
}
