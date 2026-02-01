import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Smartphone, MoreVertical, QrCode, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SessionActions } from "@/components/sessions/session-actions"

async function getSessions(tenantId: string) {
  const sessions = await sql`
    SELECT * FROM whatsapp_sessions 
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC
  `
  return sessions
}

export default async function SessionsPage() {
  const session = await getSession()
  if (!session) return null
  
  const sessions = await getSessions(session.tenant.id)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700 border-green-200'
      case 'connecting': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'qr_pending': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">WhatsApp Sessions</h1>
          <p className="text-muted-foreground">
            Manage your WhatsApp connections and QR code authentication.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sessions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>
      
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Smartphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No sessions yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
              Create your first WhatsApp session to start sending and receiving messages.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/sessions/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Session
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((sess: any) => (
            <Card key={sess.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{sess.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {sess.phone_number || 'No phone connected'}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/sessions/${sess.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/sessions/${sess.id}/qr`}>
                          <QrCode className="mr-2 h-4 w-4" />
                          Show QR Code
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <SessionActions sessionId={sess.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getStatusColor(sess.status)}>
                    {sess.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {sess.last_active 
                      ? `Active ${new Date(sess.last_active).toLocaleDateString()}`
                      : 'Never connected'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
