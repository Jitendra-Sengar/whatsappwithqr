import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Key, Copy, MoreVertical, Trash2 } from "lucide-react"
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
import { CreateApiKeyDialog } from "@/components/api-keys/create-api-key-dialog"
import { DeleteApiKeyButton } from "@/components/api-keys/delete-api-key-button"

async function getApiKeys(tenantId: string) {
  const keys = await sql`
    SELECT id, name, key_prefix, permissions, last_used_at, expires_at, created_at
    FROM api_keys 
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC
  `
  return keys
}

export default async function ApiKeysPage() {
  const session = await getSession()
  if (!session) return null
  
  const apiKeys = await getApiKeys(session.tenant.id)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access to your WhatsApp sessions.
          </p>
        </div>
        <CreateApiKeyDialog />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            API keys are used to authenticate requests to the Warest API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Key className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No API keys</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
                Create an API key to start integrating with our REST API.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key: any) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {key.key_prefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(key.permissions || ['read', 'write']).map((perm: string) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {key.last_used_at 
                        ? new Date(key.last_used_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DeleteApiKeyButton keyId={key.id} />
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
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use the Warest API to integrate WhatsApp messaging into your applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium text-foreground mb-2">Base URL</p>
            <code className="text-sm text-muted-foreground">
              https://api.warest.sengarinfotech.com/v1
            </code>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium text-foreground mb-2">Authentication Header</p>
            <code className="text-sm text-muted-foreground">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
