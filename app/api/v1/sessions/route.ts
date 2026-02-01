import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyApiKey } from '@/lib/actions/api-keys'

// GET /api/v1/sessions - List all sessions
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
  }
  
  const apiKey = authHeader.slice(7)
  const keyData = await verifyApiKey(apiKey)
  
  if (!keyData) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
  
  const sessions = await sql`
    SELECT id, session_id, name, phone_number, status, last_active, created_at, updated_at
    FROM whatsapp_sessions 
    WHERE tenant_id = ${keyData.tenant_id}
    ORDER BY created_at DESC
  `
  
  return NextResponse.json({ sessions })
}

// POST /api/v1/sessions - Create a new session
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
  }
  
  const apiKey = authHeader.slice(7)
  const keyData = await verifyApiKey(apiKey)
  
  if (!keyData) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
  
  if (!keyData.permissions.includes('write')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  
  const body = await request.json()
  const { name } = body
  
  if (!name) {
    return NextResponse.json({ error: 'Session name is required' }, { status: 400 })
  }
  
  const sessionId = `wa_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  const result = await sql`
    INSERT INTO whatsapp_sessions (tenant_id, session_id, name, status)
    VALUES (${keyData.tenant_id}, ${sessionId}, ${name}, 'disconnected')
    RETURNING id, session_id, name, status, created_at
  `
  
  return NextResponse.json({ session: result[0] }, { status: 201 })
}
