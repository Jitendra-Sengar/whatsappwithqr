import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Inbox, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function getMessages(tenantId: string) {
  const messages = await sql`
    SELECT m.*, ws.name as session_name
    FROM messages m
    JOIN whatsapp_sessions ws ON m.whatsapp_session_id = ws.id
    WHERE m.tenant_id = ${tenantId}
    ORDER BY m.created_at DESC
    LIMIT 100
  `
  return messages
}

async function getMessageStats(tenantId: string) {
  const stats = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE direction = 'inbound') as inbound,
      COUNT(*) FILTER (WHERE direction = 'outbound') as outbound,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as today
    FROM messages 
    WHERE tenant_id = ${tenantId}
  `
  return stats[0] || { inbound: 0, outbound: 0, today: 0 }
}

export default async function MessagesPage() {
  const session = await getSession()
  if (!session) return null
  
  const [messages, stats] = await Promise.all([
    getMessages(session.tenant.id),
    getMessageStats(session.tenant.id),
  ])
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'read': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="text-muted-foreground">
          View and manage all messages across your WhatsApp sessions.
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inbound Messages
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Number(stats.inbound).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outbound Messages
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Number(stats.outbound).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today
            </CardTitle>
            <Send className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Number(stats.today).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>
            Latest messages across all your sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No messages yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
                Messages will appear here once you start sending and receiving through your WhatsApp sessions.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message: any) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      {message.direction === 'inbound' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          <ArrowDownLeft className="mr-1 h-3 w-3" />
                          In
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          Out
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{message.session_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {message.direction === 'inbound' ? message.from_number : message.to_number}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {message.content?.text || message.message_type}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(message.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
