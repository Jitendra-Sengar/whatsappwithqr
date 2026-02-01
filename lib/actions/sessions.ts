'use server'

import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function createSession(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  const name = formData.get('name') as string
  
  if (!name) {
    return { error: 'Session name is required' }
  }
  
  const sessionId = `wa_${crypto.randomBytes(8).toString('hex')}`
  
  await sql`
    INSERT INTO whatsapp_sessions (tenant_id, session_id, name, status)
    VALUES (${session.tenant.id}, ${sessionId}, ${name}, 'disconnected')
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'session_created', 'whatsapp_session', ${sessionId}, ${JSON.stringify({ name })})
  `
  
  revalidatePath('/dashboard/sessions', 'max')
  redirect('/dashboard/sessions')
}

export async function restartSession(sessionId: string) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  await sql`
    UPDATE whatsapp_sessions 
    SET status = 'connecting', updated_at = NOW()
    WHERE id = ${sessionId} AND tenant_id = ${session.tenant.id}
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'session_restarted', 'whatsapp_session', ${sessionId}, '{}')
  `
  
  revalidatePath('/dashboard/sessions', 'max')
}

export async function deleteSession(sessionId: string) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  await sql`
    DELETE FROM whatsapp_sessions 
    WHERE id = ${sessionId} AND tenant_id = ${session.tenant.id}
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'session_deleted', 'whatsapp_session', ${sessionId}, '{}')
  `
  
  revalidatePath('/dashboard/sessions', 'max')
}

export async function getQRCode(sessionId: string) {
  const session = await getSession()
  if (!session) return null
  
  const result = await sql`
    SELECT qr_code FROM whatsapp_sessions 
    WHERE id = ${sessionId} AND tenant_id = ${session.tenant.id}
  `
  
  return result[0]?.qr_code || null
}
