'use server'

import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

function generateApiKey(): string {
  return `warest_${crypto.randomBytes(24).toString('hex')}`
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export async function createApiKey(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  const name = formData.get('name') as string
  const permissionsJson = formData.get('permissions') as string
  
  if (!name) {
    return { error: 'Key name is required' }
  }
  
  const permissions = JSON.parse(permissionsJson || '["read", "write"]')
  const key = generateApiKey()
  const keyHash = hashApiKey(key)
  const keyPrefix = key.slice(0, 12)
  
  await sql`
    INSERT INTO api_keys (tenant_id, name, key_hash, key_prefix, permissions)
    VALUES (${session.tenant.id}, ${name}, ${keyHash}, ${keyPrefix}, ${permissions})
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'api_key_created', 'api_key', ${JSON.stringify({ name })})
  `
  
  revalidatePath('/dashboard/api-keys', 'max')
  
  return { key }
}

export async function deleteApiKey(keyId: string) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  await sql`
    DELETE FROM api_keys 
    WHERE id = ${keyId} AND tenant_id = ${session.tenant.id}
  `
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'api_key_deleted', 'api_key', ${keyId}, '{}')
  `
  
  revalidatePath('/dashboard/api-keys', 'max')
}

export async function verifyApiKey(key: string) {
  const keyHash = hashApiKey(key)
  
  const result = await sql`
    SELECT ak.*, t.status as tenant_status
    FROM api_keys ak
    JOIN tenants t ON ak.tenant_id = t.id
    WHERE ak.key_hash = ${keyHash}
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
    AND t.status = 'active'
  `
  
  if (result.length === 0) {
    return null
  }
  
  const apiKey = result[0]
  
  // Update last used
  await sql`
    UPDATE api_keys SET last_used_at = NOW() WHERE id = ${apiKey.id}
  `
  
  return apiKey
}
