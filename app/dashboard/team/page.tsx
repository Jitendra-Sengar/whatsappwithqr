import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, MoreVertical, Mail, Shield } from "lucide-react"
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
import { InviteTeamDialog } from "@/components/team/invite-team-dialog"

async function getTeamMembers(tenantId: string) {
  const members = await sql`
    SELECT id, email, name, role, status, created_at
    FROM users 
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at ASC
  `
  return members
}

export default async function TeamPage() {
  const session = await getSession()
  if (!session) return null
  
  const members = await getTeamMembers(session.tenant.id)
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team</h1>
          <p className="text-muted-foreground">
            Manage team members and their access permissions.
          </p>
        </div>
        {(session.user.role === 'owner' || session.user.role === 'admin') && (
          <InviteTeamDialog />
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? 's' : ''} in {session.tenant.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleColor(member.role)}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(member.status)}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {member.id !== session.user.id && session.user.role === 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Overview of what each role can do.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                  Owner
                </Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Full access to all features</li>
                <li>Manage billing and subscriptions</li>
                <li>Invite and remove team members</li>
                <li>Delete organization</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                  Admin
                </Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Manage sessions and API keys</li>
                <li>Configure webhooks</li>
                <li>Invite team members</li>
                <li>View analytics</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                  Member
                </Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Use existing sessions</li>
                <li>Send and receive messages</li>
                <li>View contacts</li>
                <li>View own API keys</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
