import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Helper function for transactions
export async function withTransaction<T>(
  callback: (sql: ReturnType<typeof neon>) => Promise<T>
): Promise<T> {
  return callback(sql)
}

// Type definitions for database models
export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  settings: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

export interface User {
  id: string
  tenant_id: string
  email: string
  password_hash: string
  name: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'inactive' | 'pending'
  email_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface Session {
  id: string
  user_id: string
  tenant_id: string
  token: string
  expires_at: Date
  created_at: Date
}

export interface Subscription {
  id: string
  tenant_id: string
  plan: string
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  razorpay_subscription_id: string | null
  current_period_start: Date
  current_period_end: Date
  created_at: Date
  updated_at: Date
}

export interface WhatsAppSession {
  id: string
  tenant_id: string
  session_id: string
  name: string
  phone_number: string | null
  status: 'disconnected' | 'connecting' | 'connected' | 'qr_pending'
  qr_code: string | null
  last_active: Date | null
  created_at: Date
  updated_at: Date
}

export interface Message {
  id: string
  tenant_id: string
  whatsapp_session_id: string
  message_id: string
  direction: 'inbound' | 'outbound'
  from_number: string
  to_number: string
  message_type: string
  content: Record<string, unknown>
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  created_at: Date
}

export interface Contact {
  id: string
  tenant_id: string
  whatsapp_session_id: string
  phone_number: string
  name: string | null
  metadata: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

export interface ApiKey {
  id: string
  tenant_id: string
  name: string
  key_hash: string
  key_prefix: string
  permissions: string[]
  last_used_at: Date | null
  expires_at: Date | null
  created_at: Date
}
