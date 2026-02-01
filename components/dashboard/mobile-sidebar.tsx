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
} from "lucide-react"

interface MobileSidebarProps {
  user: User
  tenant: Tenant
}

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sessions", href: "/dashboard/sessions", icon: Smartphone },
  { name: "Messages", href: "/dashboard/messages", icon: Send },
  { name: "Contacts", href: "/dashboard/contacts", icon: Users },
  { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
  { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function MobileSidebar({ user, tenant }: MobileSidebarProps) {
  const pathname = usePathname()
  
  return (
    <div className="flex h-full flex-col">
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
      
      {/* Tenant */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
            {tenant.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-sm text-foreground">{tenant.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{tenant.plan} Plan</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
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
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* User */}
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
    </div>
  )
}
