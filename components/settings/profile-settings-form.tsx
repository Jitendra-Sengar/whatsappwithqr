"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions/settings"
import { Loader2 } from "lucide-react"
import type { User } from "@/lib/db"

interface ProfileSettingsFormProps {
  user: User
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const result = await updateProfile(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-lg">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-100 border border-green-200 px-4 py-3 text-sm text-green-700">
          Profile updated successfully!
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={user.name}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          required
        />
        <p className="text-xs text-muted-foreground">
          Changing your email will require verification.
        </p>
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  )
}
