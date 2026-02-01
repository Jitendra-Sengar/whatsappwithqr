'use server'

import { sql } from '@/lib/db'
import { getSession, hashPassword, verifyPassword } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateOrganization(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  if (session.user.role !== 'owner' && session.user.role !== 'admin') {
    return { error: 'You do not have permission to update organization settings' }
  }
  
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  
  if (!name || !slug) {
    return { error: 'Name and slug are required' }
  }
  
  // Check if slug is taken by another tenant
  const existingTenant = await sql`
    SELECT id FROM tenants WHERE slug = ${slug} AND id != ${session.tenant.id}
  `
  
  if (existingTenant.length > 0) {
    return { error: 'This URL slug is already taken' }
  }
  
  await sql`
    UPDATE tenants 
    SET name = ${name}, slug = ${slug}, updated_at = NOW()
    WHERE id = ${session.tenant.id}
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'organization_updated', 'tenant', ${JSON.stringify({ name, slug })})
  `
  
  revalidatePath('/dashboard/settings', 'max')
  
  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  
  if (!name || !email) {
    return { error: 'Name and email are required' }
  }
  
  // Check if email is taken by another user
  if (email !== session.user.email) {
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${session.user.id}
    `
    
    if (existingUser.length > 0) {
      return { error: 'This email is already in use' }
    }
  }
  
  await sql`
    UPDATE users 
    SET name = ${name}, email = ${email}, updated_at = NOW()
    WHERE id = ${session.user.id}
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'profile_updated', 'user', ${JSON.stringify({ name, email })})
  `
  
  revalidatePath('/dashboard/settings', 'max')
  
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All password fields are required' }
  }
  
  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }
  
  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters' }
  }
  
  // Get current password hash
  const user = await sql`
    SELECT password_hash FROM users WHERE id = ${session.user.id}
  `
  
  if (user.length === 0) {
    return { error: 'User not found' }
  }
  
  // Verify current password
  const validPassword = await verifyPassword(currentPassword, user[0].password_hash)
  if (!validPassword) {
    return { error: 'Current password is incorrect' }
  }
  
  // Hash new password
  const newPasswordHash = await hashPassword(newPassword)
  
  await sql`
    UPDATE users 
    SET password_hash = ${newPasswordHash}, updated_at = NOW()
    WHERE id = ${session.user.id}
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'password_changed', 'user', '{}')
  `
  
  return { success: true }
}
