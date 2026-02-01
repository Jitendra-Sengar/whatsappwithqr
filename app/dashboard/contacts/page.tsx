import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Phone, MessageCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function getContacts(tenantId: string) {
  const contacts = await sql`
    SELECT c.*, ws.name as session_name
    FROM contacts c
    JOIN whatsapp_sessions ws ON c.whatsapp_session_id = ws.id
    WHERE c.tenant_id = ${tenantId}
    ORDER BY c.updated_at DESC
    LIMIT 100
  `
  return contacts
}

export default async function ContactsPage() {
  const session = await getSession()
  if (!session) return null
  
  const contacts = await getContacts(session.tenant.id)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Contacts</h1>
          <p className="text-muted-foreground">
            Manage contacts from all your WhatsApp sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts..."
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
          <CardDescription>
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} across all sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No contacts yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
                Contacts will be automatically synced when you connect your WhatsApp sessions and start communicating.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact: any) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {(contact.name || contact.phone_number).slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {contact.name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {contact.phone_number}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.session_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(contact.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
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
