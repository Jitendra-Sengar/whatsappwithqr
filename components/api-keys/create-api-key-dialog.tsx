"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { createApiKey } from "@/lib/actions/api-keys"
import { Plus, Loader2, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateApiKeyDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [permissions, setPermissions] = useState<string[]>(['read', 'write'])
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    formData.set('permissions', JSON.stringify(permissions))
    
    const result = await createApiKey(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.key) {
      setNewKey(result.key)
      setLoading(false)
    }
  }

  function handleCopy() {
    if (newKey) {
      navigator.clipboard.writeText(newKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleClose() {
    setOpen(false)
    setNewKey(null)
    setError(null)
    setPermissions(['read', 'write'])
    router.refresh()
  }

  function togglePermission(perm: string) {
    setPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        {newKey ? (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription>
                Copy your API key now. You won&apos;t be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted p-3 text-sm break-all">
                  {newKey}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">
                  Make sure to copy your API key now. You won&apos;t be able to see it again!
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access.
              </DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Production API Key"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {['read', 'write', 'delete'].map((perm) => (
                    <div key={perm} className="flex items-center space-x-2">
                      <Checkbox
                        id={perm}
                        checked={permissions.includes(perm)}
                        onCheckedChange={() => togglePermission(perm)}
                      />
                      <label
                        htmlFor={perm}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {perm}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Key'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
