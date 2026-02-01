"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { User, Tenant } from "@/lib/db"
import { logoutAction } from "@/lib/actions/auth"
import {
  Bell,
  Search,
  Menu,
  Settings,
  LogOut,
  User as UserIcon,
  HelpCircle,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "./mobile-sidebar"

interface DashboardHeaderProps {
  user: User
  tenant: Tenant
}

export function DashboardHeader({ user, tenant }: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <MobileSidebar user={user} tenant={tenant} />
        </SheetContent>
      </Sheet>
      
      {/* Search */}
      <div className="flex-1 flex items-center gap-4">
        <div className="relative hidden md:block w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sessions, messages, contacts..."
            className="pl-9 bg-muted/50 border-0 focus-visible:bg-background"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Help */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <span className="hidden md:block text-sm font-medium">
                {user.name.split(' ')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logoutAction}>
                <button type="submit" className="flex w-full items-center text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
