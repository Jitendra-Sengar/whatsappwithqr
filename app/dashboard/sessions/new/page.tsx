import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewSessionForm } from "@/components/sessions/new-session-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewSessionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/sessions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Session</h1>
          <p className="text-muted-foreground">
            Set up a new WhatsApp session for your organization.
          </p>
        </div>
      </div>
      
      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              Give your session a name to identify it easily.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewSessionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
