"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteWebhook } from "@/lib/actions/webhooks"

interface DeleteWebhookButtonProps {
  webhookId: string
}

export function DeleteWebhookButton({ webhookId }: DeleteWebhookButtonProps) {
  const router = useRouter()
  
  async function handleDelete() {
    if (confirm('Are you sure you want to delete this webhook?')) {
      await deleteWebhook(webhookId)
      router.refresh()
    }
  }
  
  return (
    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  )
}
