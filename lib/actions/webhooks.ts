'use server'

import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createWebhook(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  const url = formData.get('url') as string
  const secret = formData.get('secret') as string
  const eventsJson = formData.get('events') as string
  
  if (!url) {
    return { error: 'Webhook URL is required' }
  }
  
  const events = JSON.parse(eventsJson || '[]')
  
  if (events.length === 0) {
    return { error: 'At least one event is required' }
  }
  
  await sql`
    INSERT INTO webhooks (tenant_id, url, secret, events, status)
    VALUES (${session.tenant.id}, ${url}, ${secret || null}, ${events}, 'active')
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'webhook_created', 'webhook', ${JSON.stringify({ url, events })})
  `
  
  revalidatePath('/dashboard/webhooks', 'max')
  
  return { success: true }
}

export async function deleteWebhook(webhookId: string) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  await sql`
    DELETE FROM webhooks 
    WHERE id = ${webhookId} AND tenant_id = ${session.tenant.id}
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'webhook_deleted', 'webhook', ${webhookId}, '{}')
  `
  
  revalidatePath('/dashboard/webhooks', 'max')
}
