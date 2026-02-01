import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyApiKey } from '@/lib/actions/api-keys'

// POST /api/v1/messages - Send a message
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
  const { session_id, to, message, type = 'text' } = body
  
  if (!session_id || !to || !message) {
    return NextResponse.json({ 
      error: 'session_id, to, and message are required' 
    }, { status: 400 })
  }
  
  // Verify session belongs to tenant
  const session = await sql`
    SELECT id, status FROM whatsapp_sessions 
    WHERE session_id = ${session_id} AND tenant_id = ${keyData.tenant_id}
  `
  
  if (session.length === 0) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  
  if (session[0].status !== 'connected') {
    return NextResponse.json({ 
      error: 'Session is not connected. Please scan QR code first.' 
    }, { status: 400 })
  }
  
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  // Store message
  const result = await sql`
    INSERT INTO messages (
      tenant_id, whatsapp_session_id, message_id, direction, 
      from_number, to_number, message_type, content, status
    )
    VALUES (
      ${keyData.tenant_id}, ${session[0].id}, ${messageId}, 'outbound',
      '', ${to}, ${type}, ${JSON.stringify({ text: message })}, 'pending'
    )
    RETURNING id, message_id, status, created_at
  `
  
  // In production, this would trigger the actual WhatsApp message sending
  // via the WhatsApp Web.js or Baileys library
  
  return NextResponse.json({ 
    message: {
      id: result[0].message_id,
      status: 'queued',
      to,
      created_at: result[0].created_at,
    }
  }, { status: 201 })
}

// GET /api/v1/messages - Get message history
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
  
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')
  
  let messages
  
  if (sessionId) {
    messages = await sql`
      SELECT m.*, ws.session_id as wa_session_id
      FROM messages m
      JOIN whatsapp_sessions ws ON m.whatsapp_session_id = ws.id
      WHERE m.tenant_id = ${keyData.tenant_id} AND ws.session_id = ${sessionId}
      ORDER BY m.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else {
    messages = await sql`
      SELECT m.*, ws.session_id as wa_session_id
      FROM messages m
      JOIN whatsapp_sessions ws ON m.whatsapp_session_id = ws.id
      WHERE m.tenant_id = ${keyData.tenant_id}
      ORDER BY m.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  }
  
  return NextResponse.json({ messages })
}
