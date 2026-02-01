import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Smartphone,
  Send,
  Users,
  Activity,
  ArrowUpRight,
  Plus,
  Zap,
  TrendingUp,
  MessageCircle,
} from "lucide-react"

async function getDashboardStats(tenantId: string) {
  const [sessions, messages, contacts, recentActivity] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM whatsapp_sessions WHERE tenant_id = ${tenantId}`,
    sql`SELECT COUNT(*) as count FROM messages WHERE tenant_id = ${tenantId} AND created_at > NOW() - INTERVAL '30 days'`,
    sql`SELECT COUNT(*) as count FROM contacts WHERE tenant_id = ${tenantId}`,
    sql`
      SELECT action, resource_type, details, created_at 
      FROM activity_logs 
      WHERE tenant_id = ${tenantId} 
      ORDER BY created_at DESC 
      LIMIT 5
    `,
  ])
  
  return {
    totalSessions: Number(sessions[0]?.count || 0),
    totalMessages: Number(messages[0]?.count || 0),
    totalContacts: Number(contacts[0]?.count || 0),
    recentActivity: recentActivity as Array<{
      action: string
      resource_type: string
      details: Record<string, unknown>
      created_at: Date
    }>,
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null
  
  const stats = await getDashboardStats(session.tenant.id)
  
  const statCards = [
    {
      title: "Active Sessions",
      value: stats.totalSessions,
      description: "WhatsApp connections",
      icon: Smartphone,
      href: "/dashboard/sessions",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Messages (30d)",
      value: stats.totalMessages,
      description: "Sent and received",
      icon: Send,
      href: "/dashboard/messages",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Contacts",
      value: stats.totalContacts,
      description: "Total contacts",
      icon: Users,
      href: "/dashboard/contacts",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "API Calls (24h)",
      value: "Coming soon",
      description: "Requests made",
      icon: Activity,
      href: "/dashboard/api-keys",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]
  
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {session.user.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your WhatsApp sessions today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/docs">
              View API Docs
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/sessions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <Link
                href={stat.href}
                className="absolute inset-0"
              >
                <span className="sr-only">View {stat.title}</span>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link
              href="/dashboard/sessions/new"
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Create WhatsApp Session</p>
                <p className="text-sm text-muted-foreground">Connect a new phone number</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/api-keys"
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Generate API Key</p>
                <p className="text-sm text-muted-foreground">Create credentials for API access</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/webhooks"
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <MessageCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Setup Webhooks</p>
                <p className="text-sm text-muted-foreground">Receive real-time event notifications</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest actions in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.resource_type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground">
                  Activity will appear here as you use the platform
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Plan Banner */}
      {session.tenant.plan === 'free' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Upgrade to Professional</h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited sessions, priority support, and advanced features.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard/billing">
                View Plans
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
