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
import { createWebhook } from "@/lib/actions/webhooks"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const availableEvents = [
  'message.received',
  'message.sent',
  'message.delivered',
  'message.read',
  'session.connected',
  'session.disconnected',
]

export function CreateWebhookDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<string[]>(['message.received'])
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    formData.set('events', JSON.stringify(events))
    
    const result = await createWebhook(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setEvents(['message.received'])
      router.refresh()
    }
  }

  function toggleEvent(event: string) {
    setEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Webhook
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>
            Configure a new webhook endpoint to receive event notifications.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://your-server.com/webhook"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret">Secret (optional)</Label>
            <Input
              id="secret"
              name="secret"
              type="password"
              placeholder="Used to sign webhook payloads"
            />
          </div>
          <div className="space-y-2">
            <Label>Events</Label>
            <div className="grid gap-2">
              {availableEvents.map((event) => (
                <div key={event} className="flex items-center space-x-2">
                  <Checkbox
                    id={event}
                    checked={events.includes(event)}
                    onCheckedChange={() => toggleEvent(event)}
                  />
                  <label
                    htmlFor={event}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {event}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || events.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Webhook'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
