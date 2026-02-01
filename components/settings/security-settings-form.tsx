"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword } from "@/lib/actions/settings"
import { Loader2 } from "lucide-react"

export function SecuritySettingsForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const result = await changePassword(formData)
    
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
          Password changed successfully!
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters long.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
        />
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Changing...
          </>
        ) : (
          'Change Password'
        )}
      </Button>
    </form>
  )
}
