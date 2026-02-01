"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteApiKey } from "@/lib/actions/api-keys"

interface DeleteApiKeyButtonProps {
  keyId: string
}

export function DeleteApiKeyButton({ keyId }: DeleteApiKeyButtonProps) {
  const router = useRouter()
  
  async function handleDelete() {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      await deleteApiKey(keyId)
      router.refresh()
    }
  }
  
  return (
    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete Key
    </DropdownMenuItem>
  )
}
