import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { neon } from '@neondatabase/serverless'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

const sql = neon(process.env.DATABASE_URL!)

async function getActivityLogs(tenantId: string) {
  return sql`
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.tenant_id = ${tenantId}
    ORDER BY al.created_at DESC
    LIMIT 100
  `
}

export default async function ActivityPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const activities = await getActivityLogs(user.tenant_id)
  
  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'bg-green-500/10 text-green-500'
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-500/10 text-red-500'
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-500/10 text-blue-500'
    return 'bg-muted text-muted-foreground'
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">Track all actions in your organization</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 100 actions across your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity recorded yet</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity: {
                id: string
                action: string
                resource_type: string
                resource_id: string
                user_name: string | null
                user_email: string
                ip_address: string | null
                created_at: string
              }) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Badge className={getActionColor(activity.action)}>
                    {activity.action}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {activity.user_name || activity.user_email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.resource_type} - {activity.resource_id}
                    </p>
                    {activity.ip_address && (
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {activity.ip_address}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
