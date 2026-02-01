'use server'

import { sql } from '@/lib/db'
import { getSession, hashPassword } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function inviteTeamMember(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  // Check if user has permission
  if (session.user.role !== 'owner' && session.user.role !== 'admin') {
    return { error: 'You do not have permission to invite team members' }
  }
  
  const email = formData.get('email') as string
  const role = formData.get('role') as 'admin' | 'member'
  
  if (!email) {
    return { error: 'Email is required' }
  }
  
  // Check if email already exists in this tenant
  const existingUser = await sql`
    SELECT id FROM users WHERE email = ${email} AND tenant_id = ${session.tenant.id}
  `
  
  if (existingUser.length > 0) {
    return { error: 'User already exists in this organization' }
  }
  
  // Create pending user
  const tempPassword = crypto.randomBytes(16).toString('hex')
  const passwordHash = await hashPassword(tempPassword)
  
  await sql`
    INSERT INTO users (tenant_id, email, password_hash, name, role, status, email_verified)
    VALUES (${session.tenant.id}, ${email}, ${passwordHash}, ${email.split('@')[0]}, ${role}, 'pending', false)
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'user_invited', 'user', ${JSON.stringify({ email, role })})
  `
  
  revalidatePath('/dashboard/team', 'max')
  
  return { success: true }
}

export async function removeTeamMember(userId: string) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  // Check if user has permission
  if (session.user.role !== 'owner') {
    return { error: 'Only the owner can remove team members' }
  }
  
  // Cannot remove yourself
  if (userId === session.user.id) {
    return { error: 'You cannot remove yourself' }
  }
  
  await sql`
    DELETE FROM users WHERE id = ${userId} AND tenant_id = ${session.tenant.id}
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'user_removed', 'user', ${userId}, '{}')
  `
  
  revalidatePath('/dashboard/team', 'max')
  
  return { success: true }
}
