import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default async function RegisterPage() {
  const session = await getSession()
  
  if (session) {
    redirect("/dashboard")
  }
  
  return (
    <AuthLayout 
      title="Start your journey"
      subtitle="Create your organization account"
    >
      <RegisterForm />
    </AuthLayout>
  )
}
