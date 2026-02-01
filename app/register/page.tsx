import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"
import { AuthLayoutServer } from "@/components/auth/auth-layout-server"

export default async function RegisterPage() {
  try {
    const session = await getSession()
    
    if (session) {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("[v0] Register page session check error:", error)
    // Continue to render register page even if session check fails
  }
  
  return (
    <AuthLayoutServer 
      title="Start your journey"
      subtitle="Create your organization account"
    >
      <RegisterForm />
    </AuthLayoutServer>
  )
}
