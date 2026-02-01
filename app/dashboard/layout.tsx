import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session
  
  try {
    session = await getSession()
  } catch (error) {
    console.error("[v0] Dashboard layout session error:", error)
    redirect("/login")
  }
  
  if (!session) {
    redirect("/login")
  }
  
  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardSidebar user={session.user} tenant={session.tenant} />
      <div className="flex-1 flex flex-col lg:pl-72">
        <DashboardHeader user={session.user} tenant={session.tenant} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
