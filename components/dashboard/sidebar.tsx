"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { User, Tenant } from "@/lib/db"
import {
  MessageCircle,
  LayoutDashboard,
  Smartphone,
  Send,
  Users,
  Webhook,
  Key,
  Settings,
  CreditCard,
  FileText,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardSidebarProps {
  user: User
  tenant: Tenant
}

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sessions", href: "/dashboard/sessions", icon: Smartphone, badge: "Core" },
  { name: "Messages", href: "/dashboard/messages", icon: Send },
  { name: "Contacts", href: "/dashboard/contacts", icon: Users },
  { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
  { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
]

const managementNav = [
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const resourceNav = [
  { name: "Documentation", href: "/docs", icon: FileText, external: true },
  { name: "Support", href: "/support", icon: HelpCircle },
]

export function DashboardSidebar({ user, tenant }: DashboardSidebarProps) {
  const pathname = usePathname()
  
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">Warest</span>
          <span className="text-xs text-muted-foreground">by Sengar Infotech</span>
        </div>
      </div>
      
      {/* Tenant Selector */}
      <div className="border-b p-4">
        <button className="flex w-full items-center gap-3 rounded-lg bg-muted/50 p-3 text-left transition-colors hover:bg-muted">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
            {tenant.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-sm text-foreground">{tenant.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{tenant.plan} Plan</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Platform
            </p>
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
          
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Management
            </p>
            <ul className="space-y-1">
              {managementNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
          
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resources
            </p>
            <ul className="space-y-1">
              {resourceNav.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
