import { neon } from '@neondatabase/serverless'
import { headers } from 'next/headers'

const sql = neon(process.env.DATABASE_URL!)

export interface ApiAuthResult {
  success: boolean
  tenantId?: string
  userId?: string
  error?: string
}

export async function authenticateApiRequest(): Promise<ApiAuthResult> {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing or invalid authorization header' }
  }
  
  const apiKey = authHeader.substring(7)
  
  // Find API key and validate
  const keys = await sql`
    SELECT ak.tenant_id, ak.user_id, ak.expires_at
    FROM api_keys ak
    WHERE ak.key_hash = encode(sha256(${apiKey}::bytea), 'hex')
    AND ak.is_active = true
  `
  
  if (keys.length === 0) {
    return { success: false, error: 'Invalid API key' }
  }
  
  const key = keys[0]
  
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return { success: false, error: 'API key has expired' }
  }
  
  // Update last used timestamp
  await sql`
    UPDATE api_keys 
    SET last_used_at = NOW()
    WHERE key_hash = encode(sha256(${apiKey}::bytea), 'hex')
  `
  
  return {
    success: true,
    tenantId: key.tenant_id,
    userId: key.user_id
  }
}

export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status })
}

export function apiSuccess(data: unknown, status: number = 200) {
  return Response.json(data, { status })
}
