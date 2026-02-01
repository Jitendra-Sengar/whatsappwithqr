"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerAction } from "@/lib/actions/auth"
import { Loader2, Mail, Lock, User, Building2, ArrowRight, Check } from "lucide-react"

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await registerAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="tenantName" className="text-sm font-medium">
          Organization name
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="tenantName"
            name="tenantName"
            type="text"
            placeholder="Acme Corporation"
            required
            className="pl-10 h-11"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Your name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            className="pl-10 h-11"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Work email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            className="pl-10 h-11"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            required
            minLength={8}
            className="pl-10 h-11"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-11 gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create organization
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      
      <div className="space-y-3 pt-2">
        <p className="text-xs text-muted-foreground font-medium">What you get with Warest:</p>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>Multi-session WhatsApp management</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>Full REST API access</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>Webhook integrations</span>
          </div>
        </div>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
