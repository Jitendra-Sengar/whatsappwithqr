import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Webhook, MoreVertical, Trash2, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreateWebhookDialog } from "@/components/webhooks/create-webhook-dialog"
import { DeleteWebhookButton } from "@/components/webhooks/delete-webhook-button"

async function getWebhooks(tenantId: string) {
  const webhooks = await sql`
    SELECT * FROM webhooks 
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC
  `
  return webhooks
}

export default async function WebhooksPage() {
  const session = await getSession()
  if (!session) return null
  
  const webhooks = await getWebhooks(session.tenant.id)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Webhooks</h1>
          <p className="text-muted-foreground">
            Configure webhooks to receive real-time event notifications.
          </p>
        </div>
        <CreateWebhookDialog />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Webhooks</CardTitle>
          <CardDescription>
            Webhooks send HTTP POST requests to your server when events occur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Webhook className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No webhooks</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
                Create a webhook to receive real-time notifications for messages, status changes, and more.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook: any) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {webhook.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(webhook.events || []).slice(0, 2).map((event: string) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {(webhook.events || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{webhook.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                        {webhook.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(webhook.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DeleteWebhookButton webhookId={webhook.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Events</CardTitle>
          <CardDescription>
            Events that trigger webhook notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { event: 'message.received', description: 'New message received' },
              { event: 'message.sent', description: 'Message sent successfully' },
              { event: 'message.delivered', description: 'Message delivered to recipient' },
              { event: 'message.read', description: 'Message read by recipient' },
              { event: 'session.connected', description: 'WhatsApp session connected' },
              { event: 'session.disconnected', description: 'WhatsApp session disconnected' },
            ].map((item) => (
              <div key={item.event} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <code className="text-sm font-medium">{item.event}</code>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
