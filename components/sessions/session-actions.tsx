"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { RefreshCw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { restartSession, deleteSession } from "@/lib/actions/sessions"

interface SessionActionsProps {
  sessionId: string
}

export function SessionActions({ sessionId }: SessionActionsProps) {
  const router = useRouter()
  
  async function handleRestart() {
    await restartSession(sessionId)
    router.refresh()
  }
  
  async function handleDelete() {
    if (confirm('Are you sure you want to delete this session?')) {
      await deleteSession(sessionId)
      router.refresh()
    }
  }
  
  return (
    <>
      <DropdownMenuItem onClick={handleRestart}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Restart Session
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Session
      </DropdownMenuItem>
    </>
  )
}
