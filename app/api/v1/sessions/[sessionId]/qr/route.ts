import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyApiKey } from '@/lib/actions/api-keys'

// GET /api/v1/sessions/:sessionId/qr - Get QR code for session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
  }
  
  const apiKey = authHeader.slice(7)
  const keyData = await verifyApiKey(apiKey)
  
  if (!keyData) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
  
  const { sessionId } = await params
  
  // Get session
  const session = await sql`
    SELECT id, session_id, name, status, qr_code, phone_number
    FROM whatsapp_sessions 
    WHERE session_id = ${sessionId} AND tenant_id = ${keyData.tenant_id}
  `
  
  if (session.length === 0) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  
  const sess = session[0]
  
  if (sess.status === 'connected') {
    return NextResponse.json({ 
      status: 'connected',
      phone_number: sess.phone_number,
      message: 'Session is already connected'
    })
  }
  
  // In production, this would trigger QR code generation
  // via WhatsApp Web.js or Baileys
  
  // For demo, generate a placeholder QR indication
  if (!sess.qr_code) {
    // Update status to qr_pending
    await sql`
      UPDATE whatsapp_sessions 
      SET status = 'qr_pending', updated_at = NOW()
      WHERE id = ${sess.id}
    `
  }
  
  return NextResponse.json({
    session_id: sess.session_id,
    status: sess.status,
    qr_code: sess.qr_code || null,
    message: sess.qr_code 
      ? 'Scan this QR code with WhatsApp' 
      : 'QR code is being generated. Please try again in a few seconds.'
  })
}
