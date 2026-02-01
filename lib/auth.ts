import { sql, type User, type Tenant, type Session } from './db'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Password hashing using crypto (bcrypt alternative for edge)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

// Session token generation
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Create session
export async function createSession(userId: string, tenantId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  
  await sql`
    INSERT INTO sessions (user_id, tenant_id, token, expires_at)
    VALUES (${userId}, ${tenantId}, ${token}, ${expiresAt})
  `
  
  return token
}

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
}

// Get current session
export async function getSession(): Promise<{
  user: User
  tenant: Tenant
  session: Session
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  if (!token) return null
  
  const result = await sql`
    SELECT 
      s.id as session_id, s.token, s.expires_at,
      u.id as user_id, u.email, u.name, u.role, u.status as user_status, u.email_verified,
      t.id as tenant_id, t.name as tenant_name, t.slug, t.plan, t.status as tenant_status, t.settings
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN tenants t ON s.tenant_id = t.id
    WHERE s.token = ${token}
    AND s.expires_at > NOW()
    AND u.status = 'active'
    AND t.status = 'active'
  `
  
  if (result.length === 0) return null
  
  const row = result[0]
  
  return {
    session: {
      id: row.session_id,
      user_id: row.user_id,
      tenant_id: row.tenant_id,
      token: row.token,
      expires_at: row.expires_at,
      created_at: new Date(),
    },
    user: {
      id: row.user_id,
      tenant_id: row.tenant_id,
      email: row.email,
      password_hash: '',
      name: row.name,
      role: row.role,
      status: row.user_status,
      email_verified: row.email_verified,
      created_at: new Date(),
      updated_at: new Date(),
    },
    tenant: {
      id: row.tenant_id,
      name: row.tenant_name,
      slug: row.slug,
      plan: row.plan,
      status: row.tenant_status,
      settings: row.settings || {},
      created_at: new Date(),
      updated_at: new Date(),
    },
  }
}

// Clear session
export async function clearSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
  }
  
  cookieStore.delete('session')
}

// Register new tenant and owner
export async function registerTenant(
  tenantName: string,
  email: string,
  password: string,
  userName: string
): Promise<{ tenant: Tenant; user: User }> {
  const slug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  const passwordHash = await hashPassword(password)
  
  // Check if email already exists
  const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
  if (existingUser.length > 0) {
    throw new Error('Email already registered')
  }
  
  // Check if slug already exists
  const existingTenant = await sql`SELECT id FROM tenants WHERE slug = ${slug}`
  if (existingTenant.length > 0) {
    throw new Error('Organization name already taken')
  }
  
  // Create tenant
  const tenantResult = await sql`
    INSERT INTO tenants (name, slug, plan, status)
    VALUES (${tenantName}, ${slug}, 'free', 'active')
    RETURNING *
  `
  const tenant = tenantResult[0] as Tenant
  
  // Create user as owner
  const userResult = await sql`
    INSERT INTO users (tenant_id, email, password_hash, name, role, status, email_verified)
    VALUES (${tenant.id}, ${email}, ${passwordHash}, ${userName}, 'owner', 'active', false)
    RETURNING *
  `
  const user = userResult[0] as User
  
  // Create free subscription
  await sql`
    INSERT INTO subscriptions (tenant_id, plan, status, current_period_start, current_period_end)
    VALUES (${tenant.id}, 'free', 'active', NOW(), NOW() + INTERVAL '100 years')
  `
  
  // Log activity
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${tenant.id}, ${user.id}, 'tenant_created', 'tenant', ${JSON.stringify({ tenant_name: tenantName })})
  `
  
  return { tenant, user }
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; tenant: Tenant }> {
  const result = await sql`
    SELECT u.*, t.name as tenant_name, t.slug, t.plan, t.status as tenant_status, t.settings
    FROM users u
    JOIN tenants t ON u.tenant_id = t.id
    WHERE u.email = ${email}
  `
  
  if (result.length === 0) {
    throw new Error('Invalid credentials')
  }
  
  const row = result[0]
  
  if (row.status !== 'active') {
    throw new Error('Account is not active')
  }
  
  if (row.tenant_status !== 'active') {
    throw new Error('Organization is not active')
  }
  
  const validPassword = await verifyPassword(password, row.password_hash)
  if (!validPassword) {
    throw new Error('Invalid credentials')
  }
  
  const user: User = {
    id: row.id,
    tenant_id: row.tenant_id,
    email: row.email,
    password_hash: row.password_hash,
    name: row.name,
    role: row.role,
    status: row.status,
    email_verified: row.email_verified,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
  
  const tenant: Tenant = {
    id: row.tenant_id,
    name: row.tenant_name,
    slug: row.slug,
    plan: row.plan,
    status: row.tenant_status,
    settings: row.settings || {},
    created_at: new Date(),
    updated_at: new Date(),
  }
  
  // Log activity
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${tenant.id}, ${user.id}, 'user_login', 'user', ${JSON.stringify({ email })})
  `
  
  return { user, tenant }
}

// Invite team member
export async function inviteTeamMember(
  tenantId: string,
  inviterId: string,
  email: string,
  role: 'admin' | 'member'
): Promise<void> {
  const existingUser = await sql`
    SELECT id FROM users WHERE email = ${email} AND tenant_id = ${tenantId}
  `
  
  if (existingUser.length > 0) {
    throw new Error('User already exists in this organization')
  }
  
  // Create pending user
  const tempPassword = crypto.randomBytes(16).toString('hex')
  const passwordHash = await hashPassword(tempPassword)
  
  await sql`
    INSERT INTO users (tenant_id, email, password_hash, name, role, status, email_verified)
    VALUES (${tenantId}, ${email}, ${passwordHash}, ${email.split('@')[0]}, ${role}, 'pending', false)
  `
  
  // Log activity
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${tenantId}, ${inviterId}, 'user_invited', 'user', ${JSON.stringify({ email, role })})
  `
}
